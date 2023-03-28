// ?: 匹配不捕获
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性的
// const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // <aaa:asasas>
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则  捕获的内容是标签名
// const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{}}
// const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const startTagClose = /^\s*(\/?)>/ // 匹配标签结束的 > <div >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾的</div>
// const doctype = /^<!DOCTYPE [^>]+>/i
// // #7298: escape - to avoid being passed as HTML comment when inlined in page
// const comment = /^<!\--/
// const conditionalComment = /^<!\[/ // 解析是否是条件注释

let root = null // ast语法树的树根
let currentParent // 标识当前父亲是谁
let stack = []
const ELEMENT_TYPE = 1 // 元素
const TEXT_TYPE = 3 // 文本

function createASTElement(tagName, attrs) {
    return {
        tag: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs,
        parent: null
    }
}

// 开始
function start(tagName, attrs) {
    console.log('开始标签：', tagName, '属性是：', attrs)
    // 遇到开始标签  就创建一个ast元素
    let element = createASTElement(tagName, attrs)
    if (!root) {
        root = element
    }
    currentParent = element // 把当前元素标记为父ast树
    stack.push(element) // 将开始标签存入栈中
}

// 文本
function chars(text) {
    console.log('文本是：', text)
    text = text.replace(/\s/g, '')
    if (text) {
        currentParent.children.push({
            text,
            type: TEXT_TYPE
        })
    }
}

// 标签闭合
function end(tagName) {
    console.log('结束标签：', tagName)
    let element = stack.pop()
    // 要标识当前这个p是属于这个div的儿子的
    currentParent = stack[stack.length - 1]
    if (currentParent) {
        element.parent = currentParent
        currentParent.children.push(element) // 实现了一个树的父子关系
    }
}

export function parseHTML(html) {
    // 不停地的解析HTML字符串
    while (html) {
        let textEnd = html.indexOf('<')
        if (textEnd === 0) {
            // 如果当前索引为0 肯定是一个标签，（开始标签、结束标签）
            let startTagMatch = parseStartTag() // 通过这个方法获取到匹配的结果，tagName attrs
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs) // 1、解析开始标签
                continue // 如果开始标签匹配完毕后，继续下一次
            }
            let endTagMatch = html.match(endTag) // 结束标签
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1]) // 2、解析结束标签
                continue
            }
        }
        let text
        if (textEnd >= 0) {
            text = html.substring(0, textEnd)
        }
        if (text) {
            advance(text.length) // 去掉空的字符串
            chars(text) // 3、解析文本
        }
    }

    function advance(n) {
        html = html.substring(n)
    }

    function parseStartTag() {
        let start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length) // 将标签删除
            // console.log(html)
            let end, attr
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length) // 将属性删除
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }
            if (end) {
                advance(end[0].length) // 去掉开始标签的 > 
                return match
            }
            // console.log(html, match)
        }
    }

    return root
}