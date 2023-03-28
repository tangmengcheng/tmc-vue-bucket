// vue源码里没有直接使用class定义一个类。类的特点：将所有的方法都耦合在一起，功能越来越多，很难维护。vue在设计的时候使用构造函数，把扩展的内容挂载到原型上，放到不同的文件中，好维护。

import {
    initMixin
} from "./init"
import {
    renderMixin
} from './render'
import {
    lifecycleMixin
} from './lifecycle'

function Vue(options) {
    this._init(options)
}

// 初始化
initMixin(Vue) // 扩展了init方法
renderMixin(Vue)
lifecycleMixin(Vue)
// Vue.prototype._init = function () {

// }
// 把原型上方法扩展成一个个的函数，通过函数的方式，在其原型上扩展功能

export default Vue