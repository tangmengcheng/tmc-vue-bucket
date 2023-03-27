// ast抽象语法树 是用对象来描述原生语法的  虚拟dom 用对象来描述dom节点

import {
    parseHTML
} from "./parser-html"

// 主要通过正则匹配加循环来完成的
// 把一个HTML不停地循环拿出来后组成一棵树，这个树描述了我们当前的DOM结构
export function compilerToFunction(template) {
    // 1、解析HTML字符串，将HTML字符串 -》ast语法树
    let root = parseHTML(template)
    console.log(root)
    return function render() {

    }
}