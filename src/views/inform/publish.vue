<script setup name="publishinform">
import OAMain from '@/components/OAmain.vue';
import { ref, reactive, onBeforeUnmount, shallowRef, onMounted } from "vue"
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import staffHttp from '@/api/staffHttp';
import { ElMessage } from "element-plus"
import { useAuthStore } from '@/stores/auth';
import informHttp from '@/api/informHttp';
import { useRouter } from 'vue-router'

const authStore = useAuthStore()

let informForm = reactive({
    title: '',
    content: '',
    department_ids: []
})
const rules = reactive({
    title: [{ required: true, message: "请输入标题！", trigger: 'blur' }],
    content: [{ required: true, message: "请输入内容！", trigger: 'blur' }],
    department_ids: [{ required: true, message: "请选择部门！", trigger: 'change' }]
})
let formRef = ref()
let formLabelWidth = "100px"
let departments = ref([])

////////////// 这是跟wangEditor相关的配置 //////////////
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const toolbarConfig = {}
const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
        uploadImage: {
            server: import.meta.env.VITE_BASE_URL + '/image/upload',
            fieldName: 'image',
            maxFileSize: 5 * 1024 * 1024,
            maxNumberOfFiles: 10,
            allowedFileTypes: ['image/*'],
            headers: {
                Authorization: "JWT " + authStore.token
            },
            timeout: 6 * 1000, // 6 秒,
            customInsert(res, insertFn) {
                if (res.errno == 0) {
                    let data = res.data;
                    let url = import.meta.env.VITE_BASE_URL.replace("/api", "") + data.url
                    let href = import.meta.env.VITE_BASE_URL.replace("/api", "") + data.href
                    let alt = data.alt;
                    let aaa = import.meta.env.VITE_BASE_URL + '/image/upload'
                    console.log("server:", aaa)
                    console.log('customInsert', res, url, alt, href)
                    insertFn(url, alt, href)
                } else {
                    ElMessage.error(res.message)
                }
            },
            onFailed(file, res) {
                console.log(`${file.name} 上传失败`, res)
            },
            onError(file, err, res) {
                if (file.size > 5 * 1024 * 1024) {
                    ElMessage.error('图片文件最大不能超过5MB！')
                } else {
                    ElMessage.error('图片格式不正确！')
                }
            },
        }
    }
}
let mode = "default"

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要！
}
////////////// 这是跟wangEditor相关的配置 //////////////

const router = useRouter()

onMounted(async () => {
    try {
        let data = await staffHttp.getAllDepartment()
        departments.value = data.results
    } catch (detail) {
        ElMessage.error(detail)
    }
})

const onSubmit = () => {
    formRef.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                let data = await informHttp.publishInform(informForm)
                ElMessage.success('发布成功！')
                window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'inform' } }));
                console.log('dispatched data-updated from publish.vue', data && data.id, 'type=inform');
                setTimeout(() => {
                    router.push({ name: 'inform_list' })
                }, 600)
            } catch (detail) {
                ElMessage.error(detail)
            }
        }
    })
}
</script>

<template>
    <div class="publishinform-container">
        <!-- 使用 OAMain 组件 -->
        <OAMain title="发布通知">
            <!-- 透明化的表单卡片 -->
            <el-card class="transparent-card">
                <el-form :model="informForm" :rules="rules" ref="formRef" class="transparent-form">
                    <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
                        <el-input v-model="informForm.title" autocomplete="off" class="transparent-input" />
                    </el-form-item>
                    <el-form-item label="部门可见" :label-width="formLabelWidth" prop="department_ids">
                        <el-select multiple v-model="informForm.department_ids" class="transparent-select">
                            <el-option :value="0" label="所有部门"></el-option>
                            <el-option v-for="department in departments" :label="department.name" :value="department.id"
                                :key="department.name" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="内容" :label-width="formLabelWidth" prop="content">
                        <div
                            style="border: 1px solid rgba(0, 0, 0, 0.1); width: 100%; border-radius: 4px; overflow: hidden;">
                            <Toolbar
                                style="border-bottom: 1px solid rgba(0, 0, 0, 0.1); background: rgba(255, 255, 255, 0.8);"
                                :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
                            <Editor style="height: 500px; overflow-y: hidden; background: rgba(255, 255, 255, 0.9);"
                                v-model="informForm.content" :defaultConfig="editorConfig" :mode="mode"
                                @onCreated="handleCreated" />
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <div style="text-align: right; flex: 1;">
                            <el-button type="primary" @click="onSubmit" class="submit-button">提交</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-card>
        </OAMain>
    </div>
