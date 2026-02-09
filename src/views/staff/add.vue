<script setup name="staffadd">
import { ref, reactive } from 'vue';
import staffHttp from '@/api/staffHttp';
import { useRouter } from 'vue-router';
import OAMain from "@/components/OAmain.vue"
import { useAuthStore } from "@/stores/auth"
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore()

// 只有部门的leader可以给本部门新增员工
let staffForm = reactive({
    email: "",
    password: "",
    realname: "",
});
const formRef = ref()
let rules = reactive({
    email: [{ required: true, message: "请输入邮箱！", trigger: 'blur' }],
    password: [{ required: true, message: "请输入密码！", trigger: 'blur' }],
    realname: [{ required: true, message: "请输入真实姓名！", trigger: 'blur' }],
})

const onSubmit = () => {
    formRef.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                await staffHttp.addStaff(staffForm.realname, staffForm.email, staffForm.password)
                ElMessage.success('员工添加成功！')
                router.push({ name: 'staff_list' })
            } catch (detail) {
                ElMessage.error(detail)
            }
        }
    })
}
</script>

<template>
    <div class="staffadd-container">
        <OAMain title="新增员工">
            <!-- 透明化的表单卡片 -->
            <el-card class="transparent-card">
                <el-form :rules="rules" :model="staffForm" ref="formRef" label-width="100px" class="transparent-form">
                    <el-form-item label="姓名" prop="realname">
                        <el-input v-model="staffForm.realname" placeholder="请输入姓名" class="transparent-input">
                        </el-input>
                    </el-form-item>

                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="staffForm.email" placeholder="请输入邮箱" class="transparent-input">
                        </el-input>
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                        <el-input v-model="staffForm.password" placeholder="请输入密码" type="password"
                            class="transparent-input">
                        </el-input>
                    </el-form-item>

                    <el-form-item label="部门">
                        <el-input readonly disabled placeholder="请输入部门" :value="authStore.user.department.name"
                            class="transparent-input disabled-input">
                        </el-input>
                    </el-form-item>

                    <el-form-item label="领导">
                        <el-input readonly disabled :value="'[' + authStore.user.email + ']' + authStore.user.realname"
                            class="transparent-input disabled-input">
                        </el-input>
                    </el-form-item>

                    <el-form-item>
                        <div style="text-align: right; width: 100%;">
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
.staffadd-container {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 20;
}

/* 透明化卡片 */
.transparent-card {
    background: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 8px !important;
    max-width: 600px;
    margin: 0 auto;
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

/* 禁用输入框样式 */
.disabled-input :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.6) !important;
    border-color: rgba(0, 0, 0, 0.08) !important;
}

.disabled-input :deep(.el-input__inner) {
    color: #666 !important;
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

/* 表单验证样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
    border-color: rgba(245, 108, 108, 0.8) !important;
    box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.1) !important;
}

:deep(.el-form-item__error) {
    color: #f56c6c !important;
    font-size: 12px;
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
    .transparent-card {
        max-width: 100%;
        margin: 0 15px;
    }

    :deep(.transparent-card .el-card__body) {
        padding: 20px !important;
    }

    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        font-size: 13px;
    }

    .submit-button {
        padding: 8px 25px !important;
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    :deep(.transparent-card .el-card__body) {
        padding: 15px !important;
    }

    :deep(.el-form-item) {
        margin-bottom: 15px;
    }

    :deep(.el-form-item__label) {
        font-size: 12px;
        padding-right: 8px;
    }
}
</style>