class Observe {
    constructor(data) {
        // Object.defineProperty只能劫持已存在的属性，对新增属性和删除属性不劫持（为此vue2单独写了一些API来解决$set $delete）
        this.walk(data) // 遍历对象
    }
    walk(data) { // 循环对象 对属性依次劫持
        // 拿到每个属性，“重新定义”每个属性，导致性能不好
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
}

// 闭包（get set方法 都能拿到value）
export function defineReactive(target, key, value) { // 属性劫持
    observe(value) // value可能是对象，递归劫持。对所有的对象属性进行劫持
    Object.defineProperty(target, key, {
        get() { // 取值的时候会执行get
            console.log('取值了')
            return value
        },
        set(newVal) { // 设置值的时候会执行set
            console.log('设置值了')
            if (newVal === value) return
            value = newVal
        }
    })
}

export function observe(data) {
    // 对这个data对象进行劫持
    if (typeof data !== 'object' || data === null) {
        return // 只对对象进行劫持
    }

    // 如果一个对象被劫持过了，那就不要再被劫持了（如何判断一个对象是否被劫持过？可以新增一个实例，用实例来判断是否被劫持过）
    return new Observe(data)
}