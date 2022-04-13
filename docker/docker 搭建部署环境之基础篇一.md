# 前言

作为程序员,我们每天从事的熟悉得不能再熟悉的软件开发工作:
在本地搭好开发环境，进行开发工作，完了进行单元测试，把开发好的代码部署到测试系统，重复测试，最后部署到生产系统。
我们不可避免地会遇到这种情况：同样的代码，运行环境发生变化之后无法正常运行。
而作为一个应用程序开发人员，我对底层的这些环境问题不感兴趣，有没有一种办法能使的我不去考虑它们呢？有，使用容器技术。
容器技术早已存在，Docker 是属于容器服务的一种，是一个开源的应用容器引擎。
docker容器可以将同一个构建版本用于开发、测试、预发布、生产等任何环境，并且做到了与底层操作系统的解耦。在此基础上，还进一步发展出了CaaS（容器即服务）技术。
无论是应用开发者、运维人员、还是其他信息技术从业人员，都有必要认识和掌握 Docker，节约有限的生命。

## Docker基本概念

#### 镜像（Image）

Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像不包含任何动态数据，其内容在构建之后也不会被改变。

#### 容器（Container）

镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的 类 和 实例 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。

#### 仓库（Repository）

仓库可看成一个代码控制中心，用来保存镜像。每个仓库可以包含多个 标签（Tag）；每个标签对应一个镜像。

### 如何构建镜像

> 镜像构建时，会一层层构建，前一层是后一层的基础。每一层构建完就不会再发生改变，后一层上的任何改变只发生在自己这一层。比如，删除前一层文件的操作，实际不是真的删除前一层的文件，而是仅在当前层标记为该文件已删除。在最终容器运行的时候，虽然不会看到这个文件，但是实际上该文件会一直跟随镜像。因此，在构建镜像的时候，需要额外小心，每一层尽量只包含该层需要添加的东西，任何额外的东西应该在该层构建结束前清理掉。

#### 使用docker commit

使用 docker commit生成的镜像也被称为 黑箱镜像，换句话说，就是除了制作镜像的人知道执行过什么命令、怎么生成的镜像，别人根本无从得知。而且，即使是这个制作镜像的人，过一段时间后也无法记清具体的操作。这种黑箱镜像的维护工作是非常痛苦的。每一次修改都会让镜像更加臃肿一次，所删除的上一层的东西并不会丢失，会一直如影随形的跟着这个镜像，即使根本无法访问到。这会让镜像更加臃肿。
docker commit 的语法格式为：`docker commit [选项] <容器ID或容器名> [<仓库名>[:<标签>]]`

#### 使用Dockerfile指令

> 内容太多，请查看 基础篇二

### 操作容器

> 容器是独立运行的一个或一组应用，以及它们的运行态环境。

#### 启动容器

> 启动容器有两种方式，一种是基于镜像新建一个容器并启动，另外一个是将在终止状态（stopped）的容器重新启动。

1. 新建并启动: `docker run`
2. 启动已终止容器: `docker container start`

#### 查看已创建的容器

使用` docker container ls -a `命令

#### 终止容器

使用 `docker container stop` 来终止一个运行中的容器

#### 进入容器

> 某些时候需要进入容器进行操作，包括使用 docker attach 命令或 docker exec 命令

1. 使用` docker attach `命令
注: 如果从这个 stdin 中 exit，会导致容器的停止。
2. 使用` docker exec `命令
注：如果从这个 stdin 中 exit，不会导致容器的停止。

#### 导出和导入容器

1. 如果要导出本地某个容器，可以使用 `docker export` 命令
ex：`docker export 7691a814370e > ubuntu.tar`
2. 使用 `docker import`从容器快照文件中再导入为镜像
ex: `cat ubuntu.tar | docker import - test/ubuntu:v1.0`

#### 删除容器

1. 使用 `docker container rm`来删除一个处于终止状态的容器
注： 如果要删除一个运行中的容器，可以添加 -f 参数
2. 用下面的命令可以清理掉所有处于终止状态的容器。
`docker container prune`

### 仓库

> 仓库（Repository）是集中存放镜像的地方。

#### Docker Hub

目前 Docker 官方维护了一个公共仓库 Docker Hub，其中已经包括了数量超过 2,650,000 的镜像。大部分需求都可以通过在 Docker Hub 中直接下载镜像来实现。

