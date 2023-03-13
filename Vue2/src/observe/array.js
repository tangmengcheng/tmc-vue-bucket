// 重新数组中的部分方法

let oldArrayProto = Array.prototype // 获取数组的原型

// Array.prototype.push = function() { 这样会把原来的push功能干掉了，我们需要原来的功能还在，此时我们可以拷贝一份
// }

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto)

let methods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'reserve',
    'sort',
    'splice'
] // concat slice都不会改变原数组

methods.forEach(method => {
    newArrayProto[method] = function (...args) { // 重写了数组的方法
        const result = oldArrayProto[method].call(this, ...args) // 内部调用原来的方法，函数劫持。AOP
        // this 就是 data
        // 需要对新增的数据 再次进行劫持
        let inserted;
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift': // arr.push(1, 2, 3)
                inserted = args
                break;
            case 'splice': // arr.splice(0, 1, {}, {}...)
                inserted = args.slice(2)
            default:
                break;
        }
        console.log('inserted', inserted) // 新增的内容
        if (inserted) { // inserted是数组类型，观察数组，要调用observeArray方法
            ob.observeArray(inserted)
        }
        return result
    }
})