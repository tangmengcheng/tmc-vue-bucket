import babel from 'rollup-plugin-babel'
// rollup 默认可以导出一个对象，作为打包的配置文件
export default {
    input: './src/index.js', // 入口
    output: { // 出口
        file: './dist/vue.js',
        name: 'Vue',
        format: 'umd', // esm es6模块 commonjs iife(自执行函数) umd(统一模块规范兼容AMD commonjs)
        sourcemap: true // 可以调试源代码
    },
    plugins: [
        babel({
            exclude: 'node_modules/**' // 排除node_modules所有文件
        })
    ]
}