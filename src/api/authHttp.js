// 所有与认证相关的接口都在这里
// 文件说明：这个模块集中管理所有认证相关的API接口

import http from './http'
// 导入之前封装的Http实例，用于发送HTTP请求
// 假设http.js文件在同一目录下

const login = (email, password) => {
    // 定义login函数，接收邮箱和密码作为参数
    // 这是登录功能的API调用函数
    
    const path = '/auth/login'
    // 定义API接口路径
    // 注意：这里使用的是相对路径，实际请求时会拼接上http.js中设置的baseURL
    
    return http.post(path, { email, password })
    // 调用http.post方法发送POST请求
    // 第一个参数：API路径 '/auth/login'
    // 第二个参数：请求体数据对象 { email: email, password: password }
    // 使用ES6对象简写语法，等价于 { email: email, password: password }
    // 返回的是Promise对象，调用者可以用.then()/.catch()或async/await处理
}


const resetPwd = (oldpwd, pwd1, pwd2) => {
    const path = '/auth/resetpwd'
    return http.post(path, { oldpwd, pwd1, pwd2 })
}


export default {
    login,
    // 导出login函数
    // 这里使用了对象形式导出，便于后续扩展其他认证相关函数
    // 例如可以添加：logout, register, resetPassword等
    resetPwd
}