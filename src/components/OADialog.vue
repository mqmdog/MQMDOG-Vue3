<script setup>
import { ref, defineModel, defineProps, defineEmits } from 'vue'


//定义一个model
let dialogVisible = defineModel({ required: true });


//定义属性
let props = defineProps({
    title: { type: String, default: '' },
    width: { type: String, default: '500' },
})

//定义事件
const emits = defineEmits(['concel', 'submit'])
const onCanel = () => { 
    dialogVisible.value = false;
    emits('concel');
}

const onSubmit = () => {
    emits('submit');
}

</script>

<template>
   <el-dialog v-model="dialogVisible" :title="props.title" :width="props.width">
        <slot></slot>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="onCanel">取消</el-button>
                <el-button type="primary" @click="onSubmit">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>


</template>

<style  scoped>

</style>