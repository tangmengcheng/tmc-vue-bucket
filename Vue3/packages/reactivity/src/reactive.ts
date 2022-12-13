import { isObject } from '@vue/shared'

import {
    mutableHandlers,
    shallowReactiveHandlers,
    readonlyHandlers,
    shallowReadonlyHandles
} from './baseHandlers'

export function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandles)
}

const reactiveMap = new WeakMap() // 会自动垃圾回收，不会造成内存泄露，存储的key只能是对象
const readonlyMap = new WeakMap()

/**
 * 柯里化，new Proxy() 最核心的需要拦截数据的读取和修改 -> get set
 * @param target 目标对象
 * @param isReadonly 是否只读
 * @param baseHandlers 处理器函数
 */
export function createReactiveObject(target, isReadonly, baseHandlers) {
    // 如果目标不是对象，没法拦截，reactive这个api只能拦截对象
    if(!isObject(target)) {
        return target
    }

    // 如果某个对象已经被代理过了，就不要再代理了(可能一个对象被代理是深度，又被仅读代理)
    const proxyMap = isReadonly ? readonlyMap : reactiveMap

    const existProxy = proxyMap.get(target)
    if (existProxy) {
        return existProxy // 如果已经被代理了 直接返回即可
    }

    const proxy = new Proxy(target, baseHandlers)

    proxyMap.set(target, proxy) // 将要代理的对象和对应代理结果缓存起来

    return proxy
}