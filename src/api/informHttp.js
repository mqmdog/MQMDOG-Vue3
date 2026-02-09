import http from "./http"

const publishInform = (data) => {// 封装发布通知方法
    const path = '/inform/inform'
    return http.post(path, data)
}

const getInformList = (page = 1) => {// 封装获取通知列表方法
    const path = '/inform/inform?page=' + page
    return http.get(path)
}

const deleteInform = (pk) => {//封装删除通知方法
    const path = "/inform/inform/" + pk
    return http.delete(path)
} 

const getInformDetail = (pk) => {// 封装获取通知详情方法
    const path = "/inform/inform/" + pk
    return http.get(path)
}

const readInform = (pk) => {// 封装通知已读方法
    const path = "/inform/inform/read"
    return http.post(path, {inform_pk: pk})
}
export default {
    publishInform,
    getInformList,
    deleteInform,
    getInformDetail,
    readInform,
}