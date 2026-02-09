<script setup name="OAPagenation">
import { defineModel, defineProps } from "vue"

let props = defineProps({// 传入的props
    total: {
        type: Number,
        default: 0
    },
    pageSize: {
        type: Number,
        default: 10
    }
})
let page = defineModel({ required: true })// 页码
</script>

<template>
   <el-pagination background layout="prev, pager, next" :total="props.total" :page-size="props.pageSize"
        v-model:current-page="page" />

</template>

<style>
.el-pagination {
    justify-content: center;
}
</style>
