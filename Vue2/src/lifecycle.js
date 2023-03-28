import Watcher from "./observe/watcher"
import {
    patch
} from './vdom/patch'

export function lifecycleMixin(Vue) {
    // vnode虚拟节点
    Vue.prototype._update = function (vnode) {
        const vm = this
        // 我要通过虚拟节点，渲染出真实的DOM
        vm.$el = patch(vm.$el, vnode) // 需要用虚拟节点创建出真实节点  替换掉真实的$el
        // console.log(vnode)
    }
}

export function mountComponent(vm, el) {
    const options = vm.$options // render
    vm.$el = el // 真实的DOM元素

    console.log(options, vm.$el)
    // 渲染页面

    // 渲染方法
    let updateComponent = () => { // 无论是渲染还是更新都会调用此方法
        // _render() 返回虚拟DOM
        // _update() 将虚拟DOM转换成真实的DOM
        vm._update(vm._render())
    }

    // 怎么渲染呢？就是利用渲染watcher; 每个组件都有一个watcher
    // () => {} ===> $watch(() => {}) 表示里面的回调函数
    new Watcher(vm, updateComponent, () => {}, true) // true 表示它是一个渲染watcher
}

// Watcher 就是用来渲染的
// vm._render 通过解析的render方法 渲染出虚拟DOM  _c _v _s
// vm._update 通过虚拟DOM  创建真实的DOM