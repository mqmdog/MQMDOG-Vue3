<script setup name="subabsent">
import OAPageHeader from '@/components/OAPageHeader.vue';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import absenthttp from '@/api/absenthttp';
import timeFormatter from '@/utils/timeFormatter';
import OAmain from '@/components/OAmain.vue';
import OAPagenation from '@/components/OAPagenation.vue';
import OADialog from '@/components/OADialog.vue';

let absents = ref([]);
let pagination = reactive({
    page: 1,
    total: 0,
});
let dialogVisible = ref(false);
let absentForm = reactive({
    status: 2,
    response_content: '',
})
let rules = {
    status: [{ required: true, message: '请选择处理结果', trigger: 'change' }],
    response_content: [{ required: true, message: '请输入理由', trigger: 'blur' }],
}
let absentFormRef = ref();
let handleIndex = null;

onMounted(async () => {
    try {
        let data = await absenthttp.getSubAbsents()
        pagination.total = data.count;// 总条数
        absents.value = data.results;
    }
    catch (error) {
        ElMessage.error(error.message);
    }
})

const onShowDialog = (index) => {
    absentForm.status = 2;
    absentForm.response_content = '';
    dialogVisible.value = true;
    handleIndex = index;
}

const onSubmitAbsent = async () => {
    absentFormRef.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                //隐藏对话框
                dialogVisible.value = false;
                //处理缺勤
                const absent = absents.value[handleIndex];
                const data = await absenthttp.handleSubAbsent(absent.id, absentForm.status, absentForm.response_content);
                //更新数据
                absents.value.splice(handleIndex, 1, data);
                ElMessage.success('下属考勤处理成功');
                window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'absent' } }));
                console.log('dispatched data-updated from sub.vue', data && data.id, 'type=absent');
            } catch (datail) {
                ElMessage.error(datail);
            }
        }
    })
}
</script>

