<template>
    <div class="snow-page">
        <a-spin :loading="loading" tip="loading...">
            <a-card :bordered="false">
                <a-row align="center">
                    <a-col :span="isMobile ? 24 : 2">
                        <div class="avatar-container" :class="{ 'mobile-avatar': isMobile }">
                            <a-avatar :size="isMobile ? 80 : 100" @click="showAvatarUpload" trigger-type="mask" :imageUrl="userInfo.avatar">
                                <template #trigger-icon>
                                    <IconEdit />
                                </template>
                            </a-avatar>
                        </div>
                    </a-col>
                    <a-col :span="isMobile ? 24 : 22">
                        <a-space direction="vertical" size="large">
                            <a-descriptions :data="detail" :column="isMobile ? 1 : 4" title="用户资料" :align="{ label: isMobile ? 'left' : 'right' }">
                                <template #value="{ value, data }">
                                    <span v-if="data.key === 'roles'">
                                        {{Array.isArray(value) && value.map((curr: any) => curr.name).join(",") || '-'}}
                                    </span>
                                    <span v-else-if="data.key == 'status'">
                                        {{ value === 1 ? "启用" : "禁用" }}
                                    </span>
                                    <span v-else-if="data.key == 'sex'">
                                        {{ getSexName(value) }}
                                    </span>
                                    <span v-else-if="data.key == 'createTime'">
                                        {{ formatTime(value) }}
                                    </span>
                                    <span v-else>{{ value }}</span>
                                </template>
                            </a-descriptions>
                        </a-space>
                    </a-col>
                </a-row>
            </a-card>
            <a-card class="margin-top" :bordered="false">
                <a-row align="center">
                    <a-col :span="24">
                        <a-tabs :type="type" :size="size" :active-key="activeTabs" @change="onChangeTab">
                            <a-tab-pane key="1" title="基本信息">
                                <BasicInfo v-model="userInfo" @refresh="refresh" />
                            </a-tab-pane>
                            <a-tab-pane key="2" title="安全设置">
                                <SecuritySettings v-model="userInfo" @refresh="refresh" />
                            </a-tab-pane>
                        </a-tabs>
                    </a-col>
                </a-row>
            </a-card>
        </a-spin>

        <!-- 头像裁剪模态框 -->
        <a-modal v-model:visible="avatarModalVisible" title="上传头像" :width="isMobile ? '95%' : 600" :footer="false" draggable
            @close="resetAvatarUpload">
            <a-row :gutter="isMobile ? 0 : 20">
                <a-col :span="isMobile ? 24 : 14" :style="isMobile ? 'width: 100%; height: 200px' : 'width: 200px; height: 200px'">
                    <VueCropper ref="cropperRef" :img="cropperOptions.img" :info="true"
                        :auto-crop="cropperOptions.autoCrop" :auto-crop-width="cropperOptions.autoCropWidth"
                        :auto-crop-height="cropperOptions.autoCropHeight" :fixed-box="cropperOptions.fixedBox"
                        :fixed="cropperOptions.fixed" :full="cropperOptions.full" :center-box="cropperOptions.centerBox"
                        :can-move="cropperOptions.canMove" :output-type="cropperOptions.outputType"
                        :output-size="cropperOptions.outputSize" @real-time="handleRealTime" />
                </a-col>
                <a-col :span="isMobile ? 24 : 10" :class="{ 'mobile-preview': isMobile }">
                    <div class="avatar-preview">
                        <h4>预览</h4>
                        <div class="preview-container">
                            <div :style="previewStyle">
                                <div :style="previews.div">
                                    <img :src="previews.url" :style="previews.img" alt="预览头像" />
                                </div>
                            </div>
                        </div>
                        <p>160*160像素</p>
                    </div>
                </a-col>
            </a-row>
            <div style="text-align: center; padding-top: 20px">
                <a-space>
                    <a-button type="primary" @click="confirmUploadAvatar">确定</a-button>
                    <a-button @click="resetAvatarUpload">取消</a-button>
                </a-space>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import BasicInfo from "@/views/system/userinfo/components/basic-info.vue";
import SecuritySettings from "@/views/system/userinfo/components/security-settings.vue";

import useGlobalProperties from "@/hooks/useGlobalProperties";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { type ProfileItem,  uploadAvatarAPI, getProfileAPI } from "@/api/user";
import { formatTime } from "@/globals";
import { IconEdit } from '@arco-design/web-vue/es/icon';
import { useDevicesSize } from "@/hooks/useDevicesSize";
const { isMobile } = useDevicesSize();
// 裁剪组件
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { handleUrl } from "@/utils/app";
const route = useRoute();
const proxy = useGlobalProperties();
const routerStore = useRouteConfigStore();

interface Detail {
    key: string;
    label: string;
    value: string;
}

const type = ref("rounded");
const size = ref("medium");
const activeTabs = ref(route.query.type || "1");


// 头像裁剪相关
const avatarModalVisible = ref(false);
const cropperRef = ref<any>(null);
const previews = ref<any>({});
const previewStyle = ref<any>({});
// 添加用于存储选中文件名的ref
const selectedFileName = ref<string>('');

