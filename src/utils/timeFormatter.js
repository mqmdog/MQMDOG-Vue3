const stringFromDate = (date) => {
    // 如果传入的是字符串，先转换为Date对象
    if (typeof date === 'string') {
        date = new Date(date)
    }

    // 获取年、月、日并补零
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')  // 月份从0开始，需要+1
    const day = date.getDate().toString().padStart(2, '0')           // 日期补零
    
    const formattedDate = `${year}-${month}-${day}`
    return formattedDate
}

const stringFromDateTime = (date) => {
    // 如果传入的是字符串，先转换为Date对象
    if (typeof date === 'string') {
        date = new Date(date)
    }

    // 获取年、月、日、时、分、秒并补零
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    
    const formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`
    return formattedDate
}

export default {
    stringFromDate: stringFromDate,
    stringFromDateTime,
}