</template>

<style scoped>
/* 容器样式 */
.publishinform-container {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 20;
    min-height: calc(100vh - 150px);
}

/* 透明化卡片 */
.transparent-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 8px !important;
}

:deep(.transparent-card .el-card__body) {
    background: transparent !important;
    padding: 30px !important;
}

/* 表单样式 */
.transparent-form {
    background: transparent !important;
}

/* 输入框透明化 */
.transparent-input :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: none !important;
}

.transparent-input :deep(.el-input__wrapper:hover),
.transparent-input :deep(.el-input__wrapper.is-focus) {
    background: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(64, 158, 255, 0.5) !important;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1) !important;
}

/* 选择框透明化 */
.transparent-select :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: none !important;
}

.transparent-select :deep(.el-select__wrapper:hover) {
    background: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(64, 158, 255, 0.5) !important;
}

/* 下拉框透明化 */
:deep(.el-select-dropdown) {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
}

:deep(.el-select-dropdown__item) {
    background: transparent !important;
    color: #333 !important;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
    background: rgba(64, 158, 255, 0.1) !important;
}

:deep(.el-select-dropdown__item.selected) {
    background: rgba(64, 158, 255, 0.2) !important;
    color: #409eff !important;
    font-weight: 500;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
    color: #2c3e50 !important;
    font-weight: 600 !important;
    font-size: 14px;
}

/* 提交按钮样式 */
.submit-button {
    background: rgba(64, 158, 255, 0.8) !important;
    border: 1px solid rgba(64, 158, 255, 0.3) !important;
    backdrop-filter: blur(5px);
    padding: 10px 30px !important;
    font-weight: 500;
    font-size: 14px;
    color: white !important;
    transition: all 0.3s;
}

.submit-button:hover {
    background: rgba(64, 158, 255, 0.9) !important;
    border: 1px solid rgba(64, 158, 255, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3) !important;
}

/* wangEditor 编辑器样式调整 */
:deep(.w-e-text-container) {
    background: rgba(255, 255, 255, 0.9) !important;
}

:deep(.w-e-bar) {
    background: rgba(255, 255, 255, 0.8) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

:deep(.w-e-bar-item button) {
    color: #333 !important;
}

:deep(.w-e-bar-item button:hover) {
    background: rgba(64, 158, 255, 0.1) !important;
}

:deep(.w-e-bar-item .active) {
    background: rgba(64, 158, 255, 0.2) !important;
    color: #409eff !important;
}

/* 表单验证样式 */
:deep(.el-form-item.is-error .el-input__wrapper),
:deep(.el-form-item.is-error .el-textarea__inner) {
    border-color: rgba(245, 108, 108, 0.8) !important;
    box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.1) !important;
}

:deep(.el-form-item__error) {
    color: #f56c6c !important;
    font-size: 12px;
}

/* 多选标签样式 */
:deep(.el-select__tags .el-tag) {
    background: rgba(64, 158, 255, 0.2) !important;
    color: #409eff !important;
    border: none !important;
}

:deep(.el-select__tags .el-tag .el-tag__close) {
    color: #409eff !important;
}

:deep(.el-select__tags .el-tag .el-tag__close:hover) {
    background: rgba(64, 158, 255, 0.3) !important;
}

/* 确保所有Element Plus组件的背景都透明 */
:deep(.el-card) {
    background: transparent !important;
}

/* 确保OAMain组件透明 */
:deep(.el-space) {
    background: transparent !important;
}

:deep(.el-space__item) {
    width: 100% !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
    :deep(.transparent-card .el-card__body) {
        padding: 20px 15px !important;
    }

    .transparent-form :deep(.el-form-item) {
        margin-bottom: 15px;
    }

    :deep(.w-e-text-container) {
        height: 400px !important;
    }
}
</style>