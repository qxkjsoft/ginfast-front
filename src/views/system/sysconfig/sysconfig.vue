<template>
    <div class="snow-fill">
        <div class="snow-fill-inner">
            <s-layout-tools>
                <template #right>
                    <a-space>
                        <a-button type="primary" @click="onSave" v-hasPerm="['system:config:update']">
                            <template #icon>
                                <icon-save />
                            </template>
                            <span>保存配置</span>
                        </a-button>
                    </a-space>
                </template>
            </s-layout-tools>

            <a-tabs v-model:active-key="activeTab" :animation="true">
                <!-- 服务器配置 -->
                <a-tab-pane key="server" title="服务器配置">
                    <a-card :bordered="false" class="mb-4">
                        <a-form :model="configData.system" auto-label-width>
                            <a-row :gutter="24">
                                <a-col :span="24">
                                    <a-form-item field="systemLogo" label="系统Logo">
                                        <!-- 图片上传组件 -->
                                        <ImageUpload :width="50" :height="50"
                                            v-model:image-url="configData.system.systemLogo" :title="'系统Logo'"
                                            :accept="'.svg'" />
                                        <template #extra>
                                            <div>显示在登录页面和系统导航栏的网站图标（建议 .svg 格式）</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="24">
                                    <a-form-item field="systemIcon" label="系统图标">
                                        <!-- 图片上传组件 -->
                                        <ImageUpload :width="50" :height="50"
                                            v-model:image-url="configData.system.systemIcon" :title="'系统图标'"
                                            :accept="'.ico'" />
                                        <template #extra>
                                            <div>浏览器标签页显示的网站图标（建议 .ico 格式）</div>
                                        </template>
                                    </a-form-item>
                                </a-col>

                                <a-col :span="12">
                                    <a-form-item field="systemName" label="系统名称">
                                        <a-input v-model="configData.system.systemName" placeholder="请输入系统名称" />
                                        <template #extra>
                                            <div>显示在浏览器标题栏和登录界面的系统名称</div>
                                        </template>
                                    </a-form-item>
                                </a-col>

                                <a-col :span="12">
                                    <a-form-item field="systemCopyright" label="版权信息">
                                        <a-input v-model="configData.system.systemCopyright" placeholder="请输入版权信息" />
                                        <template #extra>
                                            <div>显示在页面底部的版权声明文本</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="12">
                                    <a-form-item field="systemRecordNo" label="备案号">
                                        <a-input v-model="configData.system.systemRecordNo" placeholder="请输入备案号" />
                                        <template #extra>
                                            <div>工信部 ICP 备案编号 如：粤ICP备12345678号</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                            <a-row>
                                <a-col :span="12">
                                    <a-form-item field="defaultusername" label="默认用户名">
                                        <a-input v-model="configData.system.defaultusername" placeholder="请输入默认用户名" />
                                        <template #extra>
                                            <div>系统默认登录用户名</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                
                                <a-col :span="12">
                                    <a-form-item field="defaultpassword" label="默认密码">
                                        <a-input-password v-model="configData.system.defaultpassword" placeholder="请输入默认密码" />
                                        <template #extra>
                                            <div>系统默认登录密码</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                        </a-form>
                    </a-card>
                </a-tab-pane>

                <!-- 验证码配置 -->
                <a-tab-pane key="captcha" title="验证码配置">
                    <a-card :bordered="false" class="mb-4">
                        <a-form :model="configData.captcha" auto-label-width>
                            <a-row :gutter="24">
                                <a-col :span="12">
                                    <a-form-item field="open" label="启用验证码">
                                        <a-switch v-model="configData.captcha.open">
                                            <template #checked>开启</template>
                                            <template #unchecked>关闭</template>
                                        </a-switch>
                                    </a-form-item>
                                </a-col>

                            </a-row>

                            <a-row :gutter="24">
                                <a-col :span="12">
                                    <a-form-item field="length" label="验证码长度">
                                        <a-input-number v-model="configData.captcha.length" :min="4" :max="8"
                                            placeholder="请输入验证码长度" />
                                        <template #extra>
                                            <div>验证码字符长度，默认4位</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                            </a-row>

                        </a-form>
                    </a-card>
                </a-tab-pane>

                <!-- 安全配置 -->
                <a-tab-pane key="safe" title="安全配置">
                    <a-card :bordered="false" class="mb-4">
                        <a-form :model="configData.safe" auto-label-width>
                            <a-row :gutter="24">
                                <a-col :span="12">
                                    <a-form-item field="loginLockThreshold" label="登录失败锁定阈值(次)">
                                        <a-input-number v-model="configData.safe.loginLockThreshold" :min="0" :max="10"
                                            placeholder="请输入登录失败次数" />
                                        <template #extra>
                                            <div>指定时间内登录失败次数达到此阈值后，账号将被锁定，0表示不限制</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="12">
                                    <a-form-item field="loginLockExpire" label="登录失败次数缓存时间(秒)">
                                        <a-input-number v-model="configData.safe.loginLockExpire" :min="1" :max="1440"
                                            placeholder="请输入缓存时间" />
                                        <template #extra>
                                            <div>指定时间内登录失败次数缓存时间，单位秒</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="12">
                                    <a-form-item field="loginLockDuration" label="账号锁定时长(秒)">
                                        <a-input-number v-model="configData.safe.loginLockDuration" :min="1" :max="1440"
                                            placeholder="请输入锁定时长" />
                                        <template #extra>
                                            <div>账号锁定时长，单位秒</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="12">
                                    <a-form-item field="minPasswordLength" label="密码最小长度">
                                        <a-input-number v-model="configData.safe.minPasswordLength" :min="6" :max="32"
                                            placeholder="请输入密码最小长度" />
                                        <template #extra>
                                            <div>密码最小长度，默认6位</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                                <a-col :span="12">
                                    <a-form-item field="requireSpecialChar" label="密码必须包含特殊字符">
                                        <a-switch v-model="configData.safe.requireSpecialChar">
                                            <template #checked>是</template>
                                            <template #unchecked>否</template>
                                        </a-switch>
                                        <template #extra>
                                            <div>是否要求密码必须包含特殊字符（如：!@#$%）</div>
                                        </template>
                                    </a-form-item>
                                </a-col>
                            </a-row>
                        </a-form>
                    </a-card>
                </a-tab-pane>
            </a-tabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSysConfigStore } from '@/store/modules/sys-config';
