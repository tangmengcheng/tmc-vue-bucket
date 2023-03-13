(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);
      // Object.defineProperty只能劫持已存在的属性，对新增属性和删除属性不劫持（为此vue2单独写了一些API来解决$set $delete）
      this.walk(data); // 遍历对象
    }
    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 对属性依次劫持
        // 拿到每个属性，“重新定义”每个属性，导致性能不好
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }]);
    return Observe;
  }(); // 闭包（get set方法 都能拿到value）
  function defineReactive(target, key, value) {
    // 属性劫持
    observe(value); // value可能是对象，递归劫持。对所有的对象属性进行劫持
    Object.defineProperty(target, key, {
      get: function get() {
        // 取值的时候会执行get
        console.log('取值了');
        return value;
      },
      set: function set(newVal) {
        // 设置值的时候会执行set
        console.log('设置值了');
        if (newVal === value) return;
        value = newVal;
      }
    });
  }
  function observe(data) {
    // 对这个data对象进行劫持
    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象进行劫持
    }

    // 如果一个对象被劫持过了，那就不要再被劫持了（如何判断一个对象是否被劫持过？可以新增一个实例，用实例来判断是否被劫持过）
    return new Observe(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key]; // vm.name === vm._data.name
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; // 在实例上可以获取数据

    // 拿到数据后，要对数据劫持。vue2里采用了一个api, defineProperty
    observe(data); // 观测数据，单独

    // 将vm._data用vm代理
    for (var key in data) {
      proxy(vm, '_data', key);
    }
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
