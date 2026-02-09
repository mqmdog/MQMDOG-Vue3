<script setup name="informlist">
import { ref, reactive, onMounted } from "vue"
import OAMain from "@/components/OAmain.vue";
import OADialog from "@/components/OADialog.vue";
import OAPagenation from "@/components/OAPagenation.vue";
import timeFormatter from "@/utils/timeFormatter"
import { useAuthStore } from "@/stores/auth";
import informHttp from "@/api/informHttp";
import { ElMessage } from "element-plus";

const authStore = useAuthStore()

let informs = ref([])
let pagenation = reactive({
    page: 1,
    total: 0
})
let dialogVisible = ref(false)
let handleIndex = 0

onMounted(async () => {
    try {
        let data = await informHttp.getInformList(1)
        pagenation.total = data.count
        informs.value = data.results
        console.log(data.results);
    } catch (detail) {
        ElMessage.error(detail)
    }
})

const onShowDialog = (index) => {
    handleIndex = index
    dialogVisible.value = true;
}

const onDeleteInform = async () => {
    try {
        let inform = informs.value[handleIndex]
        await informHttp.deleteInform(inform.id)
        informs.value.splice(handleIndex, 1)
        dialogVisible.value = false;
        ElMessage.success("通知删除成功！")
    } catch (detail) {
        ElMessage.error(detail)
    }
}
</script>

<template>
    <div class="informlist-container">
        <OAMain title="通知列表">
            <!-- 透明化的表格卡片 -->
            <el-card class="transparent-card">
                <el-table :data="informs" style="width: 100%" class="transparent-table">
                    <el-table-column label="标题">
                        <template #default="scope">
                            <div class="title-container">
                                <el-badge v-if="scope.row.reads.length == 0" is-dot class="unread-badge">
                                    <RouterLink :to="{ name: 'inform_detail', params: { pk: scope.row.id } }"
                                        class="inform-title">
                                        {{ scope.row.title }}
                                    </RouterLink>
                                </el-badge>
                                <RouterLink v-else :to="{ name: 'inform_detail', params: { pk: scope.row.id } }"
                                    class="inform-title">
                                    {{ scope.row.title }}
                                </RouterLink>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="发起者">
                        <template #default="scope">
                            <span class="author-info">
                                {{ '[' + scope.row.author.department.name + ']' + scope.row.author.realname }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="发起时间">
                        <template #default="scope">
                            <span class="create-time">
                                {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="部门可见">
                        <template #default="scope">
                            <div class="department-tags">
                                <el-tag v-if="scope.row.public" type="success" class="public-tag">公开</el-tag>
                                <template v-else>
                                    <el-tag v-for="department in scope.row.departments" :key="department.name"
                                        type="info" class="department-tag">
                                        {{ department.name }}
                                    </el-tag>
                                </template>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作">
                        <template #default="scope">
                            <el-button v-if="scope.row.author.uid == authStore.user.uid"
                                @click="onShowDialog(scope.$index)" type="danger" icon="Delete" class="delete-button" />
                            <el-button v-else disabled type="default" class="disabled-button">无</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <template #footer>
                    <div class="pagination-container">
                        <OAPagenation v-model="pagenation.page" :total="pagenation.total"></OAPagenation>
                    </div>
                </template>
            </el-card>
        </OAMain>

        <OADialog v-model="dialogVisible" title="提示" @submit="onDeleteInform">
            <span>您确定要删除这篇通知吗？</span>
        </OADialog>
    </div>
</template>

<style scoped>
.el-badge {
    margin-right: 4px;
    margin-top: 4px;
}
/* 容器样式 */
.informlist-container {
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

/* 表格行的交替背景色 */
:deep(.transparent-table .el-table__body tr:nth-child(even)) {
    background: rgba(255, 255, 255, 0.5) !important;
}

:deep(.transparent-table .el-table__body tr:nth-child(odd)) {
    background: rgba(255, 255, 255, 0.4) !important;
}

/* 标题样式 */
.title-container {
    display: flex;
    align-items: center;
}

.inform-title {
    color: #409eff !important;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
}

.inform-title:hover {
    color: #66b1ff !important;
    text-decoration: underline;
}

.unread-badge {
    margin-right: 8px;
}

:deep(.el-badge__content.is-fixed) {
    background: rgba(245, 108, 108, 0.8) !important;
    border: none;
}

/* 作者信息样式 */
.author-info {
    color: #2c3e50;
    font-size: 13px;
}

/* 时间样式 */
.create-time {
    color: #666;
    font-size: 13px;
}

/* 部门标签样式 */
.department-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.public-tag {
    background: rgba(103, 194, 58, 0.2) !important;
    color: #67c23a !important;
    border: none !important;
}

.department-tag {
    background: rgba(144, 147, 153, 0.2) !important;
    color: #909399 !important;
    border: none !important;
}

/* 按钮样式 */
.delete-button {
    background: rgba(245, 108, 108, 0.8) !important;
    border: 1px solid rgba(245, 108, 108, 0.3) !important;
    backdrop-filter: blur(5px);
}

.delete-button:hover {
    background: rgba(245, 108, 108, 0.9) !important;
    border: 1px solid rgba(245, 108, 108, 0.5) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3) !important;
}

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

/* 确保所有Element Plus组件的背景都透明 */
:deep(.el-card),
:deep(.el-table),
:deep(.el-pagination) {
    background: transparent !important;
}

:deep(.el-pagination) {
    justify-content: center;
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
    .department-tags {
        flex-direction: column;
    }

    .inform-title {
        font-size: 13px;
    }

    .author-info,
    .create-time {
        font-size: 12px;
    }
}
</style>