<script setup name="stafflist">
import OAMain from '@/components/OAmain.vue';
import { ref, reactive, onMounted, watch } from "vue";
import timeFormatter from '@/utils/timeFormatter';
import staffHttp from '@/api/staffHttp';
import { ElMessage } from 'element-plus';
import OADialog from '@/components/OADialog.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore()

let staffs = ref([])
let pagination = reactive({
    page: 1,
    total: 0
})
let page_size = ref(5)
let dialogVisible = ref(false)
let staffForm = reactive({
    status: 1
})
let handleIndex = 0
let departments = ref([])
let filterForm = reactive({
    department_id: null,
    realname: "",
    date_joined: []
})
let tableRef = ref()
const BASE_URL = import.meta.env.VITE_BASE_URL

async function fetchStaffList(page, page_size) {
    try {
        let data = await staffHttp.getStaffList(page, page_size, filterForm)
        pagination.total = data.count
        pagination.page = page
        staffs.value = data.results
    } catch (detail) {
        ElMessage.error(detail)
    }
}

onMounted(async () => {
    fetchStaffList(1, page_size.value)

    try {
        let data = await staffHttp.getAllDepartment()
        departments.value = data.results;
    } catch (detail) {
        ElMessage.error(detail)
    }
})

watch(() => pagination.page, async function (value) {
    fetchStaffList(value, page_size.value)
})

watch(page_size, function (value) {
    if (pagination.page == 1) {
        fetchStaffList(1, value)
    } else {
        pagination.page = 1
    }
})

const onEditStaff = (index) => {
    handleIndex = index
    dialogVisible.value = true;
    let staff = staffs.value[index]
    staffForm.status = staff.status
}

