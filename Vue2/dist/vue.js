(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    function initState(vm) {
      var opts = vm.$options;
      if (opts.data) {
        initData(vm);
      }
    }
    function initData(vm) {
      var data = vm.$options.data;
      data = typeof data === 'function' ? data.call(vm) : data;
    }

    // 初始化
    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        console.log('options', options);
        // 在当前的实例上扩展一些属性$options $data...
        // 为什么要定义这些属性？如果使用使用options的话，在其他扩展方法里拿不到。扩展一些属性，可以通过this拿到这个属性
        // 为什么属性要以$开头，认为是Vue自己的属性。如果自己在data中用$定义变量，实例上拿不到的
        var vm = this;
        vm.$options = options; // 将用户的选项挂载实例上

        // 初始化状态/数据（Vue中的状态：props、data、computed、methods、watch）
        initState(vm);
        // todo...模板编译、创建虚拟dom。。。
      };
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

    // vue源码里没有直接使用class定义一个类。类的特点：将所有的方法都耦合在一起，功能越来越多，很难维护。vue在设计的时候使用构造函数，把扩展的内容挂载到原型上，放到不同的文件中，好维护。
    function Vue(options) {
      this._init(options);
    }

    // 初始化
    initMixin(Vue); // 扩展了init方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
