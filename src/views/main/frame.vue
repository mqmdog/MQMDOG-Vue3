<script setup name="frame">
import frame_img from '@/assets/image/frame.png'
import { ref, computed, reactive,onMounted } from "vue"//引入响应式变量和计算属性
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
    Expand,
    Fold,
} from '@element-plus/icons-vue'
import authHttp from '@/api/authHttp'
import { ElMessage } from 'element-plus'
import routes from "@/router/frame.js"



const router = useRouter() //获取路由实例
const authStore = useAuthStore() //获取认证状态管理实例
let defaultActive = ref("home") //默认激活的菜单项，初始值为"home"，会在组件挂载时更新为当前路由的名称


let displayUser = reactive({  //右上角显示在界面上的用户信息
    department: {},
    realname: ""
})

const onExits = () => {//退出登录
    authStore.cleanUserToken();  // 清除用户信息和token
    router.push({ name: 'login' });  // 跳转到登录页

}


let isCollapse = ref(false) //侧边栏是否收起
let asidewith = computed(() => {
    return isCollapse.value ? '64px' : '200px'
})
const onCollapseAside = () => { //侧边栏收起展开切换
    isCollapse.value = !isCollapse.value
}


let dialogVisible = ref(false) //弹窗是否显示

let resetPwdForm = reactive({
    oldpwd: '',
    pwd1: '',
    pwd2: '',
})

let formLabelWidth = '100px'



const onControlResetPwdDialog = () => {
    resetPwdForm.oldpwd = ''
    resetPwdForm.pwd1 = ''
    resetPwdForm.pwd2 = ''
    dialogVisible.value = true
}

let rules = reactive({
    oldpwd: [
        { required: true, message: '请输入旧的密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' },
    ],
    pwd1: [
        { required: true, message: '请输入新的密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' },
    ],
    pwd2: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
    ],

})

onMounted(() => {
    defaultActive.value = router.currentRoute.value.name
    displayUser.department = authStore.user.department
    displayUser.realname = authStore.user.realname
})

let formTag = ref()//表单实例，用于调用表单验证方法,后面会通过 ref="formTag" 绑定到 el-form 组件上

const onSubmit = () => {
    formTag.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                await authHttp.resetPwd(resetPwdForm.oldpwd, resetPwdForm.pwd1, resetPwdForm.pwd2)
                ElMessage.success('密码修改成功')
                dialogVisible.value = false
            }
            catch (error) {
                ElMessage.error(error)
            }
        } else {
            ElMessage.error('请检查输入的密码是否正确')
        }
    })
}


//测试参数传递

//console.log("user:", authStore.user)
//console.log("token:", authStore.token)



</script>

<template>
    <!-- 背景包装容器 -->
    <div class="bg-wrapper" :style="{ '--bg-image': `url(${frame_img})` }">
        <el-container class="layout-container">
            <el-aside class="sidebar" :width="asidewith">
                <!-- Logo/品牌区域 -->
                <div class="brand-area">
                    <router-link to="/" class='brand'>X<span v-show="!isCollapse">HC-OA系统</span></router-link> 
                </div>

                <!-- 导航菜单 -->
                <el-menu :router="true" class="custom-menu" :default-active="defaultActive" :collapse="isCollapse"
                    :collapse-transition="false">
                    <template v-for="route in routes[0].children">
                        <template v-if="authStore.has_permission(route.meta.permissions,route.meta.opt)">  <!-- 调用authStore.has_permission检查权限 -->
                            <el-menu-item v-if="!route.children" :index="route.name" :route="{ name: route.name }">
                                <el-icon>
                                    <component :is="route.meta.icon" />
                                </el-icon>
                                <span>{{ route.meta.text }}</span>
                            </el-menu-item>
                            <el-sub-menu v-else :index="route.name">
                                <template #title>
                                    <el-icon>
                                        <component :is="route.meta.icon" />
                                    </el-icon>
                                    <span>{{ route.meta.text }}</span>
                                </template>
                                <template v-for="child in route.children">
                                    <template v-if='authStore.has_permission(child.meta.permissions,child.meta.opt)'>
                                        <el-menu-item v-if="!child.meta.hidden" :index="child.name"
                                            :route="{ name: child.name }">
                                            <el-icon>
                                                <component :is="child.meta.icon" />
                                            </el-icon>
                                            <span>{{ child.meta.text }}</span>
                                        </el-menu-item>

                                    </template>
                                    
                                </template>
                            </el-sub-menu>
                        </template>
                        
                    </template>
                </el-menu>
            </el-aside>

            <el-container class="main-container">
                <el-header class="header">
                    <el-button v-show="isCollapse" :icon="Expand" circle size="small" @click="onCollapseAside" />
                    <el-button v-show="!isCollapse" :icon="Fold" circle size="small" @click="onCollapseAside" />
                    <el-dropdown>
                        <span class="el-dropdown-link">
                            <el-avatar :size="32" icon="UserFilled" />
                            <span style="margin-left: 10px;">[{{authStore.user.department.name}}]{{ authStore.user.realname }}</span>
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="onControlResetPwdDialog">修改密码</el-dropdown-item>
                                <el-dropdown-item divided @click="onExits">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>

                </el-header>
                <el-main class="content">
                    <RouterView></RouterView>
                </el-main>
            </el-container>
            <el-dialog v-model="dialogVisible" title="修改密码" width="500">
                <el-form :model="resetPwdForm" :rules="rules" ref="formTag">
                    <el-form-item label="旧的密码" :label-width="formLabelWidth" prop="oldpwd">
                        <el-input v-model="resetPwdForm.oldpwd" autocomplete="off" type="password" />
                    </el-form-item>
                    <el-form-item label="新的密码" :label-width="formLabelWidth" prop="pwd1">
                        <el-input v-model="resetPwdForm.pwd1" autocomplete="off" type="password" />
                    </el-form-item>
                    <el-form-item label="确认密码" :label-width="formLabelWidth" prop="pwd2">
                        <el-input v-model="resetPwdForm.pwd2" autocomplete="off" type="password" />
                    </el-form-item>

                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="onSubmit">
                            确认
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </el-container>
    </div>
