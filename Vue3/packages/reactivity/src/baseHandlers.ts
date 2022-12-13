// 是不是仅读的，没有set，会报异常
// 是不是深度的

import { extend, isObject } from "@vue/shared"
import { reactive, readonly } from "./reactive"

const get = createGetter()
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

export const mutableHandlers = {
    get,
    set
}
export const shallowReactiveHandlers = {
    get: shallowGet,
    shallowSet
}
const readonlyObj = {
    set: (target, key) => {
        console.warn(`set ${target} on key ${key} failed`)
    }
}
export const readonlyHandlers = extend({
    get: readonlyGet  
}, readonlyObj)
export const shallowReadonlyHandles = extend({
    get: shallowReadonlyGet
}, readonlyObj)

// 拦截获取功能
function createGetter (isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        // proxy + reflect
        // 后续Object上的方法，会被迁移到 Reflect上  Reflect.getProperty)
        // 以前target[key] = value 方法设置值可能会失败，但是不会报异常，也没有返回值
        // Reflect 方法具备返回值
        const res = Reflect.get(target, key, receiver) // target[key]

        if (!isReadonly) {
            // 收集依赖，等会数据变化后更新对应的试图
        }
        if (shallow) {
            return res
        }
        if (isObject(res)) { // vue2 是一上来就递归，vue3是当前取值时会进行代理。称为懒代理
            return isReadonly ? readonly(res) : reactive(res)
        }
        return res
    }
}
// 拦截设置功能
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver) // target[key] = value
        return result
    }
}