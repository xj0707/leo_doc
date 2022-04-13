
# Nginx

Nginx 同 Apache 一样都是一种 Web 服务器。基于 REST 架构风格，以统一资源描述符（Uniform Resources Identifier）URI 或者统一资源定位符（Uniform Resources Locator）URL 作为沟通依据，通过 HTTP 协议提供各种网络服务。
Nginx 使用基于事件驱动架构，使得其可以支持数以百万级别的 TCP 连接。
高度的模块化和自由软件许可证使得第三方模块层出不穷（这是个开源的时代啊）。
Nginx 是一个跨平台服务器，可以运行在 Linux、Windows、FreeBSD、Solaris、AIX、Mac OS 等操作系统上。
Nginx 是一款自由的、开源的、高性能的 HTTP 服务器和反向代理服务器；同时也是一个 IMAP、POP3、SMTP 代理服务器。
Nginx 可以作为一个 HTTP 服务器进行网站的发布处理，另外 Nginx 可以作为反向代理进行负载均衡的实现。

## 反向代理

此时请求的来源也就是客户端是明确的，但是请求具体由哪台服务器处理的并不明确了，Nginx 扮演的就是一个反向代理角色。客户端是无感知代理的存在的，反向代理对外都是透明的，访问者并不知道自己访问的是一个代理。因为客户端不需要任何配置就可以访问。
反向代理，'它代理的是服务端'，主要用于服务器集群分布式部署的情况下，反向代理隐藏了服务器的信息。
反向代理的作用：保证内网的安全，通常将反向代理作为公网访问地址，Web 服务器是内网。
负载均衡，通过反向代理服务器来优化网站的负载。

## 正向代理

在如今的网络环境下，我们如果由于技术需要要去访问国外的某些网站，此时你会发现位于国外的某网站我们通过浏览器是没有办法访问的。
此时大家可能都会用一个操作 FQ 进行访问，FQ 的方式主要是找到一个可以访问国外网站的代理服务器，我们将请求发送给代理服务器，代理服务器去访问国外的网站，然后将访问到的数据传递给我们！
上述这样的代理模式称为正向代理，正向代理最大的特点是客户端非常明确要访问的服务器地址；服务器只清楚请求来自哪个代理服务器，而不清楚来自哪个具体的客户端；正向代理模式屏蔽或者隐藏了真实客户端信息。
正向代理的用途：访问原来无法访问的资源，如 Google。
可以做缓存，加速访问资源。
对客户端访问授权，上网进行认证。
代理可以记录用户访问记录（上网行为管理），对外隐藏用户信息。

## 选择Nginx的理由

- 高并发连接（理论上支持5万并发连接，实际上可达3万左右并非连接数）
- 内存消耗少
- 配置文件非常简单
- 支持rewrite重写规则
- 内置健康检查功能
- 节省宽带（支持Gzip）
- 稳定性高
- 支持热部署

## nginx下载

访问[nginx](http://www.nginx.net/)

### windows下安装

下载nginx文件，解压缩到某个路径下，如：d:\nginx
然后执行 start nginx
如果要对启动nginx进程进行控制，可以使用DOS命令：
nginx -s [stop | quit | reopen | reload]

### linux下安装

- 编译源码方式安装

```bash
tar zxvf nginx-0.x.xx.tar.gz
cd nginx-0.x.xx
./configure
make
sudo make install
```

按照以上命令，nginx默认安装到/usr/local/nginx目录下。你可以通过./configure --help命令来查看nginx可选择的编译项。
启动nginx
/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf
注：参数`-c`指定了配置文件的路径，不加-c,默认加载安装目录的conf下的nginx.conf (/usr/local/nginx/sbin/nginx/conf/nginx.conf)
停止nginx
通过`ps`命令查找nginx的进程号： `ps -ef | grep nginx`
从容停止nginx: `kill - QUIT nginx主进程号`
快速停止nginx: `kill - TERM nginx主进程号`
重启nginx
`kill -HUP nginx主进程号`
重启日志
`Kill -USR1 nginx主进程号`

- nginx.conf 配置说明
结构如下：
........
evnets
{
    ........
}
http
{
    ........
    server
    {
        .......
    }
    server
    {
        ......
    }
    .........
}
示例如下：

```text
# 使用的用户和组
user www www;
# 工作衍生进程数（cpu核数的两倍）
worker_processes 8;
# 错误日志存放路径(日志级别：debug|info|notice|warn|error|crit)
error_log /datal/logs/nginx_error.log crit;
# 指定pid存放路径
pid /usr/local/dd/nginx/nginx.pid;
# 指定文件描述符数量
worker_rlimit_nofile 51200;

events
{
    # 使用的网络i/o模型
    use epoll
    # 允许的连接数
    worker_connections 51200
}
http
{
    # 这里包含设置使用字符集，客户端能够上传文件大小，开启gzip等
    ....
    # 一段server 就是一个虚拟主机，如果要配置多个虚拟主机就建立多个server
    server
    {
        # 监听的ip和端口
        listen 80;
        # 主机名称 或 域名
        server_name www.youdomin.com xxxx.com;
        # 访问的日志文件存放路径
        access_log logs/dddd.log
        location / {
            # 默认首页文件
            index index.html index.php index.htm;
            # html网页文件存放目录
            root /data0/htdocs
        }
        ....
    }
}

```

注：access_log来指定日志存放路径。 log_format用来设置日志的格式。

使用`ifconfig`命令查看该服务器的ip地址
可以通过 ifconfig 和 route 命令来往 eth0 网卡设备上添加 IP
如:
/sbin/ifconfig eth0:1 172.17.91.248 broadcast 172.18.255.255 netmask 255.255.0.0 up
/sbin/route add -host 172.17.91.248 dev  eth0:1
注：服务器重启后，添加ip就会消失，可以将命令添加到 `/etc/rc.local` 文件中，让系统开机自动允许

### Nginx日志文件切割

生成环境的服务器，由于访问日志文件增长速度非常快，日志太多会影响服务器效率，所以需要切割

1. 首先通过mv命令移动文件并改名
2. 通过cat获得文件中 nginx的pid进程号
3. 平滑重启日志
4. 借助 crontab 每天定时执行shell脚本（将1，2，3 步骤写成shell脚本）

## 负载均衡

多台服务器以对称的方式组成一个服务器的集合，每台服务器都具有等价的地位，都可以单独对外提供服务而无需其他服务器的辅助。
通过某种负载分担技术，将外部请求均匀的分配到对称的服务器上，而接受到的请求服务器独立地回应客户的请求。从而解决大量的并非问题。

### Upstream模块是nginx负载均衡的主要模块

示例

```text
upstream backend1 {
    server xxxxx;
    server xxxxx;
    server xxxxx;
}
server {
    location / {
        proxy_pass http://backend1;
    }
}
```
