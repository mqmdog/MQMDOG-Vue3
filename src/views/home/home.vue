<script setup name='home'>
import OAMain from '@/components/OAmain.vue';
import { ref, onMounted, onActivated, onBeforeUnmount, watch } from "vue";
import timeFormatter from '@/utils/timeFormatter';
import { ElMessage } from 'element-plus';
import homeHttp from '@/api/homeHttp';
import * as echarts from 'echarts';// 引入 ECharts 主模块


//ref()返回一个包含.value属性的响应式引用对象
let informs = ref([])      // 通知数据
let absents = ref([])     // 请假数据  
let deptRows = ref([])    //部员工统计数据
let chart = ref(null)    // ECharts实例引用
let resizeHandler = null //大小调整处理器
let dataUpdatedHandler = null // 数据更新事件处理器


// 加载最新通知
const loadInforms = async () => {
    try {
        informs.value = await homeHttp.getLatestInforms() //调用后端接口获取
    } catch (detail) {
        ElMessage.error(detail)
    }
}

// 加载最新请假数据
const loadAbsents = async () => {
    try {
        absents.value = await homeHttp.getLatestAbsents()//调用后端接口获取
    } catch (detail) {
        ElMessage.error(detail)
    }
}

// 加载部门员工统计数据
const loadDeptRows = async () => {
    try {
        deptRows.value = await homeHttp.getDepartmentStaffCount()//调用后端接口获取
        updateChart(deptRows.value) // 更新图表
    } catch (detail) {
        ElMessage.error(detail)
    }
}

// 统一加载数据
const load = async () => {
    // 调试信息，输出加载时间
    console.log('home load called', new Date().toISOString())
    //Promise.all()并行执行多个异步操作
    await Promise.all([loadInforms(), loadAbsents(), loadDeptRows()])
    
}

//对于对象和数组，const 保证的是引用地址不变，但对象内部的属性可以修改
// let：可以先声明，后赋值
// const：声明时必须同时赋值

// 更新图表
const updateChart = (rows) => {
    const xdatas = []  // X轴数据(部门名称)
    const ydatas = [] // Y轴数据(员工数量)
    // 遍历行数据，提取部门名称和员工数量
    for (let row of rows) {
        xdatas.push(row.name)
        ydatas.push(row.staff_count)
    }
    // 如果图表实例不存在，则创建一个
    if (!chart.value) {
        const dom = document.getElementById('department-staff-count')
        chart.value = echarts.init(dom)
    }
    // 设置图表选项
    chart.value.setOption({
        tooltip: {},
        xAxis: { data: xdatas }, 
        yAxis: {}, //采用默认配置
        series: [{ name: '部门员工数量', type: 'bar', data: ydatas }]
    })
}

onMounted(() => {
    console.log('home mounted')
    load() // 加载数据
    // 监听窗口大小调整事件，重新绘制图表
    resizeHandler = () => { if (chart.value) chart.value.resize() }
    // 监听数据更新事件，根据事件类型加载相应数据
    dataUpdatedHandler = (e) => {
        console.log('home received data-updated', e && e.detail)
        const t = e && e.detail && e.detail.type
        if (!t) { // 无类型指定，全部刷新
            load()
            return
        }
        if (t === 'absent') {//只刷新请假数据
            loadAbsents()
            return
        }
        if (t === 'inform') {// 只刷新通知数据
            loadInforms()
            return
        }
        if (t === 'dept') { // 只刷新部门数据
            loadDeptRows()
            return
        }
        load()  // 默认全部刷新
    }
    // 添加事件监听器
    window.addEventListener('resize', resizeHandler)
    window.addEventListener('data-updated', dataUpdatedHandler)
})


// 组件激活时执行,每次切换回该组件时都会执行，用于重新加载数据
onActivated(() => {
    console.log('home activated')
    load()
})

// 组件销毁前执行，用于移除事件监听器和释放资源
onBeforeUnmount(() => {
    // 清理事件监听器
    if (resizeHandler) window.removeEventListener('resize', resizeHandler)
    if (dataUpdatedHandler) window.removeEventListener('data-updated', dataUpdatedHandler)
    // 释放图表资源
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
