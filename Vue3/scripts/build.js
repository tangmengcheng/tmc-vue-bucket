// 把packages目录下所有包都进行打包

const fs = require('fs')
const execa = require('execa') // 开启子进程进行打包，最终还是rollup打包

const targets = fs.readdirSync('packages').filter(f => {
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
        return false
    }
    return true
})

// console.log(targets) [ 'reactivity', 'shared' ]

// 对我们目标进行依次打包，并行打包

async function build(target) { // target: 'reactivity', 'shared'
    // 执行命令  配置(环境变量) rollup -c --environment TARGET:shared
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`], {
        stdio: 'inherit'
    }) // 当子进程打包的信息共享给父进程
}

function runParallel(targets, iteratorFn) {
    const res = []
    for (const item of targets) {
        const p = iteratorFn(item) // 每个打包过程都是异步的过程
        res.push(p)
    }

    return Promise.all(res)
}

runParallel(targets, build)