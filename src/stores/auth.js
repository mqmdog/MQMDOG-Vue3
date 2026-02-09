//这是一个Pinia的store，用于管理用户的认证状态和权限信息。它定义了一个名为useAuthStore的store，其中包含了用户信息、token、登录状态、权限信息等相关的数据和方法。通过这个store，组件可以方便地获取和更新用户的认证状态和权限信息，实现用户登录、退出登录、权限检查等功能。
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const USER_KEY = "OA_USER_KEY"
const TOKEN_KEY = "OA_TOKEN_KEY"
  

export const PermissionChoices = {
  // 所有权限
  All: 0b111,
  // 普通员工权限
  Staff: 0b000,
  // 需要董事会权限
  Boarder: 0b001,
  // TeamLeader权限
  Leader: 0b010,
}


export const useAuthStore = defineStore('auth', () => {
    let _user = ref({})
    let _token = ref("")
    
    function setUserToken(user, token) {
      //保存在对象上（内存中），刷新页面依旧可以获取到数据
      _user.value = user
      _token.value = token

      //存储到浏览器的localStorage中（硬盘上），电脑关掉后再打开依旧可以获取到数据
      //存储用户信息,其中localStroage.setItem(key,value)方法可以将数据存储在浏览器的localStorage中，key为字符串，value为字符串或对象
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(TOKEN_KEY, token)
  }

    function cleanUserToken() {//退出登录时，清除用户信息和token
    _user.value = {}
    _token.value = ""
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
  
  //计算属性,为什么要设置呢？因为计算属性可以缓存数据，当数据不变时，可以直接从缓存中获取数据，而不是每次都要重新计算，提高性能
  let user = computed(() => {
    //如果用户信息为空，则从localStorage中获取用户信息
    if (Object.keys(_user.value).length === 0) {
      let user_str = localStorage.getItem(USER_KEY)
      if (user_str) {
        _user.value = JSON.parse(user_str)
      }
    }
    return _user.value//返回计算属性
  })

  let token = computed(() => {
    if (!_token.value) {
      let token_str = localStorage.getItem(TOKEN_KEY)
      if (token_str) {
        _token.value = token_str
      }
    }
    return _token.value
  })


  let is_logined = computed(() => { //计算属性，判断用户是否登录
    // 使用 `user` 和 `token` 计算属性来触发从 localStorage 的恢复
    if (Object.keys(user.value).length > 0 && token.value) {
      return true;
    }
    return false;
  })

  let own_permissions = computed(() => {
    // 0b000
    let _permissions = PermissionChoices.Staff
    if(is_logined.value){
      // 判断是否是董事会成员
      if(user.value.department && user.value.department.name == '董事会'){
        // 0b000 | 0b001 = 0b001
        _permissions |= PermissionChoices.Boarder
      }

      // 判断是否是team leader
      // 后端可能使用 `leader_id` 或 `leader` 字段，兼容两种情况
      if(user.value.department && (user.value.department.leader_id == user.value.uid || user.value.department.leader == user.value.uid)){
        _permissions |= PermissionChoices.Leader
      }
    }
    return _permissions
  })

  function has_permission(permissions, opt='|'){
    // opt可选值：
    // 1. |：或运算
    // 2. &：且运算
    // own_permissions: 0b001
    // permissions: [0b010, 0b001]
    let results = permissions.map((permission) => (permission&own_permissions.value)==permission)
    // results = [true, false, false, true]
    if(opt == "|"){
      if(results.indexOf(true) >= 0){
        return true;
      }else{
        return false;
      }
    }else{
      if(results.indexOf(false) >= 0){
        return false;
      }else{
        return true
      }
    }
  }



  return { setUserToken, user, token, is_logined, cleanUserToken, has_permission, own_permissions }//返回对象，包含方法和计算属性
})