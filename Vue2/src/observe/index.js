import {
    newArrayProto
} from "./array"

class Observer {
    constructor(data) {
        // data.__ob__ = this; // this为observe,放在data的自定义__ob__属性上;这样的好处：给数组加了一个标识，如果数据上有__ob__，说明数据已经被观察过了

        // 如果data不是数组是对象，这样给对象添加这个__ob__属性，然后去循环，会出现死循环

        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false // 不可枚举（循环的时候，无法获取）
        })


        // Object.defineProperty只能劫持已存在的属性，对新增属性和删除属性不劫持（为此vue2单独写了一些API来解决$set $delete）
        if (Array.isArray(data)) { // 如果是数组就有两种情况：第一：重写7个方法、第二：数组中的引用类型也需要劫持
            // 重新数组中的方法，7个方法可以修改数组本身的。还有将数组中的引用类型也需要劫持
            // data.__proto__ = { 不采用这种方式是因为会把原始的push给干掉了
            //     push() {
            //         console.log('重写的push')
            //     }
            data.__proto__ = newArrayProto // 拦截方法，并没有对新增的属性做劫持？
            // } 保留数组原有的特性：concat join等，并且重新部分的方法
            this.observeArray(data)
        } else {
            this.walk(data) // 遍历对象
        }
    }
    walk(data) { // 循环对象 对属性依次劫持
        // 拿到每个属性，“重新定义”每个属性，导致性能不好
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }
    observeArray(data) { // 将数组中的引用类型也需要劫持
        data.forEach(item => observe(item))
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
            observe(newVal) // 有可能用户设置的值也是对象
            value = newVal
        }
    })
}

export function observe(data) {
    // 对这个data对象进行劫持
    if (typeof data !== 'object' || data === null) {
        return // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) { // 说明这个对象已经被代理过了
        return data.__ob__
    }

    // 如果一个对象被劫持过了，那就不要再被劫持了（如何判断一个对象是否被劫持过？可以新增一个实例，用实例来判断是否被劫持过）
    return new Observer(data)
}