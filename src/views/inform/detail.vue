<script setup name="informdetail">
import informHttp from "@/api/informHttp";
import { ref, reactive, onMounted } from "vue"
import { ElMessage } from "element-plus"
import timeFormatter from "@/utils/timeFormatter";
import OAMain from "@/components/OAmain.vue"
import { useRoute } from "vue-router";

const route = useRoute()

let inform = reactive({
    title: "",
    content: "",
    create_time: "",
    read_count: 0,
    author: {
        realname: "",
        department: {
            name: ""
        }
    }
})

onMounted(async () => {
    const pk = route.params.pk
    try {
        let data = await informHttp.getInformDetail(pk)
        Object.assign(inform, data)
    } catch (detail) {
        ElMessage.error(detail)
    }

    // 发送阅读请求
    await informHttp.readInform(pk)
})
</script>

<template>
    <div class="informdetail-container">
        <OAMain title="通知详情">
            <!-- 透明化的详情卡片 -->
            <el-card class="transparent-card detail-card">
                <template #header>
                    <div class="detail-header">
                        <h2 class="detail-title">{{ inform.title }}</h2>
                        <div class="detail-meta">
                            <div class="meta-item">
                                <el-icon class="meta-icon">
                                    <User />
                                </el-icon>
                                <span class="meta-label">作者：</span>
                                <span class="meta-value">{{ '[' + inform.author.department.name + ']' +
                                    inform.author.realname }}</span>
                            </div>
                            <div class="meta-item">
                                <el-icon class="meta-icon">
                                    <Clock />
                                </el-icon>
                                <span class="meta-label">发布时间：</span>
                                <span class="meta-value">{{ timeFormatter.stringFromDateTime(inform.create_time)
                                    }}</span>
                            </div>
                        </div>
                    </div>
                </template>

                <div class="detail-content">
                    <div v-html="inform.content" class="content-container"></div>
                </div>

                <template #footer>
                    <div class="detail-footer">
                        <div class="read-count">
                            <el-icon class="footer-icon">
                                <View />
                            </el-icon>
                            <span>阅读人数：{{ inform.read_count }}</span>
                        </div>
                    </div>
                </template>
            </el-card>
        </OAMain>
    </div>
</template>

<style scoped>
/* 容器样式 */
.informdetail-container {
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

/* 详情卡片样式 */
.detail-card :deep(.el-card__header) {
    background: rgba(255, 255, 255, 0.7) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
    border-radius: 8px 8px 0 0 !important;
    padding: 30px !important;
}

.detail-card :deep(.el-card__body) {
    background: transparent !important;
    padding: 30px !important;
}

.detail-card :deep(.el-card__footer) {
    background: rgba(255, 255, 255, 0.7) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
    border-radius: 0 0 8px 8px !important;
    padding: 20px 30px !important;
}

/* 头部样式 */
.detail-header {
    text-align: center;
}

.detail-title {
    color: #2c3e50;
    margin: 0 0 30px 0;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.4;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.detail-meta {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
}

.meta-icon {
    color: #409eff;
    font-size: 16px;
}

.meta-label {
    color: #909399;
    font-weight: 500;
}

.meta-value {
    color: #2c3e50;
    font-weight: 500;
}

/* 内容样式 */
.detail-content {
    min-height: 300px;
}

.content-container {
    line-height: 1.8;
    color: #333;
    font-size: 16px;
}

/* 内容中的图片样式 */
.content-container :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    display: block;
}

.content-container :deep(p) {
    margin: 1em 0;
}

.content-container :deep(h1),
.content-container :deep(h2),
.content-container :deep(h3) {
    color: #2c3e50;
    margin: 1.5em 0 1em 0;
    font-weight: 600;
}

.content-container :deep(ul),
.content-container :deep(ol) {
    padding-left: 2em;
    margin: 1em 0;
}

.content-container :deep(li) {
    margin: 0.5em 0;
}

.content-container :deep(a) {
    color: #409eff;
    text-decoration: none;
    border-bottom: 1px solid rgba(64, 158, 255, 0.3);
    transition: all 0.3s;
}

.content-container :deep(a:hover) {
    color: #66b1ff;
    border-bottom-color: rgba(102, 177, 255, 0.6);
}

.content-container :deep(blockquote) {
    border-left: 4px solid #409eff;
    background: rgba(64, 158, 255, 0.05);
    margin: 1.5em 0;
    padding: 1em 1.5em;
    border-radius: 0 4px 4px 0;
    color: #666;
    font-style: italic;
}

.content-container :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
}

.content-container :deep(th),
.content-container :deep(td) {
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 10px 15px;
    text-align: left;
}

.content-container :deep(th) {
    background: rgba(64, 158, 255, 0.1);
    color: #2c3e50;
    font-weight: 600;
}

.content-container :deep(code) {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
}

.content-container :deep(pre) {
    background: rgba(0, 0, 0, 0.05);
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.5em 0;
}

.content-container :deep(pre code) {
    background: none;
    padding: 0;
}

/* 页脚样式 */
.detail-footer {
    display: flex;
    justify-content: center;
    align-items: center;
}

.read-count {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
    font-weight: 500;
}

.footer-icon {
    color: #409eff;
    font-size: 18px;
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
    .detail-title {
        font-size: 22px;
        margin-bottom: 20px;
    }

    .detail-meta {
        flex-direction: column;
        gap: 15px;
        align-items: center;
    }

    .detail-card :deep(.el-card__header),
    .detail-card :deep(.el-card__body),
    .detail-card :deep(.el-card__footer) {
        padding: 20px !important;
    }

    .content-container {
        font-size: 15px;
    }

    .meta-item {
        font-size: 13px;
    }

    .read-count {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .detail-title {
        font-size: 20px;
    }

    .content-container {
        font-size: 14px;
        line-height: 1.6;
    }

    .content-container :deep(h1) {
        font-size: 20px;
    }

    .content-container :deep(h2) {
        font-size: 18px;
    }

    .content-container :deep(h3) {
        font-size: 16px;
    }
}

/* 内容样式 - 增加不透明度 */
.detail-content {
    min-height: 300px;
}

.content-container {
    line-height: 1.8;
    color: #333;
    font-size: 16px;
    /* 增加不透明度 */
    background: rgba(255, 255, 255, 0.98) !important;
    border-radius: 8px;
    padding: 30px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 内容中的图片样式 - 添加白色背景 */
.content-container :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    display: block;
    background: white !important;
    padding: 5px;
}

/* 让文字更清晰 */
.content-container :deep(p) {
    margin: 1em 0;
    color: #333 !important;
}

.content-container :deep(h1),
.content-container :deep(h2),
.content-container :deep(h3) {
    color: #2c3e50 !important;
    margin: 1.5em 0 1em 0;
    font-weight: 600;
}

.content-container :deep(a) {
    color: #409eff !important;
}

/* 表格使用白色背景 */
.content-container :deep(table) {
    background: white !important;
}

.content-container :deep(th),
.content-container :deep(td) {
    background: white !important;
}

/* 代码块背景 */
.content-container :deep(code) {
    background: rgba(0, 0, 0, 0.05) !important;
}

.content-container :deep(pre) {
    background: rgba(0, 0, 0, 0.05) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .content-container {
        padding: 20px;
        font-size: 15px;
    }
}

@media (max-width: 480px) {
    .content-container {
        padding: 15px;
        font-size: 14px;
    }
}
</style>