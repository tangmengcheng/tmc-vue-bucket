// 只针对具体的某个包打包

const fs = require('fs')
const execa = require('execa') // 开启子进程进行打包，最终还是rollup打包

const target = 'reactivity'

build(target)

async function build(target) { // target: 'reactivity', 'shared'
    // 执行命令  配置(环境变量) rollup -c -w --environment TARGET:shared
    await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {
        stdio: 'inherit'
    }) // 当子进程打包的信息共享给父进程
}