import http from './http'

const getDepartmentStaffCount = () => {
    const path = '/home/department/staff/count'
    return http.get(path)
}

// 获取最新通知
const getLatestInforms = () => {
    const path = '/home/latest/inform' // 后端接口地址
    return http.get(path)
}

const getLatestAbsents = () => {
    const path = '/home/latest/absent'
    return http.get(path)
}

export default {
    getDepartmentStaffCount,
    getLatestInforms,
    getLatestAbsents,
}