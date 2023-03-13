import {
    observe
} from "./observe/index.js"

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key] // vm.name === vm._data.name
        },
        set(newVal) {
            vm[target][key] = newVal
        }
    })
}

function initData(vm) {
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm) : data

    vm._data = data // 在实例上可以获取数据

    // 拿到数据后，要对数据劫持。vue2里采用了一个api, defineProperty
    observe(data) // 观测数据，单独

    // 将vm._data用vm代理
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}