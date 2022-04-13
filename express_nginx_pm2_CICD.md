# 前情提要

> 目标是在windows开发，最终部署到ubuntu生产环境中。需要使用的技术有node/express/nginx/pm2/git/docker/等。

## 一、搭建express

1. 默认已在windows开发环境已经安装了node 8以上的版本和git管理工具

    ```shell
    npx express-generator --view=ejs --ejs --git myapp
    cd myapp
    git init
    npm install
    npm run start
    ```

2. 访问 <http://localhost:3000/>

    成功响应 Welcome to Express 操作成功。

3. 安装pm2

    ``` shell
    npm install pm2 -g
    pm2 start ./bin/www --name='myapp' --watch  # --watch 文件监控，自动重新加载，使用与开发环境
    # 复制 www 修改为 www2 修改端口号为3001
    pm2 start ./bin/www2 --name='myapp2' --watch
    ```

4. 安装nginx

    下载地址：<http://nginx.org/en/download.html> （Nginx官网）

    下载之后，解压到指定的目录.

    nginx的配置文件是conf目录下的nginx.conf，默认配置的nginx监听的端口为80，如果80端口被占用可以修改为未被占用的端口即可.

    控制台（CMD）切换到Nginx目录下，输入start nginx

    如果使用cmd命令窗口启动nginx，关闭cmd窗口是不能结束nginx进程的，可使用两种方法关闭nginx:  
        - 输入nginx命令  nginx -s stop(快速停止nginx)  或  nginx -s quit(完整有序的停止nginx)  
        - 使用taskkill   taskkill /f /t /im nginx.exe

5. 使用nginx代理服务器做负载均衡  

    我们可以修改nginx的配置文件nginx.conf 达到访问nginx代理服务器时跳转到指定服务器的目的，即通过proxy_pass 配置请求转发地址，即当我们依然输入<http://localhost:80> 时，请求会跳转到我们配置的服务器

    ``` bash

    upstream tomcat_server{ # 配置服务组
        server 127.0.0.1:3000 weight=3;  # weight 比重，越大优先级越高
        server 127.0.0.1:3001 weight=2;
    }

    server {
            listen       8090;  # 配置端口
            server_name  localhost; # 配置域名

            #charset koi8-r;

            #access_log  logs/host.access.log  main;
            location / {
                proxy_pass http://tomcat_server;
            }
    }
    ```

    修改配置后，使用 nginx -t 检查配置是否正确  
    使用 nginx -s reload 重新加载配置启动  
    上面配置后，访问 127.0.0.1:8090 实际访问的是127.0.0.1:3000 或3001  
    // 为了验证是否自动负载均衡，可以在www文件中加入 global.port=port ,然后在routes/index.js文件 将title值修改为'Express!' + global.port
    然后多次访问，查看端口是否发生变化。

6. 使用nginx配置静态资源

    添加一个 location将一个目录暴露出去

    ``` bash
        location /public {
            # alias   d:/project/myapp/public/;  # 用alias路径直接指向
            root d:/project/myapp/;  # 用root代表路径加上/public
            autoindex on;  # 代表开启目录浏览
        }

    ```

    重新加载配置后，访问<http://localhost:8090/public/> 就可以看到静态目录或者文件

7. 提交代码到管理仓库

    ``` shell
    git add .
    git commit -m 'init'
    git remote add origin https://github.com/xj0707/myapp.git
    git branch -M master
    git push -u origin master
    ```

## 二、ubuntu上部署生产环境

> 这时你会发现又要部署环境相当麻烦，而且开发环境和生成环境，系统又不一样，不仅繁琐，还容易出错。如果又新增一台服务器，又要重新部署一套，岂不是做重复功，那有没有解决这个问题的办法呢?当然是有的，后面会讲容器来解决这个问题。目前我们先老老实实再走一遍流程。加深印象。

