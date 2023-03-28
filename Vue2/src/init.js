import {
    initState
} from "./state"

import {
    compilerToFunction
} from './compiler/index.js'
import {
    mountComponent
} from "./lifecycle"

// 初始化
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // console.log('options', options)
        // 在当前的实例上扩展一些属性$options $data...
        // 为什么要定义这些属性？如果使用使用options的话，在其他扩展方法里拿不到。扩展一些属性，可以通过this拿到这个属性
        // 为什么属性要以$开头，认为是Vue自己的属性。如果自己在data中用$定义变量，实例上拿不到的
        const vm = this
        vm.$options = options // 将用户的选项挂载实例上

        // 初始化状态/数据（Vue中的状态：props、data、computed、methods、watch）
        initState(vm)
        // todo...模板编译、创建虚拟dom。。。


        // 如果用户传了el属性，需要将页面渲染出来
        // 如果用户传入了el，就要实现挂载流程
        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)
        // 默认会先查找render方法，-》template -> el的内容

        if (!options.render) {
            // 对模板进行编译
            let template = options.template
            if (!template && el) {
                template = el.outerHTML
            }
            // console.log(template)
            // 我们需要将template 转化成render函数
            const render = compilerToFunction(template)
            options.render = render
        }

        // 渲染当前的组件，挂载这个组件
        mountComponent(vm, el)
    }
}

// 状态初始化，和初始化没什么关系，需拆分单独管理
// function initState(vm) {
//     const opts = vm.$options
//     // if (opts.props)
//     if (opts.data) {
//         initData(vm)
//     }
// }
// function initData(vm) {
//     let data = vm.$options.data
//     // data可以是对象或函数[根使用可以是对象也可以是函数；组件一定是函数]（Vue3解决了，认为都是函数）
//     data = typeof data === 'function' ? data.call(vm) : data
//     console.log('data', data)
// }