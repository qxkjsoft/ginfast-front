<template>
  <div class="snow-page">
    <div class="snow-inner">
      <a-card hoverable title="根据用户权限判断">
        <span>权限按钮：</span>
        <a-space>
          <a-button v-hasPerm="['sys:btn:test']" type="primary">sys:btn:test</a-button>
          <a-button v-hasPerm="['sys:btn:test1']" type="primary">sys:btn:test1</a-button>
        </a-space>
      </a-card>
      <a-card hoverable title="根据角色权限判断">
        <span>权限按钮：</span>
        <a-space>
          <a-button v-hasRole="[1]" type="primary">用户角色:1</a-button>
          <a-button v-hasRole="[2]" type="primary">用户角色:2</a-button>
        </a-space>
      </a-card>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped></style>
