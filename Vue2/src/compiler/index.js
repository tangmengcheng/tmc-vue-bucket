// ast抽象语法树 是用对象来描述原生语法的  虚拟dom 用对象来描述dom节点

import {
    parseHTML
} from "./parser-html"

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{}}

// 处理属性  拼接成属性字符串
function getProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // style="color: red;fontSize: 14px;"  => {style: {color: 'red'}}
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function genChildren(el) {
    let children = el.children
    if (children && children.length > 0) {
        return `${children.map(c => gen(c)).join(',')}`
    } else {
        return false
    }
}

function gen(node) {
    if (node.type === 1) {
        // 元素标签
        return generate(node)
    } else {
        let text = node.text // a {{ name }} b{{age}}  c
        let tokens = []
        let match, index
        // 每次的偏移量
        let lastIndex = defaultTagRE.lastIndex = 0 // 正则的问题：lastIndex
        // 只要是全局匹配，就需要将lastIndex每次匹配的时候调到0处
        while (match = defaultTagRE.exec(text)) {
            index = match.index
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)))
            }
            tokens.push(`_s(${match[1].trim()})`)
            lastIndex = index + match[0].length
        }
        if (lastIndex < text.length) { // 最后的
            tokens.push(JSON.stringify(text.slice(lastIndex)))
        }
        return `_v(${tokens.join('+')})`
    }
}

function generate(el) {
    let children = genChildren(el)
    let code = `_c("${el.tag}", ${
        el.attrs.length ? getProps(el.attrs) : 'undefined'
    }${
        el.children ? `,${children}` : ''
    })
    `
    return code
}


// 主要通过正则匹配加循环来完成的
// 把一个HTML不停地循环拿出来后组成一棵树，这个树描述了我们当前的DOM结构
export function compilerToFunction(template) {
    // 1、解析HTML字符串，将HTML字符串 -》ast语法树
    let root = parseHTML(template)
    // 2、需要将ast语法树生成最终的render函数    就是字符串拼接（模板引擎）
    console.log(root)

    let code = generate(root)
    console.log(code)

    // 核心思路：就是讲模板转换成 下面这段字符串
    // <div id="app"><p>hello {{name}}</p>hello</div>
    // 将ast树 再次转成js的语法
    // _c('div', {id: 'app'}, _c('p', _v('hello' + _s(name))), _v('hello'))

    // 所有的模板引擎实现，都需要new Function() + with

    let renderFn = new Function(`with(this) {return ${code}}`)
    console.log(renderFn)
    // vue的render 返回的是虚拟DOM
    return renderFn
}

// Vue实例为什么只能有一个根元素？
// 在 Vue.js 2. x 版本中， 一个 Vue 实例只能有一个根元素， 这是因为 Vue.js 的模板编译器在编译模板时需要将模板编译为一个渲染函数， 并将这个渲染函数挂载到根元素上。 如果一个 Vue 实例有多个根元素， 那么模板编译器就无法将模板编译为一个渲染函数。
// 在 Vue.js 3.x 版本中，这个限制已经被移除了。Vue.js 3.x 版本中可以在一个 Vue 实例中包含多个根元素，可以通过在根元素上使用 v-for、v-if 等指令来实现。在 Vue.js 3.x 版本中，一个 Vue 实例不再需要一个单一的根元素，而是将多个根元素封装在一个特殊的组件中，这个组件被称为 Fragment。