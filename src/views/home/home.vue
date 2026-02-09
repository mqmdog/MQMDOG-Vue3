<script setup name='home'>
import OAMain from '@/components/OAmain.vue';
import { ref, onMounted, onActivated, onBeforeUnmount, watch } from "vue";
import timeFormatter from '@/utils/timeFormatter';
import { ElMessage } from 'element-plus';
import homeHttp from '@/api/homeHttp';
import * as echarts from 'echarts';// 引入 ECharts 主模块

let informs = ref([])
let absents = ref([])
let deptRows = ref([])
let chart = ref(null)
let resizeHandler = null
let dataUpdatedHandler = null

const loadInforms = async () => {
    try {
        informs.value = await homeHttp.getLatestInforms()
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const loadAbsents = async () => {
    try {
        absents.value = await homeHttp.getLatestAbsents()
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const loadDeptRows = async () => {
    try {
        deptRows.value = await homeHttp.getDepartmentStaffCount()
        updateChart(deptRows.value)
    } catch (detail) {
        ElMessage.error(detail)
    }
}

const load = async () => {
    console.log('home load called', new Date().toISOString())
    await Promise.all([loadInforms(), loadAbsents(), loadDeptRows()])
}

const updateChart = (rows) => {
    const xdatas = []
    const ydatas = []
    for (let row of rows) {
        xdatas.push(row.name)
        ydatas.push(row.staff_count)
    }
    if (!chart.value) {
        const dom = document.getElementById('department-staff-count')
        chart.value = echarts.init(dom)
    }
    chart.value.setOption({
        tooltip: {},
        xAxis: { data: xdatas },
        yAxis: {},
        series: [{ name: '部门员工数量', type: 'bar', data: ydatas }]
    })
}

onMounted(() => {
    console.log('home mounted')
    load()
    resizeHandler = () => { if (chart.value) chart.value.resize() }
    dataUpdatedHandler = (e) => {
        console.log('home received data-updated', e && e.detail)
        const t = e && e.detail && e.detail.type
        if (!t) {
            load()
            return
        }
        if (t === 'absent') {
            loadAbsents()
            return
        }
        if (t === 'inform') {
            loadInforms()
            return
        }
        if (t === 'dept') {
            loadDeptRows()
            return
        }
        load()
    }
    window.addEventListener('resize', resizeHandler)
    window.addEventListener('data-updated', dataUpdatedHandler)
})

onActivated(() => {
    console.log('home activated')
    load()
})

onBeforeUnmount(() => {
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
    if (dataUpdatedHandler) window.removeEventListener('data-updated', dataUpdatedHandler)
    if (chart.value) { chart.value.dispose(); chart.value = null }
})

// 当 deptRows 发生变化时，自动更新图表
watch(deptRows, (newRows) => {
    if (newRows && newRows.length) {
        updateChart(newRows)
    }
})


</script>

<template>
    <OAMain title="首页">
        <el-card>
            <template #header>
                <h2>部门员工数量</h2>
            </template>
            <div id="department-staff-count" style="width: 100%;height:400px;"></div>
        </el-card>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <h2>最新通知</h2>
                    </template>
                    <el-table :data="informs">
                        <el-table-column label="标题">
                            <template #default="scope">
                                <router-link :to="{ name: 'inform_detail', params: { pk: scope.row.id } }">{{
                                    scope.row.title
                                    }}</router-link>
                            </template>
                        </el-table-column>
                        <el-table-column label="发布者" prop="author.realname"></el-table-column>
                        <el-table-column label="发布时间">
                            <template #default="scope">
                                {{ timeFormatter.stringFromDate(scope.row.create_time) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="是否已读">
                            <template #default="scope">
                                <el-tag v-if="scope.row.reads.length > 0">已读</el-tag>
                                <el-tag v-else type="danger">未读</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <template #header>
                        <h2>最新请假</h2>
                    </template>
                    <el-table :data="absents">
                        <el-table-column label="部门" prop="requester.department.name"></el-table-column>
                        <el-table-column label="发起人" prop="requester.realname"></el-table-column>
                        <el-table-column label="起始日期" prop="start_date"></el-table-column>
                        <el-table-column label="结束日期" prop="end_date"></el-table-column>
                        <el-table-column label="发起时间">
                            <template #default="scope">
                                {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>


    </OAMain>

</template>

<style scoped></style>