// 引入图片上传组件
import ImageUpload from './components/ImageUpload.vue';

//const proxy = useGlobalProperties();
const activeTab = ref('server');

// 使用系统配置 store
const sysConfigStore = useSysConfigStore();

// 配置数据（使用 store 中的数据）
const configData = ref({
    system: sysConfigStore.systemConfig,
    captcha: sysConfigStore.captchaConfig,
    safe: sysConfigStore.safeConfig
});

// 获取配置信息
const getConfig = async () => {
    try {
        await sysConfigStore.getConfig();
        // 更新本地引用
        configData.value = {
            system: sysConfigStore.systemConfig,
            captcha: sysConfigStore.captchaConfig,
            safe: sysConfigStore.safeConfig
        };
    } catch (error) {
        console.error('获取配置失败:', error);
        arcoMessage('error', '获取配置失败');
    }
};

// 保存配置
const onSave = async () => {
    try {
        await sysConfigStore.updateConfig(configData.value);
        arcoMessage('success', '保存成功');
    } catch (error) {
        console.error('保存配置失败:', error);
        arcoMessage('error', '保存配置失败');
    }
};

onMounted(() => {
    getConfig();
});
</script>

<style lang="scss" scoped>
.mb-4 {
    margin-bottom: 1rem;
}

:deep(.arco-card-body) {
    padding: 20px;
}
</style>