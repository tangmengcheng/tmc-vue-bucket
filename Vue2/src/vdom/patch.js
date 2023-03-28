/**
 * 初渲染或者更新
 * @param {*} oldVnode // 第一次是#app，第二次就是老的虚拟节点
 * @param {*} vnode  // 新的虚拟节点
 */
export function patch(oldVnode, vnode) {
    console.log(oldVnode, vnode)
    // 递归创建真实节点   替换掉老的节点
    // 1、判断是更新还是渲染
    const isRealElement = oldVnode.nodeType // 真实元素节点
    if (isRealElement) {
        const odlElm = oldVnode // div id="app"老的真实节点
        const parentElm = odlElm.parentNode // body 老的真实节点的父亲

        let el = createElm(vnode)

        parentElm.insertBefore(el, odlElm.nextSibling)
        parentElm.removeChild(odlElm) // 删除老的节点
    }
}
// 根据虚拟节点，创建真实节点
function createElm(vnode) {
    let {
        tag,
        children,
        key,
        data,
        text
    } = vnode
    // 是标签就创建标签
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag)
        updateProperties(vnode)
        children.forEach(child => { // 递归创建儿子节点，将儿子节点放到父节点中
            return vnode.el.appendChild(createElm(child))
        })
    } else {
        // 如果不是标签就是文本
        // 虚拟DOM上映射着真实DOM，方便后续更新操作
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

// 更新属性
function updateProperties(vnode) {
    let newProps = vnode.data
    let el = vnode.el
    console.log(newProps, el)
    for (let key in newProps) {
        if (key === 'style') {
            for (let styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName]
            }
        } else if (key === 'class') {
            el.className = newProps.class
        } else {
            el.setAttribute(key, newProps[key])
        }
    }
}