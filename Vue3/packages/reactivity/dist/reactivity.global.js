var VueReactivity = (function (exports) {
    'use strict';

    const isObject = (value) => typeof value === 'object' && value !== null;
    const extend = Object.assign;

    function effect(fn, options = {}) {
        const effect = createReactiveEffect(fn, options);
        if (!options.lazy) {
            effect(); // 默认effect会先执行一次
        }
        return effect;
    }
    let uid = 0;
    let activeEffect; // 存储当前的effect
    const effectStack = []; // 栈：解决了key对应的effect是正确的
    function createReactiveEffect(fn, options) {
        const effect = function reactiveEffect() {
            if (!effectStack.includes(effect)) { // 防止重复频繁刷新
                try { // fn函数执行过程可能发生异常
                    console.log('todo....');
                    effectStack.push(effect);
                    activeEffect = effect;
                    return fn();
                }
                finally {
                    effectStack.pop();
                    activeEffect = effectStack[effectStack.length - 1];
                }
            }
        };
        effect.id = uid; // 制作一个effect标识，用于区分effect，源码用于排序
        effect._isEffect = true; // 用于标识这个是响应式effect
        effect.raw = fn; // 暴露effect对应的原函数
        effect.options = options; // 在effect上保存用户的属性
        return effect;
    }
    const targetMap = new WeakMap();
    /**
     * 让对象中的某个属性与effect关联起来
     * @param target 目标对象
     * @param type 操作类型
     * @param key 属性
     */
    function track(target, type, key) {
        // console.log(target, type, key, activeEffect)
        if (activeEffect === undefined) { // 此属性不用收集依赖，因为没在effect中使用
            return;
        }
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set())); // set可以去重，一个属性有可能对应多个effect
        }
        if (!dep.has(activeEffect)) {
            dep.add(activeEffect);
        }
        console.log(targetMap);
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

    // 是不是仅读的，没有set，会报异常
    const get = createGetter();
    const shallowGet = createGetter(false, true);
    const readonlyGet = createGetter(true);
    const shallowReadonlyGet = createGetter(true, true);
    const set = createSetter();
    const shallowSet = createSetter(true);
    const mutableHandlers = {
        get,
        set
    };
    const shallowReactiveHandlers = {
        get: shallowGet,
        shallowSet
    };
    const readonlyObj = {
        set: (target, key) => {
            console.warn(`set ${target} on key ${key} failed`);
        }
    };
    const readonlyHandlers = extend({
        get: readonlyGet
    }, readonlyObj);
    const shallowReadonlyHandles = extend({
        get: shallowReadonlyGet
    }, readonlyObj);
    // 拦截获取功能
    function createGetter(isReadonly = false, shallow = false) {
        return function get(target, key, receiver) {
            // proxy + reflect
            // 后续Object上的方法，会被迁移到 Reflect上  Reflect.getProperty)
            // 以前target[key] = value 方法设置值可能会失败，但是不会报异常，也没有返回值
            // Reflect 方法具备返回值
            const res = Reflect.get(target, key, receiver); // target[key]
            if (!isReadonly) {
                // 收集依赖，等会数据变化后更新对应的试图
                console.log('执行effect时会取值，收集effect');
                // 找到对象上哪个属性与effect关联。并记录是什么操作
                track(target, 0 /* TrackOpTypes.GET */, key);
            }
            if (shallow) {
                return res;
            }
            if (isObject(res)) { // vue2 是一上来就递归，vue3是当前取值时会进行代理。称为懒代理
                return isReadonly ? readonly(res) : reactive(res);
            }
            return res;
        };
    }
    // 拦截设置功能
    function createSetter(shallow = false) {
        return function set(target, key, value, receiver) {
            const result = Reflect.set(target, key, value, receiver); // target[key] = value
            // 当数据更新时，通知对应属性的effect重新执行
            return result;
        };
    }

    function reactive(target) {
        return createReactiveObject(target, false, mutableHandlers);
    }
    function shallowReactive(target) {
        return createReactiveObject(target, false, shallowReactiveHandlers);
    }
    function readonly(target) {
        return createReactiveObject(target, true, readonlyHandlers);
    }
    function shallowReadonly(target) {
        return createReactiveObject(target, true, shallowReadonlyHandles);
    }
    const reactiveMap = new WeakMap(); // 会自动垃圾回收，不会造成内存泄露，存储的key只能是对象
    const readonlyMap = new WeakMap();
    /**
     * 柯里化，new Proxy() 最核心的需要拦截数据的读取和修改 -> get set
     * @param target 目标对象
     * @param isReadonly 是否只读
     * @param baseHandlers 处理器函数
     */
    function createReactiveObject(target, isReadonly, baseHandlers) {
        // 如果目标不是对象，没法拦截，reactive这个api只能拦截对象
        if (!isObject(target)) {
            return target;
        }
        // 如果某个对象已经被代理过了，就不要再代理了(可能一个对象被代理是深度，又被仅读代理)
        const proxyMap = isReadonly ? readonlyMap : reactiveMap;
        const existProxy = proxyMap.get(target);
        if (existProxy) {
            return existProxy; // 如果已经被代理了 直接返回即可
        }
        const proxy = new Proxy(target, baseHandlers);
        proxyMap.set(target, proxy); // 将要代理的对象和对应代理结果缓存起来
        return proxy;
    }

    exports.effect = effect;
    exports.reactive = reactive;
    exports.readonly = readonly;
    exports.shallowReactive = shallowReactive;
    exports.shallowReadonly = shallowReadonly;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
