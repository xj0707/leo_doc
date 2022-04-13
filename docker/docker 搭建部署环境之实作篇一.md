### 前言

最近我们的部署环境老是出问题，一个月总要来那么一回，让我不胜其烦。思来想去还是好好解决一下这个问题。一来是让我们以后搭建环境更方便，二来做一个技术积累。废话不多说，直接上货。

> 本文只是针对云端后台使用ansible部署aws资源来搭建的环境

###  前期准备

因为小编的开发环境是windows10，所以在本机上安装docker Desktop .

Docker Desktop 是 Docker 在 Windows 10 和 macOS 操作系统上的官方安装方式，这个方法依然属于先在虚拟机中安装 Linux 然后再安装 Docker 的方法。

Docker Desktop 官方下载地址： https://hub.docker.com/editions/community/docker-ce-desktop-windows

本文默认你已安装好了Docker

### 进入正题

首先理一下思路，我们要做哪些操作？
1. 我们需要安装底层操作系统 Ubuntu-18.04 (为啥要18.04的版本呢？因为小编测试过去，其他版本会出现某些repo找不到的情况，所以我们采用18.04的版本)
2. 然后安装ansible
3. 安装aws-vault (因为我们不同环境需要切换不同凭证)
4. 安装nvm/git (因为自动化部署这些少不了)
5. 最后，我们要打包成镜像，发布到dockerhub中
6. 轮子造好了，永久使用

### 操作详解
#### 实作方案之：暴力美学
1. 启动一个容器 Ubuntu-18.04 为基础层
`docker run -dit ubuntu:18.04`
注：在使用 -d 参数时，容器启动后会进入后台
其中，-t 选项让Docker分配一个伪终端（pseudo-tty）并绑定到容器的标准输入上， -i 则让容器的标准输入保持打开。
2. 查看刚创建的容器
`docker container ls -a`

如图所示，刚创建的容器id:644
3. 进入容器
`docker exec -it 4d6 bash`
注：bash：放在镜像名后的是 命令，这里我们希望有个交互式 Shell，因此用的是 bash
4. 执行环境搭建的相关命令
```
apt -y update  # 更新源
apt -y upgrade # 更新已安装的包
apt install curl

# 配置 PPA 并安装 Ansible
apt install software-properties-common
add-apt-repository --yes --update ppa:ansible/ansible
apt install ansible

# 保存镜像
docker commit --author 'leo xiao' --message 'ubuntu:18.04 ansible' e6b ansible:v1.1

apt -y install python3.6

apt -y install awscli

apt -y install linuxbrew-wrapper


```

#### 实作方案之：多层构建
