### 前言

在上一篇中，我们了解了docker的基本概念和一些用法。在Docker中创建镜像最常用的方式,就是使用`Dockerfile`,本文主要是针对于`Dockerfile`的指令进行剖析。

### Dockerfile 定制镜像

如果我们可以把每一层修改、安装、构建、操作的命令都写入一个脚本，用这个脚本来构建、定制镜像，那么之前提及的无法重复的问题、镜像构建透明性的问题、体积的问题就都会解决。这个脚本就是 `Dockerfile`。
`Dockerfile`是一个文本文件，其内包含了一条条的 指令(Instruction)，每一条指令构建一层，因此每一条指令的内容，就是描述该层应当如何构建。

### 常用命令详解

#### FROM 指定基础镜像

定制镜像，那一定是以一个镜像为基础，在其上进行定制。就像我们之前运行了一个 nginx 镜像的容器，再进行修改一样，基础镜像是必须指定的。而` FROM `就是指定 基础镜像，因此一个 Dockerfile 中 `FROM` 是必备的指令，并且必须是第一条指令.

- 服务类的镜像，如 nginx、redis、mongo、mysql、httpd、php、tomcat 等；
- 方便开发、构建、运行各种语言应用的镜像，如 node、openjdk、python、ruby、golang 等
- 一些更为基础的操作系统镜像，如 ubuntu、debian、centos、fedora、alpine 等
注：除了选择现有镜像为基础镜像外，Docker 还存在一个特殊的镜像，名为 `scratch`。这个镜像是虚拟的概念，并不实际存在，它表示一个空白的镜像。

#### RUN 执行命令

`RUN`指令是用来执行命令行命令的。由于命令行的强大能力，RUN 指令在定制镜像时是最常用的指令之一。其格式有两种：

- shell 格式：像直接在命令行中输入的命令一样
- exec 格式：RUN ["可执行文件", "参数1", "参数2"]，这更像是函数调用中的格式

```
FROM debian:stretch

RUN apt-get update
RUN apt-get install -y gcc libc6-dev make wget
RUN wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz"
RUN mkdir -p /usr/src/redis
RUN tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1
RUN make -C /usr/src/redis
RUN make -C /usr/src/redis install
```

注：Dockerfile 中每一个指令都会建立一层，`RUN` 也不例外,上面的这种写法，创建了 7 层镜像。这是完全没有意义的，而且很多运行时不需要的东西，都被装进了镜像里，比如编译环境、更新的软件包等等。结果就是产生非常臃肿、非常多层的镜像，不仅仅增加了构建部署的时间，也很容易出错。
上面的 Dockerfile 正确的写法应该是这样:

```
RUN set -x; buildDeps='gcc libc6-dev make wget' \
    && apt-get update \
    && apt-get install -y $buildDeps \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && mkdir -p /usr/src/redis \
    && tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1 \
    && make -C /usr/src/redis \
    && make -C /usr/src/redis install \
    && rm -rf /var/lib/apt/lists/* \
    && rm redis.tar.gz \
    && rm -r /usr/src/redis \
    && apt-get purge -y --auto-remove $buildDeps
```

注： 之前的 7 层，简化为了 1 层。在撰写 Dockerfile 的时候，要经常提醒自己，这并不是在写 Shell 脚本，而是在定义每一层该如何构建。

#### COPY 复制文件

和 RUN 指令一样，也有两种格式，一种类似于命令行，一种类似于函数调用。
COPY [--chown=<user>:<group>] <源路径>... <目标路径>
ex:  `COPY package.json /usr/src/app/`
<目标路径> 可以是容器内的绝对路径，也可以是相对于工作目录的相对路径（工作目录可以用 WORKDIR 指令来指定）
在使用该指令的时候还可以加上 --chown=<user>:<group> 选项来改变文件的所属用户及所属组。
如果源路径为文件夹，复制的时候不是直接复制该文件夹，而是将文件夹中的内容复制到目标路径。

#### ADD 更高级的复制文件

ADD 指令和 COPY 的格式和性质基本一致。但是在 COPY 基础上增加了一些功能。
比如 <源路径> 可以是一个 URL，这种情况下，Docker 引擎会试图去下载这个链接的文件放到 <目标路径> 去。下载后的文件权限自动设置为 600，如果这并不是想要的权限，那么还需要增加额外的一层 RUN 进行权限调整，
如果 <源路径> 为一个 tar 压缩文件的话，压缩格式为 gzip, bzip2 以及 xz 的情况下，ADD 指令将会自动解压缩这个压缩文件到 <目标路径> 去。
注：尽可能的使用 COPY，因为 COPY 的语义很明确，就是复制文件而已，最适合使用 ADD 的场合，就是所提及的需要自动解压缩的场合。

