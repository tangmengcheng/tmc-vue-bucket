import {
    createElement,
    createTextNode
} from "./vdom/create-element"

export function renderMixin(Vue) {
    // _c 创建元素的虚拟节点
    // _v 创建文本的虚拟节点
    // _s JSON.stringify()
    Vue.prototype._c = function () {
        return createElement(...arguments) // tag, data, children...
    }
    Vue.prototype._v = function (text) {
        return createTextNode(text)
    }
    // 把数据格式为字符串
    Vue.prototype._s = function (val) {
        return val === null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val)
    }
    Vue.prototype._render = function () {
        console.log('render')
        const vm = this
        const {
            render
        } = vm.$options
        let vnode = render.call(vm) // 改变this指向


        return vnode // 虚拟DOM
    }
}