我这里是一台阿里云的ecs云服务器。好了首先通过终端连上服务器。

1. 安装node环境

    ``` shell

    sudo apt update
    sudo apt install nodejs
    node -v
    ```

2. 创建目录拉取代码

    ``` shell
    cd /home
    mkdir www
    cd www
    git clone https://github.com/xxxxx/myapp.git
    cd myapp
    npm install
    npm run start
    ```

   然后通过 公网ip:3000 查看是否正常响应

3. 如果端口被占用，可以重新定义端口，或者查看端口被那个占用
sudo netstat -nultp

4. 安装pm2

    npm install pm2 -g  
    pm2 start ./bin/www --name='myapp'

5. 安装nginx

    apt install nginx  
    whereis nginx  
    nginx -v  
    service nginx start  
    访问公网ip（默认是80端口）查看响应是否是hello nginx

6. 用nginx做方向代理

   在conf.d目录下建任意一个.conf文件
贴入以下内容：

    ```shell
    upstream tomcat_server{  # 配置服务组
    server 127.0.0.1:3000 weight=3;  # weight 比重，越大优先级越高
    server 127.0.0.1:3001 weight=2;
    }

    server {
            listen       8090;  # 配置端口
            server_name  localhost; # 配置域名

            #charset koi8-r;

            #access_log  logs/host.access.log  main;
            location / {
                proxy_pass http://tomcat_server;
            }
            location /public {
            # alias   d:/project/myapp/public/;  # 用alias路径直接指向
            root d:/project/myapp/;  # 用root代表路径加上/public
            autoindex on;  # 代表开启目录浏览
        }
    }
    ```

    注释掉 /etc/nginx/nginx.conf 中的  include /etc/nginx/sites-enabled/*;

    然后重新加载：  
    nginx -t  
    nginx -s reload

    访问公网ip 查看是否正常响应 express+端口

## 三、使用 pm2 ecosystem.config.js 实现一键部署

1. 打开终端，切换到 node.js 项目根目录，执行 pm2 ecosystem ， 生成配置文件如下：

    ```js
    module.exports = {
        apps: [{
            script: 'index.js',
            watch: '.',
            env_production: {
                NODE_ENV: "production"
            },
            env_development: {
                NODE_ENV: "development"
            }
        }],
    
    // Deployment Configuration
        deploy: {
            production: {
                user: 'SSH_USERNAME',
                host: 'SSH_HOSTMACHINE',
                ref: 'origin/master',
                repo: 'GIT_REPOSITORY',
                path: 'DESTINATION_PATH',
                'pre-deploy-local': '',
                'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
                'pre-setup': ''
            }
        }
    }
    ```

2. github上生成ssh (该配置的目的是服务器拉取代码无需密码)
SSH：通过上传 SSH key 到 GitHub 后台，这样无需密码即可 clone 项目。
配置ssh key，可以免密下载Github代码，既方便又安全，需要使用到 ssh-keygen 工具。

    - ls -al ~/.ssh
    - ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
    - 复制id_rsa.pub的内容
    - 登录github官网，按照这个路径Settings --> SSH and GPG keys --> New SSH key 然后贴入 复制的内容
    - Terminal（终端）检查是否可以成功连接 ssh -T git@github.com
    - ithub随便找个项目，测试下载： git clone git@github.com:xxxx

3. 根据以上信息配置 ecosystem信息 如下：
production: {
      user: 'root',
      host: ['39.105.70.123'],
      ref: 'origin/master',
      repo: 'git@github.com:xj0707/myapp.git',
      path: '/home/www/',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },

4. 配置本地免密登录远程服务器

    步骤4中每次都要输入密码，我们配置成免密方法如下：  
    // 创建ssh密钥  
    ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa  
    // 复制密钥到服务器  
    ssh-copy-id -i ~/.ssh/id_rsa.pub root@39.105.70.123  
    // 就可以直接免密登录服务器了  
    ssh root@39.105.70.123  
    后面使用pm2 部署也不会使用密码了。妈妈再也不用担心我忘记密码了~  

5. 部署

   在服务器上 找到以下内容然后 注释：

    ``` bash
    vim ~/.bashrc
    # If not running interactively, don't do anything
    # [ -z "$PS1" ] && return
    ```

    - 在开发环境的 `ecosystem.config.js` 所在目录执行下面命令，初始化 node.js 项目 到服务器
    `pm2 deploy production setup`  // pm2 连接服务器，通知其 git clone 代码等初始化工作。
    - 启动 或 更新 node.js 项目：
    `pm2 deploy production --force` // 让服务器 git pull 代码，编译后启动应用;--force 的作用：如果服务器本地代码有改动，那么放弃改动，用git仓库最新代码更新项目。
    为了方便后续，操作，我们在package.json中 script配置以下信息：

        ``` json
        "scripts": {
            "start": "node ./bin/www",
            "setup": "pm2 deploy production setup",
            "deploy": "pm2 deploy production --force"
        },
        ```

    注意：首次使用使用 `npm setup`做初始化工作 ，后面直接使用 `npm deploy` 做代码部署更新  

6. 总结：我们已经完成了在开发环境完成code后提交到git仓库中，然后在本地利用 pm2 的ecosystem 来部署到服务器中，至此我们已经将本地和服务器开发和部署已经关联起来了，这是后加入了一位新伙伴，每次他提交代码后，还得自己需要跑一次部署。那么接下来，我们利用github webhook来实现 提交代码自动部署到服务器上。

## 四、利用github webhook实现热更新

> 将开发一个Node.js服务器，只要您或其他人将代码推送到GitHub，它就会监听GitHub webhook通知。此脚本将使用最新版本的代码自动更新远程服务器上的存储库，从而无需登录服务器来提取新提交。

1. 登录您的GitHub帐户并导航到您要监控的存储库。单击存储库页面顶部菜单栏中的“设置”选项卡，然后单击左侧导航菜单中的“ Webhooks ”。单击右上角的添加Webhook
    - 在Payload URL字段中，输入<http://your_server_ip:5000。这是我们即将编写的Node.js>服务器的地址和端口。
    - 将内容类型更改为application/json。我们将编写的脚本将需要JSON数据，并且无法理解其他数据类型。
    - 对于Secret，请输入此webhook的密码。您将在Node.js服务器中使用此秘密来验证请求并确保它们来自GitHub。(xxjun_webhooktest)
    - 对于您想要触发此webhook 的事件，请仅选择推送事件。我们只需要push事件，因为那时代码已更新并需要同步到我们的服务器。

2. 将存储库的代码克隆到服务器上（需要配置ssh，上面我们已经完成了）

3. 创建服务器 来监听github webhook的请求 如：

``` shell
cd /home/www
mkdir webhook
cd webhook
touch webhook.js
```

```js
const secret = "xxjun_webhooktest";
const repo = "/home/www/myapp";
const http = require('http');
const crypto = require('crypto');
const exec = require('child_process').exec;
​
http.createServer(function (req, res) {
    req.on('data', function(chunk) {
        let sig = "sha1=" + crypto.createHmac('sha1', secret).update(chunk.toString()).digest('hex');
        if (req.headers['x-hub-signature'] == sig) {
            exec('cd ' + repo + ' && git pull && npm install && pm2 restart myapp-ecosystem');  // 这里根据自己的实际情况来写
        }
    });
    res.end();
}).listen(5000);
```

4. 启动服务 pm2 start webhook.js

5. 测试 本地添加代码后，提交到git仓库中，稍等一会儿，访问ip查看是否更新成功

## 五、docker 容器

> 程序在自己电脑运行正常，放到服务器上就报错了，这就是运行环境不同造成的，而通过 Docker在本机配置好 Dockerfile 文件后创建镜像，上传镜像库，再从镜像库下载到生产服务器，直接运行，这样就保证了开发和生产环境的一致。

1. 首先我们在开发环境 window系统中安装docker
    - 在安装之前，Windows 版 Docker 的环境有以下要求：Windows 必须是 64 位的版本；需要启用 Windows 操作系统中的 Hyper-V 和容器特性
    - 右键单击 Windows 开始按钮并选择“应用和功能”页面->单击“程序和功能”链接->单击“启用或关闭Windows功能->确认Hyper-V和容器复选框已经被勾选，并单击确定按钮
    - Docker Desktop 官方下载地址：<https://hub.docker.com/editions/community/docker-ce-desktop-windows>
    - 打开命令行或者 PowerShell 界面，并尝试执docker version命令
2. 我们在我们的项目myapp的根目录下创建一个Dockerfile文件，写下如下内容：

```shell
FROM node
COPY . /home/www/myapp
WORKDIR /home/www/myapp
RUN npm install
EXPOSE 3000  # 这里要和程式里面的端口一致
ENTRYPOINT [ "node","./bin/www" ]
```

在项目的根目录使用 `docker build -t xxjun:webapp .` 构建镜像
使用镜像： `docker container run -d --name webapp -p 3000:3000 xxjun:webapp`
访问 localhost:3000

3. 我们尝试在镜像中加入pm2

修改 Dockerfile文件 (这里是以 pm2作为基础镜像)

``` shell
FROM keymetrics/pm2
COPY . /home/www/myapp  # 因为我们是直接全拷贝，所以，需要先本地npm install 后，后面就可以不用run npm install,在执行docker，这样可以减少镜像大小
WORKDIR /home/www/myapp
EXPOSE 3000
ENTRYPOINT [ "pm2-runtime","start","./bin/www" ]  # 注意这里要用p2-runtime
```

使用 docker inspect 容器id 找到以下内容： "IPAddress": "172.17.0.2"   // 该地址会用到nginx的反向代理中

4. 我们创建一个nginx容器

修改 Dockerfile文件 (这里是以 nginx作为基础镜像)

``` shell
FROM nginx:latest
RUN rm /etc/nginx/conf.d/default.conf
COPY ./conf/default.conf /etc/nginx/conf.d/default.conf
```

新建 default.conf 配置内容，以便copy到容器中使用
如：

server {
    listen       8090;  # 配置端口
    server_name  localhost; # 配置域名
    location / {
        proxy_pass <http://172.17.0.2:3000>;  # 这里的172.17.0.2 对应的是步骤3的Ip地址
    }
    error_page   500 502 503 504  /50x.html; #错误状态码显示页面，配置需要重启
    location = /50x.html {
        root   html;
    }
}
进入容器 docker exec -it 容器名 bash 可以做一些你想要的的操作

5. 到目前位置，我们创建了两个容器，如果我们在创建一个db的容器就是三个了，那我们有没有可以统一管理这些容器了，下面我们会使用Docker Compose 来管理多个容器

## 六、常用的命令汇总

``` shell
启动进程/应用 pm2 start bin/www 或 pm2 start app.js
重命名进程/应用 pm2 start app.js --name wb123
添加进程/应用 watch pm2 start bin/www --watch
结束进程/应用 pm2 stop www
结束所有进程/应用 pm2 stop all
删除进程/应用 pm2 delete www
删除所有进程/应用 pm2 delete all
列出所有进程/应用 pm2 list
查看某个进程/应用具体情况 pm2 describe www
查看进程/应用的资源消耗情况 pm2 monit
查看pm2的日志 pm2 logs
若要查看某个进程/应用的日志,使用 pm2 logs www
重新启动进程/应用 pm2 restart www
重新启动所有进程/应用 pm2 restart all
```

## 七、参考文献

[pm2 官网](https://pm2.keymetrics.io/docs/usage/quick-start/)
