# pm2

PM2是具有内置负载均衡器的Node.js应用程序的生产运行时和进程管理器。

## 安装

`npm install pm2 -g`

## 启动

`pm2 start app.js --name my-app`

pm2 list

pm2 stop <>
pm2 restart <>
pm2 delete <>

启动express 可以在express根目录下执行
pm2 start bin/www

加入watch参数，每当代码改动会自动重启
pm2 start bin/www --watch

pm2 monit 监控

无缝重启程序
pm2 reload all

以集群模式启动nodejs应用, max代表已cpu最大来，也可以指定2，3等数字
pm2 start api.js -i max

初始化一个环境变量，会生成一个ecosystem.config.js
pm2 init

您可以为多个环境声明变量。每个环境密钥必须具有以下格式：env_。
例如，app可以在两个环境中启动以下过程：development和production。

我们可以配置在不同环境下的特定参数，在express中 process.env.NODE_ENV即可传递进去

要app在特定环境中启动它，请使用–env标志：`pm2 start ecosystem.config.js --env production`  // 使用的是配置文件启动pm2