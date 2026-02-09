import http from './http'

const getAbsentTypes = () => {// 封装获取缺勤类型接口
    const path = '/absent/type'
    return http.get(path)
}

const getResponder = () => {// 封装获取缺勤处理人接口
    const path = '/absent/responder'
    return http.get(path)
}

const applyAbsent = (data) => {// 封装提交缺勤申请接口
    const path = '/absent/absent'
    return http.post(path, data)
}

const getMyAbsents = (page = 1) => {// 封装获取我的缺勤列表接口
    const path = '/absent/absent?who=my&page=' + page
    return http.get(path)
}

const getSubAbsents = (page = 1) => {// 封装获取下属缺勤列表接口
    const path = '/absent/absent?who=sub&page=' + page
    return http.get(path) //返回一个Promise对象，外层调用时可以使用.then()方法处理结果，也可以使用async/await语法处理结果
}

const handleSubAbsent = (absent_id, status, response_content) => {// 封装处理下属缺勤接口
    const path = "/absent/absent/" + absent_id
    return http.put(path, {status, response_content})
}

export default {// 导出接口
    getAbsentTypes,
    getResponder,
    applyAbsent,
    getMyAbsents,
    getSubAbsents,
    handleSubAbsent,
}