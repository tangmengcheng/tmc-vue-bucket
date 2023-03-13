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

  // 重新数组中的部分方法

  var oldArrayProto = Array.prototype; // 获取数组的原型

  // Array.prototype.push = function() { 这样会把原来的push功能干掉了，我们需要原来的功能还在，此时我们可以拷贝一份
  // }

  // newArrayProto.__proto__ = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reserve', 'sort', 'splice']; // concat slice都不会改变原数组

  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 重写了数组的方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法，函数劫持。AOP
      // this 就是 data
      // 需要对新增的数据 再次进行劫持
      var inserted;
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          // arr.push(1, 2, 3)
          inserted = args;
          break;
        case 'splice':
          // arr.splice(0, 1, {}, {}...)
          inserted = args.slice(2);
      }
      console.log('inserted', inserted); // 新增的内容
      if (inserted) {
        // inserted是数组类型，观察数组，要调用observeArray方法
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // data.__ob__ = this; // this为observe,放在data的自定义__ob__属性上;这样的好处：给数组加了一个标识，如果数据上有__ob__，说明数据已经被观察过了

      // 如果data不是数组是对象，这样给对象添加这个__ob__属性，然后去循环，会出现死循环

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 不可枚举（循环的时候，无法获取）
      });

      // Object.defineProperty只能劫持已存在的属性，对新增属性和删除属性不劫持（为此vue2单独写了一些API来解决$set $delete）
      if (Array.isArray(data)) {
        // 如果是数组就有两种情况：第一：重写7个方法、第二：数组中的引用类型也需要劫持
        // 重新数组中的方法，7个方法可以修改数组本身的。还有将数组中的引用类型也需要劫持
        // data.__proto__ = { 不采用这种方式是因为会把原始的push给干掉了
        //     push() {
        //         console.log('重写的push')
        //     }
        data.__proto__ = newArrayProto; // 拦截方法，并没有对新增的属性做劫持？
        // } 保留数组原有的特性：concat join等，并且重新部分的方法
        this.observeArray(data);
      } else {
        this.walk(data); // 遍历对象
      }
    }
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象 对属性依次劫持
        // 拿到每个属性，“重新定义”每个属性，导致性能不好
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 将数组中的引用类型也需要劫持
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
    return Observer;
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
        observe(newVal); // 有可能用户设置的值也是对象
        value = newVal;
      }
    });
  }
  function observe(data) {
    // 对这个data对象进行劫持
    if (_typeof(data) !== 'object' || data === null) {
      return; // 只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      // 说明这个对象已经被代理过了
      return data.__ob__;
    }

    // 如果一个对象被劫持过了，那就不要再被劫持了（如何判断一个对象是否被劫持过？可以新增一个实例，用实例来判断是否被劫持过）
    return new Observer(data);
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
