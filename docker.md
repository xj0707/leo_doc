# Docker

## Docker 引擎

Docker 引擎由如下主要的组件构成：Docker 客户端（Docker Client）、Docker 守护进程（Docker daemon）、containerd 以及 runc。它们共同负责容器的创建和运行.

## Docker 镜像

1. 首先需要先从镜像仓库服务中拉取镜像。  `docker image pull <repository>:<tag>`
2. 使用该镜像启动一个或者多个容器。

Docker 镜像由一些松耦合的只读镜像层组成。
所有的 Docker 镜像都起始于一个基础镜像层，当进行修改或增加新的内容时，就会在当前镜像层之上，创建新的镜像层。

docker image ls列出了本地 Docker 主机上存储的镜像
docker image inspect命令非常有用！该命令完美展示了镜像的细节，包括镜像层数据和元数据
ocker image rm用于删除镜像。

## Docker 容器

启动容器的简便方式是使用docker container run命令。
使用 docker container stop 命令手动停止容器运行，并且使用 docker container start 再次启动该容器
如果再也不需要该容器，则使用 docker container rm 命令来删除容器。

容器是为应用而生的，具体来说，容器能够简化应用的构建、部署和运行过程。
完整的应用容器化过程主要分为以下几个步骤。

    编写应用代码。
    创建一个 Dockerfile，其中包括当前应用的描述、依赖以及该如何运行这个应用。
    对该 Dockerfile 执行 docker image build 命令。
    等待 Docker 将应用程序构建到 Docker 镜像中。

一旦应用容器化完成（即应用被打包为一个 Docker 镜像），就能以镜像的形式交付并以容器的方式运行了。

## Dockerfile

应用文件的目录通常被称为构建上下文（Build Context）。通常将 Dockerfile 放到构建上下文的根目录下

- 每个 Dockerfile 文件第一行都是 FROM 指令。FROM 指令指定的镜像，会作为当前镜像的一个基础镜像层，当前应用的剩余内容会作为新增镜像层添加到基础镜像层之上。（第一层）
- Dockerfile 中通过标签（LABLE）方式指定了当前镜像的维护者
- RUN 指令会在 FROM 指定的 基础镜像之上，新建一个镜像层来存储这些安装内容 （第二层）
- COPY. / src 指令将应用相关文件从构建上下文复制到了当前镜像中，并且新建一个镜像层来存储。 （第三层）
- Dockerfile 通过 WORKDIR 指令，为 Dockerfile 中尚未执行的指令设置工作目录。
- 最终，通过 ENTRYPOINT 指令来指定当前镜像的入口程序。ENTRYPOINT 指定的配置信息也是通过镜像元数据的形式保存下来，而不是新增镜像层。
注：Dockerfile 中的注释行，都是以#开头的。
示例:
FROM alpine
LABEL maintainer="xxxxxx"
RUN apk add --update nodejs nodejs-npm
COPY . /src
WORKDIR /src
RUN npm install
EXPOSE 8080
ENTRYPOINT ["node", "./app.js"]

## 构建镜像

 `docker build -t web:latest .`
 命令会构建并生成一个名为 web:latest 的镜像。命令最后的点（.）表示 Docker 在进行构建的时候，使用当前目录作为构建上下文。
 通过 docker image inspect web:latest 来确认刚刚构建的镜像配置是否正确。（如果不出问题 layer有：四层）

推送镜像到仓库
在推送镜像之前，需要先使用 Docker ID 登录 Docker Hub
docker login
docker image push

## 运行应用程序

docker container run -d --name c1 -p 80:8080 web:latest
基于 web:latest 这个镜像，启动一个名为 c1 的容器。该容器将内部的 8080 端口与 Docker 主机的 80 端口进行映射。
果 Docker 主机已经运行了某个使用 80 端口的应用程序，读者可以在执行 docker container run 命令时指定一个不同的映射端口。例如，可以使用 -p 5000:8080 参数，将 Docker 内部应用程序的 8080 端口映射到主机的 5000 端口。
-d 参数的作用是让应用程序以守护线程的方式在后台运行。
打开浏览器，在地址栏输入 DNS 名称或者 IP 地址，就能访问到正在运行的应用程序了。

注： 每一个 RUN 指令会新增一个镜像层。因此，通过使用 && 连接多个命令以及使用反斜杠（\）换行的方法，将多个命令包含在一个 RUN 指令中，通常来说是一种值得提倡的方式。

## 多阶段构建

对于 Docker 镜像来说，过大的体积并不好！越大则越慢，这就意味着更难使用，而且可能更加脆弱，更容易遭受攻击。
> 多阶段构建方式使用一个 Dockerfile，其中包含多个 FROM 指令。每一个 FROM 指令都是一个新的构建阶段（Build Stage），并且可以方便地复制之前阶段的构件。

示例：
FROM node:latest AS setup01
WORKDIR /usr/src/atsea/app/react-app
COPY react-app .
RUN npm install
RUN npm run build

FROM maven:latest AS setup02
WORKDIR /usr/src/atsea
COPY pom.xml .
RUN mvn -B -f pom.xml -s /usr/share/maven/ref/settings-docker.xml dependency
\:resolve
COPY . .
RUN mvn -B -s /usr/share/maven/ref/settings-docker.xml package -DskipTests

FROM java:8-jdk-alpine AS setup03
RUN adduser -Dh /home/gordon gordon
WORKDIR /static
COPY --from=setup01 /usr/src/atsea/app/react-app/build/ .
WORKDIR /app
COPY --from=setup02 /usr/src/atsea/target/AtSea-0.0.1-SNAPSHOT.jar .
ENTRYPOINT ["java", "-jar", "/app/AtSea-0.0.1-SNAPSHOT.jar"]
CMD ["--spring.profiles.active=postgres"]