<template>
    <div class="subabsent-container">
        <el-space direction="vertical" fill :size="20" style="width:100%">
            <OAPageHeader content="员工考勤记录"></OAPageHeader>

            <!-- 透明化的表格卡片 -->
            <el-card class="transparent-card">
                <el-table :data="absents" style="width: 100%" class="transparent-table">
                    <el-table-column prop="title" label="标题" />
                    <el-table-column label="发起者">
                        <template #default="scope">
                            {{ '[' + scope.row.requester.department.name + ']' + scope.row.requester.realname }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="absent_type.name" label="类型" />
                    <el-table-column prop="request_content" label="原因" />
                    <el-table-column label="发起时间">
                        <template #default="scope">
                            {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="start_date" label="开始日期" />
                    <el-table-column prop="end_date" label="结束日期" />
                    <el-table-column prop="responder.realname" label="审核领导" />
                    <el-table-column prop="response_content" label="反馈意见" />
                    <el-table-column label="审核状态">
                        <template #default="scope">
                            <el-tag type="info" v-if="scope.row.status == 1">审核中</el-tag>
                            <el-tag type="success" v-else-if="scope.row.status == 2">已通过</el-tag>
                            <el-tag type="danger" v-else>已拒绝</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="处理情况">
                        <template #default="scope">
                            <el-button v-if="scope.row.status == 1" @click="onShowDialog(scope.$index)" type="primary"
                                icon="EditPen" class="handle-button" />
                            <el-button v-else disabled type="default" class="disabled-button">已处理</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <template #footer>
                    <div class="pagination-container">
                        <OAPagenation v-model="pagination.page" :total="pagination.total"></OAPagenation>
                    </div>
                </template>
            </el-card>
        </el-space>

        <!-- 透明化的对话框 -->
        <OADialog title="处理考勤" v-model="dialogVisible" @submit="onSubmitAbsent">
            <el-form :model="absentForm" :rules="rules" ref="absentFormRef" label-width="100px">
                <el-form-item label="结果" prop="status">
                    <el-radio-group v-model="absentForm.status" class="ml-4">
                        <el-radio :value="2">通过</el-radio>
                        <el-radio :value="3">拒绝</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="理由" prop="response_content">
                    <el-input type="textarea" v-model="absentForm.response_content" autocomplete="off" />
                </el-form-item>
            </el-form>
        </OADialog>
    </div>
</template>

<style scoped>
/* 容器样式 */
.subabsent-container {
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
}

/* 透明化表格 */
.transparent-table {
    background: transparent !important;
}

:deep(.transparent-card .el-card__body) {
    background: transparent !important;
    padding: 20px !important;
}

:deep(.transparent-table .el-table) {
    background: transparent !important;
}

:deep(.transparent-table .el-table__header-wrapper) {
    background: rgba(255, 255, 255, 0.7) !important;
}

:deep(.transparent-table .el-table__body-wrapper tr) {
    background: rgba(255, 255, 255, 0.6) !important;
}

:deep(.transparent-table .el-table__body-wrapper tr:hover > td) {
    background: rgba(255, 255, 255, 0.8) !important;
}

:deep(.transparent-table .el-table td) {
    background: transparent !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* 透明化分页 */
:deep(.transparent-pagination) {
    background: transparent !important;
}

:deep(.transparent-pagination .el-pagination.is-background .btn-prev),
:deep(.transparent-pagination .el-pagination.is-background .btn-next),
:deep(.transparent-pagination .el-pagination.is-background .el-pager li) {
    background: rgba(255, 255, 255, 0.7) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.transparent-pagination .el-pagination.is-background .btn-prev:hover),
:deep(.transparent-pagination .el-pagination.is-background .btn-next:hover),
:deep(.transparent-pagination .el-pagination.is-background .el-pager li:hover) {
    background: rgba(255, 255, 255, 0.9) !important;
}

/* 处理按钮样式 */
.handle-button {
    background: rgba(64, 158, 255, 0.8) !important;
    border: 1px solid rgba(64, 158, 255, 0.3) !important;
    backdrop-filter: blur(5px);
}

.handle-button:hover {
    background: rgba(64, 158, 255, 0.9) !important;
    border: 1px solid rgba(64, 158, 255, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3) !important;
}

/* 已处理按钮样式 */
.disabled-button {
    background: rgba(144, 147, 153, 0.6) !important;
    border: 1px solid rgba(144, 147, 153, 0.3) !important;
    backdrop-filter: blur(5px);
    color: rgba(255, 255, 255, 0.9) !important;
}

/* 分页容器 */
.pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px 0 0 0;
    background: transparent !important;
}

/* 确保所有Element Plus组件的背景都透明 */
:deep(.el-card),
:deep(.el-table),
:deep(.el-pagination) {
    background: transparent !important;
}

:deep(.el-pagination) {
    justify-content: center;
}

.el-space :deep(.el-space__item) {
    width: 100%
}

/* 表格行的交替背景色 */
:deep(.transparent-table .el-table__body tr:nth-child(even)) {
    background: rgba(255, 255, 255, 0.5) !important;
}

:deep(.transparent-table .el-table__body tr:nth-child(odd)) {
    background: rgba(255, 255, 255, 0.4) !important;
}

/* 对话框样式 */
:deep(.el-dialog) {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
}

:deep(.el-dialog__header) {
    background: rgba(255, 255, 255, 0.7) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}

:deep(.el-dialog__body) {
    background: transparent !important;
}

:deep(.el-dialog__footer) {
    background: rgba(255, 255, 255, 0.7) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* 表单样式 */
:deep(.el-form-item__label) {
    color: #2c3e50;
    font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
    background: rgba(255, 255, 255, 0.9) !important;
    border-color: rgba(64, 158, 255, 0.5) !important;
}

/* 单选框样式 */
:deep(.el-radio) {
    margin-right: 20px;
}

/* 标签样式 */
.el-tag {
    border: none;
    font-weight: 500;
}
</style>