// 裁剪选项
const cropperOptions = reactive({
    img: '',
    autoCrop: true,
    autoCropWidth: 160,
    autoCropHeight: 160,
    fixedBox: true,
    fixed: true,
    full: false,
    centerBox: true,
    canMove: true,
    outputSize: 1,
    outputType: 'png',
});

const onChangeTab = (e: string) => {
    activeTabs.value = e;
};

const detail = ref<Detail[]>([
    {
        key: "userName",
        label: "用户名：",
        value: "-"
    },
    {
        key: "nickName",
        label: "用户昵称：",
        value: "-"
    },
    {
        key: "sex",
        label: "性别：",
        value: "-"
    },
    {
        key: "roles",
        label: "角色：",
        value: "-"
    },
    {
        key: "status",
        label: "状态：",
        value: "-"
    },
    {
        key: "email",
        label: "邮箱：",
        value: "-"
    },
    {
        key: "phone",
        label: "手机号：",
        value: "-"
    },
    {
        key: "deptName",
        label: "部门：",
        value: "-"
    },
    {
        key: "createTime",
        label: "注册时间：",
        value: "-"
    },
    {
        key: "description",
        label: "描述：",
        value: "-"
    }
]);


// 头像上传
const showAvatarUpload = () => {
    // 通过JavaScript创建input元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // 添加change事件监听器
    fileInput.addEventListener('change', handleFileChange);

    // 触发文件选择
    fileInput.click();
};

// 处理文件选择
const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        // 保存文件名到ref中，以便后续使用
        selectedFileName.value = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            cropperOptions.img = e.target?.result as string;
            avatarModalVisible.value = true;
        };
        reader.readAsDataURL(file);
    }
    // 清空input值，确保下次选择同一文件也能触发change事件
    input.value = '';
};

// 实时预览
const handleRealTime = (data: any) => {
    previewStyle.value = {
        width: `${data.w}px`,
        height: `${data.h}px`,
        overflow: 'hidden',
        margin: '0',
        zoom: 160 / data.h, // 固定预览大小为160px
    };
    previews.value = data;
};

// 确认上传头像
const confirmUploadAvatar = () => {
    cropperRef.value.getCropBlob((data: Blob) => {
        // 上传头像
        const formData = new FormData();
        // 添加文件名参数
        formData.append('file', data, selectedFileName.value);
        uploadAvatarAPI(formData).then(res => {
            const { data } = res
            userInfo.value.avatar = handleUrl(data.url);
            resetAvatarUpload();
            proxy.$message.success('头像上传成功');
        })
    });
};

// 重置头像上传
const resetAvatarUpload = () => {
    avatarModalVisible.value = false;
    cropperOptions.img = '';
};

const refresh = () => {
    getUserInfo();
};

const loading = ref<boolean>(false);
const userInfo = ref<ProfileItem>({} as ProfileItem);
const getUserInfo = async () => {
    try {
        loading.value = true;
        // let params = {
        //     id: route.query.id ? route.query.id : ""
        // };
        //let data = await getAccountDetailAPI(params.id);
        let data = await getProfileAPI();
        userInfo.value = data.data;
        // 处理头像URL
        userInfo.value.avatar = handleUrl(userInfo.value.avatar);

        const userMap = {
            userName: userInfo.value.userName,
            nickName: userInfo.value.nickName,
            sex: userInfo.value.sex,
            roles: userInfo.value.roles,
            status: userInfo.value.status,
            email: userInfo.value.email,
            phone: userInfo.value.phone,
            deptName: userInfo.value.department.name,
            createTime: userInfo.value.createdAt,
            description: userInfo.value.description
        };

        detail.value.forEach((item: Detail) => {
            if (userMap.hasOwnProperty(item.key)) {
                item.value = (userMap as any)[item.key];
            }
        });
    } finally {
        loading.value = false;
    }
};


const sexOption = ref(dictFilter("gender"));
const getSexName = (sex: number) => {
    const sexItem = sexOption.value.find((item: any) => item.value === sex);
    return sexItem ? sexItem.name : '-';
}



getUserInfo();
routerStore.setTabsTitle(`用户${route.query.userName ? " - " + route.query.userName : "信息"}`);
</script>

<style lang="scss" scoped>
.margin-top {
    margin-top: $padding;
}

.avatar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    
    &.mobile-avatar {
        margin-bottom: 16px;
    }
}

.avatar-preview {
    text-align: center;

    h4 {
        margin-bottom: 15px;
        font-weight: bold;
    }

    .preview-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 160px;
        height: 160px;
        margin: 0 auto;
        border: 1px dashed #ccc;
        border-radius: 50%;
        overflow: hidden;
    }

    p {
        margin-top: 10px;
        font-size: 12px;
        color: #999;
    }
}

.mobile-preview {
    margin-top: 20px;
}

// 移动端适配
@media (max-width: 768px) {
    .avatar-preview {
        .preview-container {
            width: 120px;
            height: 120px;
        }
    }
}
</style>