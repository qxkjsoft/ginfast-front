<template>
  <div>
    <div class="login_form_box">
      <a-form :rules="rules" :model="form" layout="vertical" @submit="onSubmit">
        <a-form-item field="username" :hide-asterisk="true">
          <a-input v-model="form.username" allow-clear placeholder="请输入账号：admin/common">
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item field="password" :hide-asterisk="true">
          <a-input-password v-model="form.password" allow-clear placeholder="请输入密码">
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item field="verifyCode" :hide-asterisk="true">
          <div class="verifyCode">
            <a-input style="width: 160px" v-model="form.captchaValue" allow-clear placeholder="请输入验证码" />
            <!-- <s-verify-code :content-height="30" :font-size-max="30" :content-width="110"
                            @verify-code-change="verifyCodeChange" /> -->
            <img :src="captchaImgUrl" :width="captchaWidth" :height="captchaHeight" @click="refreshCaptcha" />
          </div>
        </a-form-item>
        <!-- <a-form-item field="remember">
                    <div class="remember">
                        <a-checkbox v-model="form.remember">记住密码</a-checkbox>
                        <div class="forgot-password">忘记密码</div>
                    </div>
                </a-form-item> -->
        <a-form-item>
          <a-button long type="primary" html-type="submit" :loading="loginLoading">登录</a-button>
        </a-form-item>
      </a-form>
    </div>
    <!-- <div class="register">注册账号</div> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { useUserStoreHook } from "@/store/modules/user";
import { onMounted, ref } from "vue";
import { getCaptchaId } from "@/api/user";
import { baseUrlApi } from "@/api/utils";
import { useSystemStore } from "@/store/modules/system";

/////////////////原有登录逻辑引入文件
// import { loginAPI } from "@/api/modules/user/index";
// import { useUserInfoStore } from "@/store/modules/user-info";
// let userStores = useUserInfoStore();

// 定义表单数据类型
interface LoginForm {
  username: string;
  password: string;
  captchaValue: string | null;
  captchaId: string;
}

// Store 和 Router
const routeStore = useRouteConfigStore();
const router = useRouter();

// 响应式数据
const loginLoading = ref(false);
const form = ref<LoginForm>({
  username: "admin",
  password: "123456",
  captchaValue: null,
  captchaId: ""
});

// 表单验证规则
const rules = ref({
  username: [
    {
      required: true,
      message: "请输入账号"
    }
  ],
  password: [
    {
      required: true,
      message: "请输入密码"
    }
  ],
  captchaValue: [
    {
      required: true,
      message: "请输入验证码"
    }
  ]
});

// 提交表单
const onSubmit = async ({ errors }: { errors: Record<string, any> | undefined }) => {
  if (errors) return;
  await onLogin();
};

// 登录处理
const onLogin = async () => {
  try {
    // 新的登录逻辑
    loginLoading.value = true;

    // 执行登录
    await useUserStoreHook().loginByUsername(form.value);

    // 加载用户信息
    await useUserStoreHook().getUserInfo();

    // 加载路由信息
    await routeStore.initSetRouter();
    loginLoading.value = false;

    arcoMessage("success", "登录成功");

    // 跳转首页
    router.replace("/home");

    // 设置字典
    useSystemStore().setDictData();

    // // 旧的登录逻辑
    // let res = await loginAPI(form.value);
    // // 存储token
    // await userStores.setToken(res.data.token);
    // // 加载用户信息
    // await userStores.setAccount();
    // // 加载路由信息
    // await routeStore.initSetRouter();

    // arcoMessage("success", "登录成功");
    // // 跳转首页
    // router.replace("/home");
    // // 设置字典
    // useSystemStore().setDictData();
  } catch (error) {
    console.error("登录失败:", error);
    arcoMessage("error", typeof error === "string" ? error : "登录失败，请检查用户名和密码");
  } finally {
    loginLoading.value = false;
  }
};

// 验证码
const captchaImgUrl = ref("");
const captchaWidth = ref(130);
const captchaHeight = ref(30);
const refreshCaptcha = () => {
  if (!form.value.captchaId) {
    getCaptchaId().then(res => {
      form.value.captchaId = res.data.captchaId;
      captchaImgUrl.value = baseUrlApi(
        `captcha/image?captchaId=${form.value.captchaId}&width=${captchaWidth.value}&height=${captchaHeight.value}`
      );
    });
  } else {
    captchaImgUrl.value = baseUrlApi(
      `captcha/image?captchaId=${form.value.captchaId}&width=${captchaWidth.value}&height=${captchaHeight.value}&time=${new Date().getTime()}`
    );
  }
};

// 组件挂载时的初始化
onMounted(async () => {
  refreshCaptcha();
});
</script>

<style lang="scss" scoped>
.login_form_box {
  margin-top: 28px;

  .verifyCode {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .remember {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .forgot-password {
      color: $color-primary;
      cursor: pointer;
    }
  }
}

.register {
  font-size: $font-size-body-1;
  color: $color-text-3;
  text-align: center;
  cursor: pointer;
}
</style>
