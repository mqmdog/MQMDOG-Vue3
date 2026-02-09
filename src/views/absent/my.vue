<script setup name="myabsent">
import OAPageHeader from '@/components/OAPageHeader.vue';
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import absenthttp from '@/api/absenthttp';
import timeFormatter from '@/utils/timeFormatter';
import OAmain from '@/components/OAmain.vue';
import OAPagenation from '@/components/OAPagenation.vue';
import OADialog from '@/components/OADialog.vue';

let formLabelWidth = '100px'; //表单标签宽度
let dialogFormVisible = ref(false); //表单是否显示

let absentForm = reactive({ //表单内容
    title: '',
    absent_type_id: null,
    date_range: [],
    request_content: '',
})

let absent_types = ref([]); //请假类型

let pagination = reactive({  // 分页信息
    total: 0,   //总数据条数
    page: 1,      //当前页码
}) 

const onShowDialog = () => {    //打开对话框前重置表单
    absentForm.title = '';
    absentForm.absent_type_id = null;
    absentForm.date_range = [];
    absentForm.request_content = '';
    dialogFormVisible.value = true;
}

let absentFormRef = ref(); //表单引用,用于验证

let rules = reactive({  //表单验证规则
    title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
    ],
    absent_type_id: [
        { required: true, message: '请选择请假类型', trigger: 'change' },
    ],
    date_range: [
        { required: true, message: '请选择请假日期', trigger: 'blur' },
    ],
    request_content: [
        { required: true, message: '请输入请假理由', trigger: 'blur' },
    ],
})

const onSubmitAbsent = () => {
    absentFormRef.value.validate(async (valid, fields) => {
        if (valid) {
            let data = { 
                title: absentForm.title,
                absent_type_id: absentForm.absent_type_id,
                start_date: absentForm.date_range[0],
                end_date: absentForm.date_range[1],
                request_content: absentForm.request_content
            }
            console.log(data);

            try {
                let absent = await absenthttp.applyAbsent(data)
                dialogFormVisible.value = false;
                console.log(absent);
                absents.value.unshift(absent); // 新增一条缺勤记录,放到顶部
                ElMessage.success('提交成功！');
                window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'absent' } }));
                console.log('dispatched data-updated from my.vue', absent && absent.id, 'type=absent');
            } catch (detail) {
                ElMessage.error(detail)
            }
        }
    });
}

let responder = reactive({
    email: '',
    realname: ''
})

let absents = ref([])

const requestAbsents = async (page) => {  //请求请假记录列表
    try {
        let absents_data = await absenthttp.getMyAbsents(page);
        let total = absents_data.count;
        pagination.total = total;
        let results = absents_data.results;
        absents.value = results;
    } catch (error) {
        ElMessage.error(error.message || error);
    }
}

watch(() => pagination.page, (value) => {
    requestAbsents(value);
})

onMounted(async () => {  //页面加载完成后请求数据
    try {
        let absent_types_data = await absenthttp.getAbsentTypes();
        absent_types.value = absent_types_data;

        let responder_data = await absenthttp.getResponder();
        Object.assign(responder, responder_data);
        requestAbsents(1);

    } catch (error) {
        ElMessage.error(error.message || error);
    }
})

let responder_str = computed(() => {
    if (responder.email) {
        return '[' + responder.email + ']' + responder.realname;
    } else {
        return "无";
    }
})
</script>

<template>
    <div class="myabsent-container">
        <el-space direction="vertical" fill :size="20" style="width:100%">
            <OAPageHeader content="个人请假记录"></OAPageHeader>

            <!-- 透明化的卡片 - 固定宽度 -->
            <div style="display: flex; justify-content: flex-end;">
                <el-card class="transparent-card" style="width: fit-content;">
                    <div>
                        <el-button type="primary" @click="onShowDialog" class="custom-button">
                            <el-icon>
                                <Plus />
                            </el-icon>发起请假申请
                        </el-button>
                    </div>
                </el-card>
            </div>

            <!-- 透明化的表格卡片 -->
            <el-card class="transparent-card">
                <el-table :data="absents" style="width: 100%" class="transparent-table">
                    <el-table-column prop="title" label="标题" />
                    <el-table-column prop="absent_type.name" label="类型" />
                    <el-table-column prop="request_content" label="原因" />
                    <el-table-column label="发起时间">
                        <template #default="scope">
                            {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="start_date" label="开始日期" />
                    <el-table-column prop="end_date" label="结束日期" />
                    <el-table-column label="审核领导">
                        {{ responder_str }}
                    </el-table-column>
                    <el-table-column prop="response_content" label="反馈意见" />
                    <el-table-column label="审核状态">
                        <template #default="scope">
                            <el-tag type="info" v-if="scope.row.status == 1">审核中</el-tag>
                            <el-tag type="success" v-else-if="scope.row.status == 2">已通过</el-tag>
                            <el-tag type="danger" v-else>已拒绝</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
                <template #footer>
                    <div class="pagination-container">
                        <!-- 使用你的OAPagenation组件 -->
                        <OAPagenation v-model="pagination.page" :total="pagination.total"></OAPagenation>
                    </div>
                </template>
            </el-card>
        </el-space>

        <!-- 使用你的OADialog组件 -->
        <OADialog title="发起请假" v-model="dialogFormVisible" @submit="onSubmitAbsent">
            <el-form :model="absentForm" :rules="rules" ref="absentFormRef">
                <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
                    <el-input v-model="absentForm.title" autocomplete="off" />
                </el-form-item>
                <el-form-item label="请假类型" :label-width="formLabelWidth" prop="absent_type_id">
                    <el-select v-model="absentForm.absent_type_id" placeholder="请选择请假类型">
                        <el-option v-for="item in absent_types" :label="item.name" :value="item.id" :key="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="请假日期" :label-width="formLabelWidth" prop="date_range">
                    <el-date-picker v-model="absentForm.date_range" type="daterange" range-separator="到"
                        start-placeholder="起始日期" end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </el-form-item>
                <el-form-item label="审批人" :label-width="formLabelWidth">
                    <el-input :value="responder_str" readonly disabled autocomplete="off" />
                </el-form-item>
                <el-form-item label="请假理由" :label-width="formLabelWidth" prop="request_content">
                    <el-input type="textarea" v-model="absentForm.request_content" autocomplete="off" />
                </el-form-item>
            </el-form>
        </OADialog>
    </div>
</template>

<style scoped>
/* 容器样式 */
.myabsent-container {
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

/* 自定义按钮 */
.custom-button {
    background: rgba(64, 158, 255, 0.8) !important;
    border: 1px solid rgba(64, 158, 255, 0.3) !important;
    backdrop-filter: blur(5px);
}

.custom-button:hover {
    background: rgba(64, 158, 255, 0.9) !important;
    border: 1px solid rgba(64, 158, 255, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3) !important;
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

/* 对话框样式 - 如果需要可以添加 */
:deep(.el-dialog) {
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
}
</style>