setup01: 拉取了大小超过 600MB 的 node:latest 镜像，然后设置了工作目录，复制一些应用代码进去，然后使用 2 个 RUN 指令来执行 npm 操作。指令执行结束后会得到一个比原镜像大得多的镜像，其中包含许多构建工具和少量应用程序代码。
setup02: 拉取了大小超过 700MB 的 maven:latest 镜像。然后通过 2 个 COPY 指令和 2 个 RUN 指令生成了 4 个镜像层。这个阶段同样会构建出一个非常大的包含许多构建工具和非常少量应用程序代码的镜像。
setup03: 拉取 java:8-jdk-alpine 镜像，这个镜像大约 150MB，这个阶段会创建一个用户，设置工作目录，从 setup01 阶段生成的镜像中复制一些应用代码过来。之后，设置一个不同的工作目录，然后从 setup02 阶段生成的镜像中复制应用相关的代码。最后，setup03 设置当前应用程序为容器启动时的主程序。

注： COPY --from 指令，它从之前的阶段构建的镜像中仅复制生产环境相关的应用代码，而不会复制生产环境不需要的构件。

最后使用docker image build -t multi:stage . 构建镜像

## 合并镜像

当镜像中层数太多时，合并是一个不错的优化方式。缺点是，合并的镜像将无法共享镜像层。这会导致存储空间的低效利用，而且 push 和 pull 操作的镜像体积更大。
行 docker image build 命令时，可以通过增加 --squash 参数来创建一个合并的镜像。

## Docker Compose

多数的现代应用通过多个更小的服务互相协同来组成一个完整可用的应用。比如一个简单的示例应用可能由如下 4 个服务组成。

    Web前端。
    订单管理。
    品类管理。
    后台数据库。

将以上服务组织在一起，就是一个可用的应用。部署和管理繁多的服务是困难的。而这正是 Docker Compose 要解决的问题。

Docker Compose 是通过一个声明式的配置文件描述整个应用，从而使用一条命令完成部署。应用部署成功后，还可以通过一系列简单的命令实现对其完整声明周期的管理。甚至，配置文件还可以置于版本控制系统中进行存储和管理。

Docker Compose 使用 YAML 文件来定义多服务的应用.默认使用文件名 docker-compose.yml。当然，也可以使用 -f 参数指定具体文件。

基本结构包含 4 个一级 key：version、services、networks、volumes。

- version 是必须指定的，而且总是位于文件的第一行。它定义了 Compose 文件格式（主要是 API）的版本。
- services 用于定义不同的应用服务。Docker Compose 会将每个服务部署在各自的容器中
- networks 用于指引 Docker 创建新的网络。默认情况下，Docker Compose 会创建 bridge 网络。这是一种单主机网络，只能够实现同一主机上容器的连接。当然，也可以使用 driver 属性来指定不同的网络类型。
- volumes 用于指引 Docker 来创建新的卷。

Compose 文件中的 services 部分定义了 多个二级key ,每个key代表容器的名字的一部分
每个key中可以包含如下指令：
- build： 指定 Docker 基于当前目录（.）下 Dockerfile 中定义的指令来构建一个新镜像。该镜像会被用于启动该服务的容器。
- command： 指定 Docker 在容器中执行脚本作为主程序。
- ports： 指定 Docker 将容器内的  端口映射到主机的 5000 端口。
- networks：使得 Docker 可以将服务连接到指定的网络上。这个网络应该是已经存在的，或者是在 networks 一级 key 中定义的网络。对于 Overlay 网络来说，它还需要定义一个 attachable 标志，这样独立的容器才可以连接上它（这时 Docker Compose 会部署独立的容器而不是 Docker 服务）。
- volumes：指定 Docker 将 xxx 卷（source:）挂载到容器内的 /code（target:）。xxxx 卷应该是已存在的，或者是在文件下方的 volumes 一级 key 中定义的。
- image
- networks

示例：
version: "3.5"
services:
    web-fe:
        build: .
        command: python app.py
        ports:
            - target: 5000
            published: 5000
        networks:
            - counter-net
        volumes:
            - type: volume
        source: counter-vol
        target: /code
    redis:
        image: "redis:alpine"
        networks:
            counter-net:
networks:
    counter-net:
volumes:
    counter-vol:

Docker Compose 会使用目录名（counter-app）作为项目名称，这一点在后续的操作中会看到，Docker Compose 会将所有的资源名称中加上前缀 counter-app_。
启动一个 Compose 应用（通过 Compose 文件定义的多容器应用称为“Compose 应用”）的方式就是 docker-compose up 命令。默认情况下，docker-compose up 会查找名为 docker-compose.yml 或 docker-compose.yaml 的 Compose 文件。

使用 docker-compose top 命令列出各个服务（容器）内运行的进程。
docker-compose stop 命令会停止应用，但并不会删除资源。然后再次运行 docker-compose ps 查看状态。
对于已停止的 Compose 应用，可以使用 docker-compose rm 命令来删除。这会删除应用相关的容器和网络，但是不会删除卷和镜像。
执行 docker-compose restart 命令重启应用
使用 docker-compose down 这一个命令就可以停止和关闭应用。它会删除容器和网络，但是不会删除卷和镜像。
docker-compose ps列出 Compose 应用中的各个容器。输出内容包括当前状态、容器运行的命令以及网络端口。
