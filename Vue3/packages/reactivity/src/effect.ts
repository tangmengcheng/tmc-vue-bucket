export function effect(fn, options:any = {}) {
    const effect = createReactiveEffect(fn, options)

    if (!options.lazy) {
        effect() // 默认effect会先执行一次
    }

    return effect
}

let uid = 0
let activeEffect; // 存储当前的effect
const effectStack = [] // 栈：解决了key对应的effect是正确的
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        if(!effectStack.includes(effect)) { // 防止重复频繁刷新
            try { // fn函数执行过程可能发生异常
                console.log('todo....')
                effectStack.push(effect)
                activeEffect = effect
                return fn()
            } finally {
                effectStack.pop()
                activeEffect = effectStack[effectStack.length - 1]
            }
        }
    }
    effect.id = uid // 制作一个effect标识，用于区分effect，源码用于排序
    effect._isEffect = true // 用于标识这个是响应式effect
    effect.raw = fn // 暴露effect对应的原函数
    effect.options = options // 在effect上保存用户的属性

    return effect
}

const targetMap = new WeakMap()
/**
 * 让对象中的某个属性与effect关联起来
 * @param target 目标对象
 * @param type 操作类型
 * @param key 属性
 */
export function track(target, type, key) { // 可以拿到当前的effect
    // console.log(target, type, key, activeEffect)
    if(activeEffect === undefined) { // 此属性不用收集依赖，因为没在effect中使用
        return
    }
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = new Set())) // set可以去重，一个属性有可能对应多个effect
    }
    if (!dep.has(activeEffect)) {
        dep.add(activeEffect)
    }
    console.log(targetMap)
}

// 为什么要用栈来存当前effect？
// 函数调用是一个栈型结构
// effect(()=> { // effect1
//     state.name
//     effect(() => { // effect1
//         state.age
//     })
//     state.address
// })