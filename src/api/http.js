import axios from "axios"; // 引入axios库，用于发送HTTP请求
import { useAuthStore } from "@/stores/auth";
import { unref } from 'vue'

class Http {
    constructor() {
        // 创建axios实例并配置默认参数
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_BASE_URL, // 设置所有请求的基础URL前缀
            timeout: 6000, // 设置请求超时时间（6秒）
        });
        // 添加请求拦截器，在请求发出前进行一些处理
        this.instance.interceptors.request.use((config) => {
            const authStore = useAuthStore();
            // `authStore.token` 在 store 中为 computed/ref，使用 unref 获取原始值（兼容字符串或 ref）
            const token = unref(authStore.token)
            if (token) {
                config.headers.Authorization = "JWT " + token; // 添加Authorization头部，值为token
            }
            return config;
        });
    }
    
    post(path, data) {
        // 封装POST请求方法
        // path: 请求路径（如："/auth/login"）
        // data: 请求体数据
        // 实际请求URL = baseURL + path（如："http://localhost:8000/auth/login"）
        //return this.instance.post(path, data); // 发送POST请求并返回Promise
        return new Promise(async (resolve, reject) => {
            //await:网络请求发送出去后，线程会挂起这个等待
            //等网络数据到达后，线程又会回到当前位置开始往后执行
            //如果在某个函数中使用await，则会阻塞当前线程，直到网络请求返回后才会继续执行，且函数必须定义为async
            //axios底层也是用的Promise对象，在响应的状态码不是200时，会抛出异常
            //调用reject的结果是，外层的函数会抛出异常
            try {
                //走到这里状态码肯定是200
                let result = await this.instance.post(path, data)// 发送POST请求并返回Promise
                resolve(result.data)// 成功时调用resolve，将结果返回
            } catch (err) {
                // 状态码不是200时，捕获异常，返回错误信息
                //console.log(err)
                let detail = err.response.data.detail
                reject(detail)// 失败时调用reject，将错误信息返回
            }
        })
    }
    
    get(path, params) {// 封装GET请求方法
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.instance.get(path, {params})//params为啥要加大括号？
                resolve(result.data)
            }
            catch (err) {
                let detail = err.response.data.detail
                reject(detail)
            }
        })
    }

    put(path, data) {// 封装PUT请求方法,用来更新数据
    return new Promise(async (resolve, reject) => {
        try {
            let result = await this.instance.put(path, data)
            resolve(result.data);
        } catch(err) {
            let detail = err.response.data.detail;
            reject(detail)
        }
    })
    }
    
    delete(path){
        return new Promise(async (resolve, reject) => {
            try{
                let result = await this.instance.delete(path)
                // 因为服务端的delete方法，只是返回一个状态码，并没有数据，所以直接把result返回回去就可以了
                resolve(result);
            } catch (err) {
                try{
                     let detail = err.response.data.detail;
                    reject(detail)
                } catch {
                    reject("服务器错误")
                }
               
            }
        })
    }

    downloadFile(path, params) {
          return new Promise(async (resolve, reject) => {
            try {
                // 请求二进制流（文件）时需要设置 responseType 为 'blob'
                let result = await this.instance.get(path, {
                    params,
                    responseType: 'blob'
                })
                // 返回完整的 axios 响应，调用方可通过 response.data 获得 Blob
                resolve(result)
            }
            catch (err) {
                let detail = (err && err.response && err.response.data && err.response.data.detail) || err.message || '服务器错误'
                reject(detail)
            }
        })
    }


}
export default new Http();
// 导出Http类的单例实例，方便全局使用