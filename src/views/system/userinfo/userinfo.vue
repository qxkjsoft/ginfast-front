<template>
  <div class="snow-page">
    <a-spin :loading="loading" tip="loading...">
      <a-card :bordered="false">
        <a-row align="center">
          <a-col :span="2">
            <div>
              <a-avatar :size="100" @click="toast" trigger-type="mask">
                <img alt="avatar" :src="userInfo.avatar" />
                <template #trigger-icon>
                  <IconEdit />
                </template>
              </a-avatar>
            </div>
          </a-col>
          <a-col :span="22">
            <a-space direction="vertical" size="large">
              <a-descriptions :data="detail" :column="4" title="用户资料" :align="{ label: 'right' }">
                <template #value="{ value, data }">
                  <span v-if="data.key === 'roles'">
                    {{ Array.isArray(value) && value.map((curr: any) => curr.name).join(",") }}
                  </span>
                  <span v-else-if="data.key == 'status'">
                    {{ value === 1 ? "启用" : "禁用" }}
                  </span>
                  <span v-else-if="data.key == 'sex'">
                    {{ value === 1 ? "男" : "女" }}
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
  </div>
</template>

<script setup lang="ts">
import BasicInfo from "@/views/system/userinfo/components/basic-info.vue";
import SecuritySettings from "@/views/system/userinfo/components/security-settings.vue";
import useGlobalProperties from "@/hooks/useGlobalProperties";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { type AccountDetail, getAccountDetailAPI } from "@/api/user";
import { formatTime } from "@/globals";
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

const toast = () => {
  proxy.$message.info("修改头像");
};

const refresh = () => {
  getUserInfo();
};

const loading = ref<boolean>(false);
const userInfo = ref<AccountDetail>({} as AccountDetail);
const getUserInfo = async () => {
  try {
    loading.value = true;
    let params = {
      id: route.query.id ? route.query.id : ""
    };
    let data = await await getAccountDetailAPI(params.id);
    userInfo.value = data.data;
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

getUserInfo();
routerStore.setTabsTitle(`用户${route.query.userName ? " - " + route.query.userName : "信息"}`);
</script>

<style lang="scss" scoped>
.margin-top {
  margin-top: $padding;
}
</style>