#### CMD 容器启动命令

CMD 指令的格式和 RUN 相似，也是两种格式：
    - shell 格式：CMD <命令>
    - exec 格式：CMD ["可执行文件", "参数1", "参数2"...]
之前介绍容器的时候曾经说过，Docker 不是虚拟机，容器就是进程。既然是进程，那么在启动容器的时候，需要指定所运行的程序及参数。CMD 指令就是用于指定默认的容器主进程的启动命令的。
在指令格式上，一般推荐使用 exec 格式，这类格式在解析时会被解析为 JSON 数组，因此一定要使用双引号 "，而不要使用单引号。
如果使用 shell 格式的话，实际的命令会被包装为 sh -c 的参数的形式进行执行。比如：
`CMD echo $HOME`
在实际执行中，会将其变更为：
`CMD [ "sh", "-c", "echo $HOME" ]`

#### ENTRYPOINT 入口点

ENTRYPOINT 的目的和 CMD 一样，都是在指定容器启动程序及参数。ENTRYPOINT 在运行时也可以替代，不过比 CMD 要略显繁琐，需要通过 docker run 的参数` --entrypoint `来指定。
当指定了 ENTRYPOINT 后，CMD 的含义就发生了改变，不再是直接的运行其命令，而是将 CMD 的内容作为参数传给 ENTRYPOINT 指令，换句话说实际执行时，将变为：
<ENTRYPOINT> "<CMD>"
假设我们需要一个得知自己当前公网 IP 的镜像，那么可以先用 CMD 来实现：

```
FROM ubuntu:18.04
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
CMD [ "curl", "-s", "http://myip.ipip.net" ]
```

假如我们使用 ` docker build -t myip . `来构建镜像的话，如果我们需要查询当前公网 IP，只需要执行： `docker run myip`
如果我们希望显示 HTTP 头信息，就需要加上 -i 参数: `docker run myip -i` 就会报错
使用 ENTRYPOINT 就可以解决这个问题。现在我们重新用 ENTRYPOINT 来实现这个镜像：

```
FROM ubuntu:18.04
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
ENTRYPOINT [ "curl", "-s", "http://myip.ipip.net" ]
```

再来尝试直接使用` docker run myip -i `:可以看到，这次成功了。这是因为当存在 ENTRYPOINT 后，CMD 的内容将会作为参数传给 ENTRYPOINT，而这里 -i 就是新的 CMD，因此会作为参数传给 curl，从而达到了我们预期的效果。
场景二：应用运行前的准备工作
有些时候，启动主进程前，需要一些准备工作,比如 mysql 类的数据库，可能需要一些数据库配置、初始化的工作，这些工作要在最终的 mysql 服务器运行之前解决。这种情况下，可以写一个脚本，然后放入 ENTRYPOINT 中去执行，而这个脚本会将接到的参数（也就是 <CMD>）作为命令，在脚本最后执行。

#### ENV 设置环境变量

格式有两种：
    - ENV <key> <value>
    - ENV <key1>=<value1> <key2>=<value2>...
注：对含有空格的值用双引号括起来

```
ENV VERSION=1.0 DEBUG=on \
    NAME="Happy Feet"
```

先定义了环境变量 `NODE_VERSION`，其后的 RUN 这层里，多次使用` $NODE_VERSION `来进行操作定制.可以从这个指令列表里感觉到，环境变量可以使用的地方很多，很强大。通过环境变量，我们可以让一份 Dockerfile 制作更多的镜像，只需使用不同的环境变量即可。

#### ARG 构建参数

格式：`ARG <参数名>[=<默认值>]`
构建参数和 ENV 的效果一样，都是设置环境变量。所不同的是，ARG 所设置的构建环境的环境变量，在将来容器运行时是不会存在这些环境变量的。
ARG 指令有生效范围，如果在 FROM 指令之前指定，那么只能用于 FROM 指令中.

```
# 只在 FROM 中生效
ARG DOCKER_USERNAME=library
FROM ${DOCKER_USERNAME}/alpine
# 要想在 FROM 之后使用，必须再次指定
ARG DOCKER_USERNAME=library
RUN set -x ; echo ${DOCKER_USERNAME}
```

#### VOLUME 定义匿名卷

格式为：
    - VOLUME ["<路径1>", "<路径2>"...]
    - VOLUME <路径>
