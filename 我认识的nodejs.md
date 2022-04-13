
Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时。
一方面，它提供了多种可调用的API，如读写文件、网络请求、系统信息等。另一方面，因为CPU执行的是机器码，它还负责将JavaScript代码解释成机器指令序列执行，这部分工作是由V8引擎完成。
文件系统并不是由 js 或者 Node.js 实现的，而是由我们的操作系统，其中包含了如何分配存储，如何读取存储，如何实现文件系统和操作系统的协作交互。一句话总结一下文件系统其实就是：**对磁盘设备的抽象，屏蔽了有关如何存储，操作等细节**。
实际上，大多数语言都已经实现了文件的读写，具体的做法就是添加抽象层，对于Node.js而言，我用以下简单的图示表示：node --->V8----->libuv----->调用系统API,读取文件。
V8采用即时编译技术（JIT），直接将JavaScript代码编译成本地平台的机器码。这与其他解释器不同，例如Java语言需要先将源码编译成字节码，然后给JVM解释执行，JVM根据优化策略，运行过程中有选择地将一部分字节码编译成本地机器码。V8不生成中间代码，一步到位，编译成机器码，CPU就开始执行了。比起生成中间码解释执行的方式，V8的策略省去了一个步骤，程序会更早地开始运行。并且执行编译好的机器指令，也比解释执行中间码的速度更快。
NodeJS，是怎么引入V8的？
查看Node的源码
需要关注的几个目录和文件：
/deps/v8 ：这里是V8源码所在文件夹，你会发现里面的目录结构跟 V8源码 十分相似。NodeJS除了移植V8源码，还在增添了一些内容。
/src ：由C/C++编写的核心模块所在文件夹，由C/C++编写的这部分模块被称为「Builtin Module」
/lib ：由JavaScript编写的核心模块所在文件夹，这部分被称为「Native Code」，在编译Node源码的时候，会采用V8附带的 js2c.py 工具，把所有内置的JavaScript代码转换成C++里面的数组，生成 out/Release/obj/gen/node_natives.h 文件。有些 Native Module 需要借助于 Builtin Module 实现背后的功能。
/out ：该目录是Node源码编译(命令行运行 make )后生成的目录，里面包含了Node的可执行文件。当在命令行中键入 node xxx.js ，实际就是运行了 out/Release/node 文件。

node 最大特点就是异步式 I/O 和 事件驱动的架构设计。传统高并发解决方案是多线程模型。而node是单线程模型，对所有I/O都采用异步式的请求方式。
慢速攻击（ddos）:  反向代理可以解决ddos

supervisor 可以监视代码改动，自动重启nodejs. 安装后，就是用 supervisor app.js (一般用于开发调试)
nodejs 提供了 exports（模块公开的接口） 和 require（从外部获取一个模块的接口） 两个对象。

自定义node包的时候，尽量按照CommonJS的规范：
package.json 必须放在顶层目录下
二进制文件应该放在bin目录下
js代码应该放在lib目录下
文档应该放在doc目录下
单元测试应该放在test目录下
注：nodejs在调用某个包的时候，首先会检查包中package.json文件的mian字段，将其作为包的接口模块，如果不存在会寻找index.js作为包的接口。
全局安装的模块，不能使用require来加载。但可以通过npm link命令打破这个限制。如全局安装express，然后在工程目录下使用npm link express,就可以把全局包当本地包使用了。
发布包：
使用npm init 生成符合npm包的规范。
使用npm adduser 完成账号创建
使用npm whoami 测验是否取得账号
使用npm publish 发布
修改package.json里面的vesrion字段，使用npm publish 来更新包

nodejs 全局对象 global

process 是一个全局变量，是global的一个属性
process.argv 获取命令行数组，第一个元素是node,第二个是脚本名，第三个元素开始是运行参数。
process.stdout 标准输出流 （console.log()就是向标准输出流输出字符串）
process.stdout.write()函数提供了更底层的接口。
process.stdin 是标准输入流，初始的时候是被暂停的，想要从标准输入流中读取数据，必须先恢复流。
process.stdin.resume() // 恢复流
process.stdin.on('data',function (data){
    process.stdin.write('输入的数据：',data.toString())
})
process.nextTick(callback)的功能是为事件循环设置一项任务，nodejs在下一次事件循环响应时调用callback
例子
function doSomething(args,callback){
    somethingComplicated(args)
    callback()
}
doSomething(function onEnd(){
    compute()
})
改写成：
function doSomething(args,callback){
    somethingComplicated(args)
    process.nextTick(callback)
}
doSomething(function onEnd(){
    compute()
})

console.log()  console.error()  console.tarce()

事件驱动 events 是nodejs的重要模块
events只提供了一个对象 events.EventEmitter
ex:
const events=require('events')
const emitter= new events.EventEmitter()
emitter.on('someEvent',function(argv1,argv2){
    // 注册监听事件
})
emitter.emit('someEvent','a','b') //触发事件
emitter.once(event,listener)  //注册一个单次监听事件，触发后立即解除该监听器
emitter.removeListener(event,listener) // 移除某个监听
emitter.removeAllListener([event])  //移除所有监听（或指定的event）
注：emitter有一个特殊事件error,如果没有响应的监听，当程式发生错误，默认退出程序打印错误栈
大多数都不会直接使用emitter，都是在对象中继承它，包括fs, http, net 都是它的子类

fs.readFile(filename,[encoding],[callback(err,data)]) 不指定encoding,data将是给buffer形式的二进制。

fs.open(path,flags,[mode],[callback(err,fd)]) 
path: 文件路径
flags: 操作符 r:只读，r+:读写，w:写入模式，w+：读写，a:追加，a+:读取追加 （如果文件不存在，则创建）
mode: 创建文件指定权限，默认0666
回调fd，是文件描述符

fs.read(fd,buffer,offset,length,position,[callback(err,bytesRead,buffer)])// 比readFile更底层的接口,一般不使用，除非你手动管理缓冲区和指针

文件模块加载有两种方式，一种是按路径加载，一种是查找node_moudules文件夹

cluster模块
cluster的功能是生成与当前进程相同的子进程，并且允许父进程和子进程共享端口。