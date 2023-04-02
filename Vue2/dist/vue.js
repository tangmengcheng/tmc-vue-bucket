(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(arr, i) {
    var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
    if (null != _i) {
      var _s,
        _e,
        _x,
        _r,
        _arr = [],
        _n = !0,
        _d = !1;
      try {
        if (_x = (_i = _i.call(arr)).next, 0 === i) {
          if (Object(_i) !== _i) return;
          _n = !1;
        } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
      } catch (err) {
        _d = !0, _e = err;
      } finally {
        try {
          if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
        } finally {
          if (_d) throw _e;
        }
      }
      return _arr;
    }
  }
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
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
      // console.log('inserted', inserted) // 新增的内容
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

  // ?: 匹配不捕获
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
  // const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // abc-aaa
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <aaa:asasas>
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则  捕获的内容是标签名
  // const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{}}
  // const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 > <div >
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的</div>
  // const doctype = /^<!DOCTYPE [^>]+>/i
  // // #7298: escape - to avoid being passed as HTML comment when inlined in page
  // const comment = /^<!\--/
  // const conditionalComment = /^<!\[/ // 解析是否是条件注释

  // 拿到这些标签了后就需要生成一个树，AST树就有树根
  var root = null; // ast语法树的树根
  var currentParent; // 标识当前父亲是谁
  // 面试题：我怎么知道标签正常关闭了？
  // 【div, p, span】
  var stack = [];
  var ELEMENT_TYPE = 1; // 元素
  var TEXT_TYPE = 3; // 文本

  // 创建语法树的方法
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs: attrs,
      parent: null
    };
  }
  // 把我需要的内容收集起来
  // 开始
  function start(tagName, attrs) {
    console.log('开始标签：', tagName, '属性是：', attrs);
    // 遇到开始标签  就创建一个ast元素
    var element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentParent = element; // 把当前元素标记为父ast树
    stack.push(element); // 将开始标签存入栈中
  }

  // 文本
  function chars(text) {
    console.log('文本是：', text);
    text = text.replace(/\s/g, '');
    if (text) {
      currentParent.children.push({
        text: text,
        type: TEXT_TYPE
      });
    }
  }

  // 标签闭合
  function end(tagName) {
    console.log('结束标签：', tagName);
    var element = stack.pop();
    // 要标识当前这个p是属于这个div的儿子的
    currentParent = stack[stack.length - 1];
    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element); // 实现了一个树的父子关系
    }
  }

  function parseHTML(html) {
    // 不停地的解析HTML字符串
    while (html) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // 如果当前索引为0 肯定是一个标签，（开始标签、结束标签）
        var startTagMatch = parseStartTag(); // 通过这个方法获取到匹配的结果，tagName attrs
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs); // 1、解析开始标签
          continue; // 如果开始标签匹配完毕后，继续下一次
        }
        // 如果没有匹配到开始标签  可能匹配结束标签
        var endTagMatch = html.match(endTag); // 结束标签（没有属性）
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 2、解析结束标签
          continue;
        }
        // 。。。注解节点，特殊元素style。。。
      }

      var text = void 0;
      if (textEnd >= 0) {
        // 有可能有空格，默认说它是文本
        text = html.substring(0, textEnd); // 截取空格文本
      }

      if (text) {
        advance(text.length); // 去掉空的字符串
        chars(text); // 3、解析文本
      }
    }

    function advance(n) {
      html = html.substring(n); // 默认从当前位置截取到最后
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        // 如果匹配到
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // 将标签删除
        // console.log(html)
        // 需要判断标签有没有属性，有属性就解析属性，没有属性就不解析，属性有可能多个，就需要循环去取
        // html.match(startTagClose)如果匹配到结束标签
        var _end, attr;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length); // 将属性删除
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }
        if (_end) {
          advance(_end[0].length); // 去掉开始标签的 > 
          return match;
        }
        // console.log(html, match)
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{}}

  // 处理属性  拼接成属性字符串
  function getProps(attrs) {
    // [{name: 'id', value: 'app'}, {}]
    var str = '';
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        // style="color: red;fontSize: 14px;"  => {style: {color: 'red'}} 为了diff
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}"); // 删除最后一个逗号
  }

  function genChildren(el) {
    var children = el.children;
    if (children && children.length > 0) {
      return "".concat(children.map(function (c) {
        return gen(c);
      }).join(',')); // 把一个个孩子生成字符串
    } else {
      // 没有孩子
      return false;
    }
  }
  function gen(node) {
    if (node.type === 1) {
      // 元素标签
      return generate(node);
    } else {
      // 文本的情况有点复杂：肯能包含{{}}
      var text = node.text; // a {{ name }} b{{age}}  c  ===》_v("a" + _s(name) + "b" + _s(age) + "c")
      var tokens = [];
      var match, index;
      // 每次的偏移量
      var lastIndex = defaultTagRE.lastIndex = 0; // 正则的问题：lastIndex   let reg = /a/g reg.test('abc')
      // 只要是全局匹配，就需要将lastIndex每次匹配的时候调到0处  
      while (match = defaultTagRE.exec(text)) {
        index = match.index;
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        // 最后的
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return "_v(".concat(tokens.join('+'), ")");
    }
  }
  function generate(el) {
    var children = genChildren(el);
    var code = "_c(\"".concat(el.tag, "\", ").concat(el.attrs.length ? getProps(el.attrs) : 'undefined').concat(el.children ? ",".concat(children) : '', ")\n    ");
    return code;
  }

  // 主要通过正则匹配加循环来完成的
  // 把一个HTML不停地循环拿出来后组成一棵树，这个树描述了我们当前的DOM结构
  function compilerToFunction(template) {
    // 1、解析HTML字符串，将HTML字符串 -》ast语法树
    var root = parseHTML(template);
    // 2、需要将ast语法树生成最终的render函数    就是字符串拼接（模板引擎）
    // console.log(root)

    var code = generate(root);
    // console.log(code)

    // 核心思路：就是讲模板转换成 下面这段字符串
    // <div id="app"><p>hello {{name}}</p>hello</div>
    // 将ast树 再次转成js的语法
    // _c('div', {id: 'app'}, _c('p', _v('hello' + _s(name))), _v('hello'))

    // 所有的模板引擎实现，都需要new Function() + with

    var renderFn = new Function("with(this) {return ".concat(code, "}"));
    // console.log(renderFn)
    // vue的render 返回的是虚拟DOM
    return renderFn;
  }

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, callback, options) {
      _classCallCheck(this, Watcher);
      this.vm = vm;
      this.callback = callback;
      this.options = options;
      this.getter = exprOrFn; // 将内部传过来的回调函数 放到getter属性上

      this.get();
    }
    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        this.getter(); // 就是让updateComponent函数执行
      }
    }]);
    return Watcher;
  }();

  /**
   * 初渲染或者更新
   * @param {*} oldVnode // 第一次是#app，第二次就是老的虚拟节点
   * @param {*} vnode  // 新的虚拟节点
   */
  function patch(oldVnode, vnode) {
    console.log(oldVnode, vnode);
    // 递归创建真实节点   替换掉老的节点
    // 1、判断是更新还是渲染
    var isRealElement = oldVnode.nodeType; // 真实元素节点
    if (isRealElement) {
      var odlElm = oldVnode; // div id="app"老的真实节点
      var parentElm = odlElm.parentNode; // body 老的真实节点的父亲

      var el = createElm(vnode);
      parentElm.insertBefore(el, odlElm.nextSibling);
      parentElm.removeChild(odlElm); // 删除老的节点
    }
  }
  // 根据虚拟节点，创建真实节点
  function createElm(vnode) {
    var tag = vnode.tag,
      children = vnode.children;
      vnode.key;
      vnode.data;
      var text = vnode.text;
    // 是标签就创建标签
    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      updateProperties(vnode);
      children.forEach(function (child) {
        // 递归创建儿子节点，将儿子节点放到父节点中
        return vnode.el.appendChild(createElm(child));
      });
    } else {
      // 如果不是标签就是文本
      // 虚拟DOM上映射着真实DOM，方便后续更新操作
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }

  // 更新属性
  function updateProperties(vnode) {
    var newProps = vnode.data;
    var el = vnode.el;
    console.log(newProps, el);
    for (var key in newProps) {
      if (key === 'style') {
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (key === 'class') {
        el.className = newProps["class"];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function lifecycleMixin(Vue) {
    // vnode虚拟节点
    Vue.prototype._update = function (vnode) {
      var vm = this;
      // 我要通过虚拟节点，渲染出真实的DOM
      vm.$el = patch(vm.$el, vnode); // 需要用虚拟节点创建出真实节点  替换掉真实的$el
      // console.log(vnode)
    };
  }

  function mountComponent(vm, el) {
    var options = vm.$options; // render
    vm.$el = el; // 真实的DOM元素

    console.log(options, vm.$el);
    // 渲染页面

    // 渲染方法
    var updateComponent = function updateComponent() {
      // 无论是渲染还是更新都会调用此方法
      // _render() 返回虚拟DOM
      // _update() 将虚拟DOM转换成真实的DOM
      vm._update(vm._render());
    };

    // 怎么渲染呢？就是利用渲染watcher; 每个组件都有一个watcher
    // () => {} ===> $watch(() => {}) 表示里面的回调函数
    new Watcher(vm, updateComponent, function () {}, true); // true 表示它是一个渲染watcher
  }

  // Watcher 就是用来渲染的
  // vm._render 通过解析的render方法 渲染出虚拟DOM  _c _v _s
  // vm._update 通过虚拟DOM  创建真实的DOM

  // 初始化
  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // console.log('options', options)
      // 在当前的实例上扩展一些属性$options $data...
      // 为什么要定义这些属性？如果使用使用options的话，在其他扩展方法里拿不到。扩展一些属性，可以通过this拿到这个属性
      // 为什么属性要以$开头，认为是Vue自己的属性。如果自己在data中用$定义变量，实例上拿不到的
      var vm = this;
      vm.$options = options; // 将用户的选项挂载实例上

      // 初始化状态/数据（Vue中的状态：props、data、computed、methods、watch）
      initState(vm);
      // todo...模板编译、创建虚拟dom。。。

      // 如果用户传了el属性，需要将页面渲染出来
      // 如果用户传入了el，就要实现挂载流程
      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      // 默认会先查找render方法，-》template -> el的内容

      if (!options.render) {
        // 对模板进行编译
        var template = options.template;
        if (!template && el) {
          template = el.outerHTML;
        }
        // console.log(template)
        // 我们需要将template 转化成render函数
        var render = compilerToFunction(template);
        options.render = render;
      }

      // 渲染当前的组件，挂载这个组件
      mountComponent(vm, el);
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

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var key = data.key;
    if (key) {
      delete data.key;
    }
    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }
    return vnode(tag, data, key, children, undefined);
  }
  function createTextNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }

  /**
   * 产生虚拟节点
   * @param {*} tag 标签名
   * @param {*} data 属性
   * @param {*} key 做diff
   * @param {*} children 孩子
   * @param {*} text 文本
   */
  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text
    };
  }
  // 虚拟节点  就是通过_c _V实现用对象来描述dom的操作

  /**
   * 1、将template转换成ast语法树 -> 生成render函数 -> 生成虚拟DOM -> 真实的DOM
   * 重新生成虚拟DOM -> 更新DOM
   */

  function renderMixin(Vue) {
    // _c 创建元素的虚拟节点
    // _v 创建文本的虚拟节点
    // _s JSON.stringify()
    Vue.prototype._c = function () {
      return createElement.apply(void 0, arguments); // tag, data, children...
    };

    Vue.prototype._v = function (text) {
      return createTextNode(text);
    };
    // 把数据格式为字符串
    Vue.prototype._s = function (val) {
      return val === null ? '' : _typeof(val) === 'object' ? JSON.stringify(val) : val;
    };
    Vue.prototype._render = function () {
      console.log('render');
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm); // 改变this指向

      return vnode; // 虚拟DOM
    };
  }

  // vue源码里没有直接使用class定义一个类。类的特点：将所有的方法都耦合在一起，功能越来越多，很难维护。vue在设计的时候使用构造函数，把扩展的内容挂载到原型上，放到不同的文件中，好维护。
  function Vue(options) {
    this._init(options);
  }

  // 初始化
  initMixin(Vue); // 扩展了init方法
  renderMixin(Vue);
  lifecycleMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
