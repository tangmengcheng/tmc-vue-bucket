var VueReactivity = (function (exports) {
    'use strict';

    const isObject = (value) => typeof value === 'object' && value !== null;
    const extend = Object.assign;

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

    exports.reactive = reactive;
    exports.readonly = readonly;
    exports.shallowReactive = shallowReactive;
    exports.shallowReadonly = shallowReadonly;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=reactivity.global.js.map
