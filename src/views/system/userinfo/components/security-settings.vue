<template>
    <div>
        <a-row align="center" :gutter="[0, 16]">
            <a-col :span="24">
                <a-card title="安全设置">
                    <a-form :model="form" :rules="rules" :style="{ width: layoutMode.width }" :layout="layoutMode.layout" @submit="onSubmit">
                        <a-form-item field="password" label="登录密码" :label-col-flex="isMobile ? '100px' : '80px'">
                            <a-input-password v-model="form.password" placeholder="请输入登录密码" allow-clear />
                            <template #extra>
                                <div>留空则不修改</div>
                            </template>
                        </a-form-item>
                        <a-form-item field="phone" label="手机号" :label-col-flex="isMobile ? '100px' : '80px'">
                            <a-input v-model="form.phone" placeholder="请输入手机号" allow-clear>
                                <template #prepend> +86 </template>
                            </a-input>
                        </a-form-item>
                        <a-form-item field="email" label="邮箱" :label-col-flex="isMobile ? '100px' : '80px'">
                            <a-input v-model="form.email" placeholder="请输入邮箱" allow-clear />
                        </a-form-item>
                        <a-form-item :label-col-flex="isMobile ? '100px' : '80px'">
                            <a-button type="primary" html-type="submit"
                                v-hasPerm="['system:userinfo:updateAccount']">提交</a-button>
                        </a-form-item>
                    </a-form>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import useGlobalProperties from "@/hooks/useGlobalProperties";
import { updateAccountAPI } from "@/api/user";
import { useDevicesSize } from "@/hooks/useDevicesSize";

const emit = defineEmits(["refresh"]);
const proxy = useGlobalProperties();
const data = defineModel() as any;
const { isMobile } = useDevicesSize();
const form = ref({
    // id: "",
    password: "",
    phone: "",
    email: ""
});

// 响应式布局配置
const layoutMode = computed(() => {
  let info = {
    mobile: {
      width: "100%",
      layout: "vertical"
    },
    desktop: {
      width: "600px",
      layout: "horizontal"
    }
  };
  return isMobile.value ? info.mobile : info.desktop;
});
const rules = {
    phone: [
        {
            required: true,
            message: "手机号不能为空"
        }
    ]
};

const onSubmit = ({ errors }: ArcoDesign.ArcoSubmit) => {
    if (errors) return;
    //proxy.$message.success("模拟修改成功");
    updateAccountAPI(form.value).then(() => {
        proxy.$message.success("修改成功");
        emit("refresh");
    });
};

watch(
    () => data.value,
    () => {
        //form.value.id = data.value.id;
        form.value.phone = data.value.phone;
        form.value.email = data.value.email;
    }
);
</script>

<style lang="scss" scoped>
.row-title {
    font-size: $font-size-title-1;
}
</style>