</template>

<style scoped>
/* 品牌区域 */
.brand-area {
    padding: 20px 0;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 10px;
}

.brand {
    text-decoration: none;
    color: white;
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 2px;
    display: block;
    padding: 10px;
    transition: all 0.3s;
}

.brand:hover {
    color: #ffd04b;
    transform: scale(1.05);
}

/* 外层容器 */
.bg-wrapper {
    position: relative;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

/* 背景图片层 */
.bg-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: blur(2px) brightness(0.95);
    z-index: 0;
}

/* 半透明遮罩层 */
.bg-wrapper::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.15);
    z-index: 0;
}

/* 布局容器 */
.layout-container {
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 10;
}

/* 左侧边栏 */
.sidebar {
    display: flex;
    flex-direction: column;
    background: rgba(44, 62, 80, 0.9);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 20;
    padding: 0;
    overflow: hidden;
}

/* 自定义菜单样式 */
.custom-menu {
    flex: 1;
    border-right: none;
    background-color: transparent !important;
}

/* 菜单整体样式 */
:deep(.custom-menu) {
    background-color: transparent !important;
}

:deep(.custom-menu .el-menu) {
    background-color: transparent !important;
    border-right: none;
}

:deep(.custom-menu .el-sub-menu__title),
:deep(.custom-menu .el-menu-item) {
    height: 50px;
    line-height: 50px;
    color: rgba(255, 255, 255, 0.8) !important;
    background-color: transparent !important;
    transition: all 0.3s;
}

:deep(.custom-menu .el-sub-menu__title:hover),
:deep(.custom-menu .el-menu-item:hover) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
}

:deep(.custom-menu .el-menu-item.is-active) {
    background-color: rgba(52, 152, 219, 0.2) !important;
    color: #ffd04b !important;
    border-right: 3px solid #ffd04b;
}

:deep(.custom-menu .el-icon) {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 18px;
}

:deep(.custom-menu .el-menu-item-group__title) {
    padding: 10px 0 5px 20px;
    color: rgba(255, 255, 255, 0.6) !important;
    font-size: 12px;
}

/* 子菜单项 */
:deep(.custom-menu .el-menu-item-group .el-menu-item) {
    padding-left: 50px !important;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
}

/* 顶部栏 */
.header {
    background: rgba(255, 255, 255, 0.95);
    color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 2px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    text-transform: uppercase;
    position: relative;
    z-index: 20;
}

/* 内容区域 */
.content {
    background: rgba(255, 255, 255, 0.92);
    color: #333;
    padding: 30px;
    font-size: 20px;
    font-weight: 500;
    margin: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 20;
}

/* 右侧容器 */
.main-container {
    background: transparent;
    position: relative;
    z-index: 15;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .brand {
        font-size: 16px;
    }

    .sidebar {
        width: 60px !important;
    }

    .brand span {
        display: none;
    }

    :deep(.custom-menu span) {
        display: none;
    }

    :deep(.custom-menu .el-sub-menu__icon-arrow) {
        display: none;
    }

    .header {
        font-size: 18px;
        padding: 0 10px;
    }

    .content {
        padding: 15px;
        font-size: 16px;
    }
}

/* 确保所有Element Plus组件的背景都透明 */
:deep(.el-container),
:deep(.el-aside),
:deep(.el-header),
:deep(.el-main) {
    background-color: transparent;
}
</style>