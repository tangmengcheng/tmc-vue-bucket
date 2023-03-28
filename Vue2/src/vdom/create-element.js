export function createElement(tag, data = {}, ...children) {
    let key = data.key
    if (key) {
        delete data.key
    }
    return vnode(tag, data, key, children, undefined)
}

export function createTextNode(text) {
    return vnode(undefined, undefined, undefined, undefined, text)
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
        tag,
        data,
        key,
        children,
        text
    }
}
// 虚拟节点  就是通过_c _V实现用对象来描述dom的操作

/**
 * 1、将template转换成ast语法树 -> 生成render函数 -> 生成虚拟DOM -> 真实的DOM
 * 重新生成虚拟DOM -> 更新DOM
 */