const onSubmitEditStaff = async () => {
    let staff = staffs.value[handleIndex]
    try {
        let newstaff = await staffHttp.updateStaffStatus(staff.uid, staffForm.status)
        ElMessage.success("员工状态修改成功！")
        dialogVisible.value = false;
        staffs.value.splice(handleIndex, 1, newstaff)
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const onSearch = () => {
    fetchStaffList(1, page_size.value)
}

const onDownload = async () => {
    let rows = tableRef.value.getSelectionRows()
    if (!rows || rows.length == 0) {
        ElMessage.info('请先选中要导出的员工！')
        return;
    }
    try {
        let response = await staffHttp.downloadStaffs(rows.map(row => row.uid))
        let href = URL.createObjectURL(response.data)
        const a = document.createElement("a")
        a.href = href
        a.setAttribute('download', '员工信息.xlsx')
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(href)
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const onUploadSuccess = () => {
    ElMessage.success("员工上传成功！")
    fetchStaffList(1, page_size.value)
}

const onUploadFail = (error) => {
    const detail = JSON.parse(error.message).detail
    ElMessage.error(detail)
}
</script>

<template>
    <div class="stafflist-container">
        <OAMain title="员工列表">
            <!-- 筛选卡片 -->
            <el-card class="transparent-card filter-card">
                <el-form :inline="true" class="transparent-form my-form-inline">
                    <el-form-item label="按部门">
                        <el-select v-model="filterForm.department_id" class="transparent-select department-select"
                            placeholder="请选择部门" style="width: 150px;">
                            <el-option v-for="department in departments" :label="department.name" :value="department.id"
                                :key="department.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="按姓名">
                        <el-input v-model="filterForm.realname" class="transparent-input" placeholder="请输入姓名" />
                    </el-form-item>
                    <el-form-item label="按入职时间">
                        <el-date-picker v-model="filterForm.date_joined" type="daterange" range-separator="到"
                            start-placeholder="起始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD" class="transparent-datepicker" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" icon="Search" @click="onSearch" class="search-button"></el-button>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="danger" icon="Download" @click="onDownload"
                            class="download-button">下载</el-button>
                    </el-form-item>

                    <el-form-item>
                        <el-upload :action="BASE_URL + '/staff/upload'" :headers="{ Authorization: 'JWT ' + authStore.token }"
                            :on-success="onUploadSuccess" :on-error="onUploadFail" :show-file-list="false"
                            :auto-upload="true" accept=".xlsx, .xls">
                            <el-button type="danger" icon="Upload" class="upload-button">上传</el-button>
                        </el-upload>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 表格卡片 -->
            <el-card class="transparent-card table-card">
                <el-table :data="staffs" ref="tableRef" class="transparent-table">
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column label="序号" width="60">
                        <template #default="scope">{{ scope.$index + 1 }}</template>
                    </el-table-column>
                    <el-table-column prop="realname" label="姓名"></el-table-column>
                    <el-table-column prop="email" label="邮箱"></el-table-column>
                    <el-table-column label="入职时间">
                        <template #default="scope">
                            {{ timeFormatter.stringFromDate(scope.row.date_joined) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="department.name" label="部门"></el-table-column>
                    <el-table-column label="状态">
                        <template #default="scope">
                            <el-tag v-if="scope.row.status == 1" type="success" class="status-tag">正常</el-tag>
                            <el-tag v-else-if="scope.row.status == 2" type="warning" class="status-tag">未激活</el-tag>
                            <el-tag v-else type="danger" class="status-tag">已锁定</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template #default="scope">
                            <el-button type="primary" icon="Edit" circle @click="onEditStaff(scope.$index)"
                                class="edit-button"></el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <template #footer>
                    <div class="footer-container">
                        <el-form-item label="每页：" class="page-size-selector">
                            <el-select v-model="page_size" size="small" class="transparent-select page-size-select"
                                style="width: 120px;">
                                <!-- 确保有显示文本 -->
                                <el-option label="5条/页" :value="5" />
                                <el-option label="10条/页" :value="10" />
                                <!-- 如果需要更多选项 -->
                                <el-option label="20条/页" :value="20" />
                            </el-select>
                        </el-form-item>
                        <el-pagination background layout="prev, pager, next" :total="pagination.total"
                            v-model:currentPage="pagination.page" :page-size="page_size"
                            class="transparent-pagination" />
                    </div>
                </template>
            </el-card>
        </OAMain>

        <OADialog title="修改员工状态" v-model="dialogVisible" @submit="onSubmitEditStaff">
            <el-form :model="staffForm" label-width="100px" class="transparent-form">
                <el-form-item label="状态">
                    <el-radio-group v-model="staffForm.status" class="ml-4">
                        <el-radio :value="1">激活</el-radio>
                        <el-radio :value="3">锁定</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </OADialog>
    </div>
</template>

<style scoped>
/* 容器样式 */
.stafflist-container {
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

/* 筛选卡片 */
.filter-card {
    margin-bottom: 20px;
}

:deep(.filter-card .el-card__body) {
    background: transparent !important;
    padding: 20px !important;
}

/* 表格卡片 */
.table-card {
    margin-top: 20px;
}

:deep(.table-card .el-card__body) {
    background: transparent !important;
    padding: 20px !important;
}

/* 透明化表单 */
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

/* "请选择"选项的特殊样式 */
:deep(.el-select-dropdown__item.is-disabled) {
    color: #c0c4cc !important;
    cursor: not-allowed;
    background-color: rgba(240, 242, 245, 0.5) !important;
}

/* 日期选择器透明化 */
.transparent-datepicker :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    box-shadow: none !important;
}

/* 按钮样式 */
.search-button {
    background: rgba(64, 158, 255, 0.8) !important;
    border: 1px solid rgba(64, 158, 255, 0.3) !important;
    backdrop-filter: blur(5px);
}

.search-button:hover {
    background: rgba(64, 158, 255, 0.9) !important;
    border: 1px solid rgba(64, 158, 255, 0.5) !important;
}

.download-button,
.upload-button {
    background: rgba(245, 108, 108, 0.8) !important;
    border: 1px solid rgba(245, 108, 108, 0.3) !important;
    backdrop-filter: blur(5px);
}

.download-button:hover,
.upload-button:hover {
    background: rgba(245, 108, 108, 0.9) !important;
    border: 1px solid rgba(245, 108, 108, 0.5) !important;
}

.edit-button {
    background: rgba(64, 158, 255, 0.8) !important;
    border: 1px solid rgba(64, 158, 255, 0.3) !important;
    backdrop-filter: blur(5px);
}

.edit-button:hover {
    background: rgba(64, 158, 255, 0.9) !important;
    border: 1px solid rgba(64, 158, 255, 0.5) !important;
}

/* 状态标签 */
.status-tag {
    border: none !important;
    font-weight: 500;
}

.status-tag.el-tag--success {
    background: rgba(103, 194, 58, 0.2) !important;
    color: #67c23a !important;
}

.status-tag.el-tag--warning {
    background: rgba(230, 162, 60, 0.2) !important;
    color: #e6a23c !important;
}

.status-tag.el-tag--danger {
    background: rgba(245, 108, 108, 0.2) !important;
    color: #f56c6c !important;
}

/* 透明化表格 */
.transparent-table {
    background: transparent !important;
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

/* 表格行的交替背景色 */
:deep(.transparent-table .el-table__body tr:nth-child(even)) {
    background: rgba(255, 255, 255, 0.5) !important;
}

:deep(.transparent-table .el-table__body tr:nth-child(odd)) {
    background: rgba(255, 255, 255, 0.4) !important;
}

/* 页脚容器 */
.footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent !important;
}

.page-size-selector :deep(.el-form-item__label) {
    color: #666;
    font-size: 14px;
}

/* 透明化分页 */
.transparent-pagination {
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

:deep(.transparent-pagination .el-pagination.is-background .el-pager li.is-active) {
    background: rgba(64, 158, 255, 0.8) !important;
    color: white !important;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
    color: #2c3e50 !important;
    font-weight: 600 !important;
    font-size: 14px;
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
    .my-form-inline .el-input {
        --el-input-width: 120px;
    }

    .my-form-inline .el-select {
        --el-select-width: 120px;
    }

    .el-form--inline .el-form-item {
        margin-right: 15px;
        margin-bottom: 10px;
    }

    .footer-container {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .page-size-selector {
        margin-bottom: 0;
    }
}
</style>