为了防止运行时用户忘记将动态文件所保存目录挂载为卷，在 Dockerfile 中，我们可以事先指定某些目录挂载为匿名卷，这样在运行时如果用户不指定挂载，其应用也可以正常运行，不会向容器存储层写入大量数据。
`VOLUME /data`
这里的 /data 目录就会在运行时自动挂载为匿名卷，任何向 /data 中写入的信息都不会记录进容器存储层，从而保证了容器存储层的无状态化。

#### EXPOSE 声明端口

格式为`EXPOSE <端口1> [<端口2>...]`。而 EXPOSE 仅仅是声明容器打算使用什么端口而已，并不会自动在宿主进行端口映射。在 Dockerfile 中写入这样的声明有两个好处，一个是帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；另一个用处则是在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口。

#### WORKDIR 指定工作目录

格式为 `WORKDIR <工作目录路径>`。
使用 WORKDIR 指令可以来指定工作目录（或者称为当前目录），以后各层的当前目录就被改为指定的目录，如该目录不存在，WORKDIR 会帮你建立目录。
初学者常犯的错误是把 Dockerfile 等同于 Shell 脚本来书写，这种错误的理解还可能会导致出现下面这样的错误：

```
RUN cd /app
RUN echo "hello" > world.txt
```

进行构建镜像运行后，会发现找不到 /app/world.txt 文件，或者其内容不是 hello.
因此如果需要改变以后各层的工作目录的位置，那么应该使用 WORKDIR 指令

```
WORKDIR /app
RUN echo "hello" > world.txt
```

如果你的 WORKDIR 指令使用的相对路径，那么所切换的路径与之前的 WORKDIR 有关：

```
WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd
```

pwd 输出的结果为 /a/b/c。

#### USER 指定当前用户

格式：`USER <用户名>[:<用户组>]`
USER 指令和 WORKDIR 相似，都是改变环境状态并影响以后的层。WORKDIR 是改变工作目录，USER 则是改变之后层的执行 RUN, CMD 以及 ENTRYPOINT 这类命令的身份。
注意，USER 只是帮助你切换到指定用户而已，这个用户必须是事先建立好的，否则无法切换。

```
RUN groupadd -r redis && useradd -r -g redis redis
USER redis
RUN [ "redis-server" ]
```

如果以 root 执行的脚本，在执行期间希望改变身份，比如希望以某个已经建立好的用户来运行某个服务进程，不要使用 su 或者 sudo，这些都需要比较麻烦的配置，而且在 TTY 缺失的环境下经常出错。建议使用`gosu`

```
# 建立 redis 用户，并使用 gosu 换另一个用户执行命令
RUN groupadd -r redis && useradd -r -g redis redis
# 下载 gosu
RUN wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.12/gosu-amd64" \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true
# 设置 CMD，并以另外的用户执行
CMD [ "exec", "gosu", "redis", "redis-server" ]
```

#### HEALTHCHECK 健康检查

格式：
    `HEALTHCHECK [选项] CMD <命令>`：设置检查容器健康状况的命令
    `HEALTHCHECK NONE`：如果基础镜像有健康检查指令，使用这行可以屏蔽掉其健康检查指令
Docker 提供了 HEALTHCHECK 指令，通过该指令指定一行命令，用这行命令来判断容器主进程的服务状态是否还正常，从而比较真实的反应容器实际状态。
当在一个镜像指定了 HEALTHCHECK 指令后，用其启动容器，初始状态会为 starting，在 HEALTHCHECK 指令检查成功后变为 healthy，如果连续一定次数失败，则会变为 unhealthy
HEALTHCHECK 支持下列选项：
    --interval=<间隔>：两次健康检查的间隔，默认为 30 秒；
    --timeout=<时长>：健康检查命令运行超时时间，如果超过这个时间，本次健康检查就被视为失败，默认 30 秒；
    --retries=<次数>：当连续失败指定次数后，则将容器状态视为 unhealthy，默认 3 次。

#### ONBUILD 为他人做嫁衣裳

格式：`ONBUILD <其它指令>`。
ONBUILD 是一个特殊的指令，它后面跟的是其它指令，比如 RUN, COPY 等，而这些指令，在当前镜像构建时并不会被执行。只有当以当前镜像为基础镜像，去构建下一级镜像的时候才会被执行。
Dockerfile 中的其它指令都是为了定制当前镜像而准备的，唯有 ONBUILD 是为了帮助别人定制自己而准备的。
定义基础镜像的 Dockerfile:

