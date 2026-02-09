<script setup name="login">
import login_img from '@/assets/image/login.png'
import { reactive } from 'vue'
import authHttp from '@/api/authHttp'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router' //用来做路由跳转
import { ElMessage } from 'element-plus'//用来做提示信息


const authStore = useAuthStore()//初始化authStore
const router = useRouter()//初始化router


let form=reactive({  // 双向绑定的表单数据
    email: '',
    password: ''
})

const onSubmit = async () => { //后面使用了await，所以这里要用async
    let pwdRgx = /^[0-9a-zA-Z_-]{6,20}$/; // 密码正则：6-20位字母、数字、下划线、减号
    let emailRgx = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;// 邮箱正则
    if (!emailRgx.test(form.email)) {
        // alert("请输入有效的邮箱地址！");
        ElMessage.info("请输入有效的邮箱地址！");
        return;
    }
    if (!pwdRgx.test(form.password)) {
        //alert("密码格式不正确，请输入6-20位的字母、数字、下划线或减号组成的密码！");
        ElMessage.info("密码格式不正确，请输入6-20位的字母、数字、下划线或减号组成的密码！");
        return;
    }

    // 版本1：直接使用axios发送请求
    // axios.post('http://127.0.0.1:8000/auth/login', {//发送POST请求到登录接口,这是我们在pycharm中运行的后端地址
    //     email: form.email,
    //     password: form.password
    // }).then((res) => { //res代表响应对象,包含email和password
    //     let data = res.data//获取响应数据
    //     let token = data.token; 
    //     let user = data.user;
    //     //console.log("登录成功，用户信息：", user);
    //     //console.log("收到的token：", token);
    //     authStore.setUserToken(user, token)//设置用户信息和token到authStore中
    //     router.push({name: 'frame'})//跳转到首页
    // }).catch((err) => {
    //     let detail=err.response.data.detail;
    //     alert("登录失败！"+detail);
    // });
    //返回promise对象，用then方法如何处理响应呢？其实是一个回调函数，其参数就是响应数据，代表返回的状态码是200
    //如果请求失败，则会进入catch方法，处理错误信息,代表返回的状态码是400（pycharm中定义的）

    // 版本2：对axios进行一层封装，使用authHttp发送请求
    // authHttp.login(form.email, form.password).then(res => {
    //     let data = res.data//获取响应数据
    //     let token = data.token;
    //     let user = data.user;
    //     authStore.setUserToken(user, token)//设置用户信息和token到authStore中
    //     router.push({ name: 'frame' })//跳转到首页
    // }).catch(err => {
    //     let detail = err.response.data.detail;
    //     alert("登录失败！" + detail);
    // })

    // 版本3：用promise实现异步调用
    try {
        let data = await authHttp.login(form.email, form.password)
        let token = data.token;
        let user = data.user;
        authStore.setUserToken(user, token)//设置用户信息和token到authStore中
        console.log("登录成功，用户信息：", user);
        console.log(authStore.user, authStore.token, authStore.own_permissions)
        router.push({ name: 'home' })//跳转到首页
    } catch (detail) {//catch捕获到了reject抛出的错误信息，并打印出来
        //alert(detail)
        ElMessage.error(detail)
    }
}
</script>

<template>
    <!-- 全屏背景容器 -->
    <div class="fullscreen-background">
        <!-- 背景图片 -->
        <div class="background-image">
            <img :src="login_img" alt="背景图片" />
        </div>

        <!-- 毛玻璃效果的登录框 -->
        <div class="blur-login-container">
            <div class="login-box">
                <!-- 登录表单 -->
                <div class="login-form">
                    <h2 class="login-title">人员登陆</h2>

                    <!-- 邮箱输入 -->
                    <div class="input-group">
                        <div class="input-icon">
                            <i class="iconfont icon-fa-envelope"></i>
                        </div>
                        <input type="text" class="form-input" placeholder="邮箱" name="email" v-model="form.email" />
                    </div>

                    <!-- 密码输入 -->
                    <div class="input-group">
                        <div class="input-icon">
                            <i class="iconfont icon-fa-lock"></i>
                        </div>
                        <input type="password" class="form-input" placeholder="密码" name="password" v-model="form.password" />
                    </div>

                    <!-- 登录按钮 -->
                    <button class="login-btn" @click="onSubmit">
                        登陆
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 引入图标字体 */
@import '@/assets/iconfont/iconfont.css';

/* 全屏背景容器 */
.fullscreen-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

/* 背景图片样式 - 充满整个页面 */
.background-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.background-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* 保持图片比例并覆盖整个区域 */
    object-position: center;
    /* 图片居中显示 */
}


/* 毛玻璃登录容器 */
.blur-login-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(0px);
    -webkit-backdrop-filter: blur(0px);
    background-color: rgba(0, 0, 0, 0.4);
}

/* 登录框样式 - 处于页面右侧区域 */
.login-box {
    position: absolute;
    top: 50%;
    left: 65%;
    /* 从左侧开始计算，65%位置处 */
    transform: translateY(-50%);
    width: 380px;
    padding: 40px;
    background-color: rgba(255, 255, 255, 0.85);
    border-radius: 15px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

/* 登录表单 */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.login-title {
    text-align: center;
    color: #333;
    font-size: 28px;
    margin-bottom: 10px;
    font-weight: 600;
}

/* 输入组 */
.input-group {
    position: relative;
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.input-group:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.input-icon {
    padding: 0 15px;
    color: #666;
    font-size: 18px;
}

.form-input {
    width: 100%;
    padding: 15px;
    border: none;
    background: transparent;
    font-size: 16px;
    outline: none;
    color: #333;
}

.form-input::placeholder {
    color: #999;
}

/* 登录按钮 */
.login-btn {
    padding: 15px;
    background-color: #1890ff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
}

.login-btn:hover {
    background-color: #40a9ff;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(24, 144, 255, 0.3);
}

.login-btn:active {
    transform: translateY(0);
}
</style>