<script setup>
import { ref, useAttrs } from 'vue'
import { omit } from 'lodash-es'

defineOptions({
  inheritAttrs: false //不继承父组件事件
})

const loading = ref(false)

const attrs = useAttrs()

async function handelClick() {
  loading.value = true
  //调用父组件传递的点击事件
  //不能使用emit 他不管是同步还是异步
  try {
    await attrs.onClick?.()
  } finally {
    console.log('执行完成')
    loading.value = false
  }
}
</script>

<template>
  <el-button
    v-bind="omit(attrs, 'onclick')"
    :loading="loading"
    @click="handelClick"
    ><slot></slot
  ></el-button>
</template>

<style lang="sass" scoped></style>