1. 可以在 <https://hub.docker.com> 免费注册一个 Docker 账号。
2. 通过执行 `docker login` 命令交互式的输入用户名及密码来完成在命令行界面登录 Docker Hub。
3. 可以通过` docker search `命令来查找官方仓库中的镜像
4. 利用 `docker pull`命令来将它下载到本地
5. 通过 `docker push` 命令来将自己的镜像推送到 Docker Hub
**自动构建**

> 有时候，用户构建了镜像，安装了某个软件，当软件发布新版本则需要手动更新镜像。 Docker Hub提供了自动构建功能。
要配置自动构建，包括如下的步骤：
    - 登录 Docker Hub；
    - 在 Docker Hub 点击右上角头像，在账号设置（Account Settings）中关联（Linked Accounts）目标网站；
    - 在 Docker Hub 中新建或选择已有的仓库，在 Builds 选项卡中选择 Configure Automated Builds；
    - 选取一个目标网站中的项目（需要含 Dockerfile）和分支；
    - 指定 Dockerfile 的位置，并保存。

#### 私有仓库

> 有时候使用 Docker Hub 这样的公共仓库可能不方便，用户可以创建一个本地仓库供私人使用。
使用 `docker-registry` 工具(官方提供)，可以用于构建私有的镜像仓库。

### 数据管理

> Docker 内部以及容器之间管理数据，在容器中管理数据主要有两种方式：数据卷（Volumes）和 挂载主机目录 (Bind mounts)

#### 数据卷

> 数据卷 是一个可供一个或多个容器使用的特殊目录,类似于 Linux 下对目录或文件进行 mount.

1. 创建一个数据卷: `docker volume create my-vol`
2. 查看所有数据卷：`docker volume ls`
3. 查看指定数据卷详细信息： `docker volume inspect my-vol`
4. 启动容器并挂载数据卷使用--mount
ex: 下面创建一个名为 web 的容器，并加载一个 数据卷 到容器的 /usr/share/nginx/html 目录

```
docker run -d -P \
    --name web \
    # -v my-vol:/usr/share/nginx/html \
    --mount source=my-vol,target=/usr/share/nginx/html \
    nginx:alpine
```

5. 查看容器中数据卷的信息：`docker inspect web`
6. 删除数据卷：`docker volume rm my-vol`

> 数据卷 是被设计用来持久化数据的，它的生命周期独立于容器，Docker 不会在容器被删除后自动删除 数据卷,无主的数据卷可能会占据很多空间，要清理请使用以下命令 `docker volume prune`

#### 挂载一个主机的目录作为数据卷

```
docker run -d -P \
    --name web \
    # -v /src/webapp:/usr/share/nginx/html \
    --mount type=bind,source=/src/webapp,target=/usr/share/nginx/html \
    nginx:alpine
```

上面的命令加载主机的 /src/webapp 目录到容器的 /usr/share/nginx/html目录。Docker 挂载主机目录的默认权限是 读写，用户也可以通过增加 readonly 指定为 只读。如：

```
docker run -d -P \
    --name web \
    # -v /src/webapp:/usr/share/nginx/html:ro \
    --mount type=bind,source=/src/webapp,target=/usr/share/nginx/html,readonly \
    nginx:alpine
```

注：也可以挂载某个文件作为数据卷

### 网络

#### 外部访问容器

> 容器中可以运行一些网络应用，要让外部也可以访问这些应用，可以通过 -P 或 -p 参数来指定端口映射。

1. 当使用` -P ` 标记时，Docker 会随机映射一个端口到内部容器开放的网络端口。
2. `-p` 则可以指定要映射的端口，并且，在一个指定端口上只可以绑定一个容器。支持的格式有 ip:hostPort:containerPort(指定映射使用一个特定地址) | ip::containerPort(映射到指定地址的任意端口) | hostPort:containerPort。
ex: 本地的 80 端口映射到容器的 80 端口 : `docker run -d -p 80:80 nginx:alpine`
3. 使用 `docker port` 来查看当前映射的端口配置

### 容器互联

> 随着 Docker 网络的完善，强烈建议大家将容器加入自定义的 Docker 网络来连接多个容器，而不是使用 --link 参数。

1. 先创建一个新的 Docker 网络：`docker network create -d bridge my-net`
注：-d 参数指定 Docker 网络类型，有 `bridge` 、 `overlay`
2. 运行一个容器并连接到新建的 my-net 网络： `docker run -it --rm --name busybox1 --network my-net busybox sh`
3. 再运行一个容器并加入到 my-net 网络: `docker run -it --rm --name busybox2 --network my-net busybox sh`
4. 通过` ping `来证明` busybox1 `容器和 `busybox2`容器建立了互联关系

### 其他