```
FROM node:slim
RUN mkdir /app
WORKDIR /app
ONBUILD COPY ./package.json /app
ONBUILD RUN [ "npm", "install" ]
ONBUILD COPY . /app/
CMD [ "npm", "start" ]
```

假设这个基础镜像的名字为 my-node 的话，各个项目内的自己的 Dockerfile 就变为：

```
FROM my-node

```

#### LABEL 指令

LABEL 指令用来给镜像以键值对的形式添加一些元数据（metadata）。
`LABEL <key>=<value> <key>=<value> <key>=<value> ...`

#### SHELL 指令

格式：`SHELL ["executable", "parameters"]`
SHELL 指令可以指定 RUNENTRYPOINTCMD 指令的 shell，Linux 中默认为 ["/bin/sh", "-c"]
SHELL ["/bin/sh", "-c"]
SHELL ["/bin/sh", "-cex"]
最佳实践：<https://docs.docker.com/develop/develop-images/dockerfile_best-practices/>

### 构建镜像

使用了 `docker build`命令进行镜像构建。其格式为：`docker build [选项] <上下文路径/URL/->`
当我们进行镜像构建的时候，并非所有定制都会通过 RUN 指令完成，经常会需要将一些本地文件复制进镜像，比如通过 COPY 指令、ADD 指令等。而 docker build 命令构建镜像，其实并非在本地构建，而是在服务端，也就是 Docker 引擎中构建的。那么在这种客户端/服务端的架构中，如何才能让服务端获得本地文件呢？
这就引入了上下文的概念。当构建的时候，用户会指定构建镜像上下文的路径，docker build 命令得知这个路径后，会将路径下的所有内容打包，然后上传给 Docker 引擎。这样 Docker 引擎收到这个上下文包后，展开就会获得构建镜像所需的一切文件。
ex: `docker build -t nginx:v3 .`
在这里我们指定了最终镜像的名称 -t nginx:v3
会看到 docker build 命令最后有一个 .。. 表示当前目录,这个点就是在指定 上下文路径。（Docker 在运行时分为 Docker 引擎和客户端工具。Docker 的引擎提供了一组 REST API，被称为 Docker Remote API，而如 docker 命令这样的客户端工具，则是通过这组 API 与 Docker 引擎交互，从而完成各种功能。虽然表面上我们好像是在本机执行各种 docker 功能，但实际上，一切都是使用的远程调用形式在服务端（Docker 引擎）完成。）
注：一般来说，应该会将 Dockerfile 置于一个空目录下，或者项目根目录下。如果该目录下没有所需文件，那么应该把所需文件复制一份过来。如果目录下有些东西确实不希望构建时传给 Docker 引擎，那么可以用 .gitignore 一样的语法写一个 .dockerignore，该文件是用于剔除不需要作为上下文传递给 Docker 引擎的。
docker build 还支持从 URL 构建，比如可以直接从 Git repo 中构建
ex: `docker build -t hello-world https://github.com/docker-library/hello-world.git#master:amd64/hello-world`
这行命令指定了构建所需的 Git repo，并且指定分支为 master，构建目录为 /amd64/hello-world/，然后 Docker 就会自己去 git clone 这个项目、切换到指定分支、并进入到指定目录后开始构建。
用给定的 tar 压缩包构建
`docker build http://server/context.tar.gz`
从标准输入中读取 Dockerfile 进行构建
`ocker build - < Dockerfile`
从标准输入中读取上下文压缩包进行构建
`docker build - < context.tar.gz`

我们可以使用 as 来为某一阶段命名，例如
`FROM golang:1.9-alpine as builder`
例如当我们只想构建 builder 阶段的镜像时，增加 --target=builder 参数即可
`docker build --target builder -t username/imagename:tag .`

### 最后

在撰写 Dockerfile 的时候，要经常提醒自己，这并不是在写 Shell 脚本，而是在定义每一层该如何构建。Dockerfile 支持 Shell 类的行尾添加 \ 的命令换行方式，以及行首 # 进行注释的格式。良好的格式，比如换行、缩进、注释等，会让维护、排障更为容易，这是一个比较好的习惯。镜像是多层存储，每一层的东西并不会在下一层被删除，会一直跟随着镜像。因此镜像构建时，一定要确保每一层只添加真正需要添加的东西，任何无关的东西都应该清理掉。
很多人初学 Docker 制作出了很臃肿的镜像的原因之一，就是忘记了每一层构建的最后一定要清理掉无关文件。
