# multipass

Multipass 是一个轻量虚拟机管理器，是由 Ubuntu 运营公司 Canonical 所推出的开源项目。运行环境支持 Linux、Windows、macOS。在不同的操作系统上，使用的是不同的虚拟化技术。在 Linux 上使用的是 KVM、Window 上使用 Hyper-V、macOS 中使用 HyperKit 以最小开销运行VM，支持在笔记本模拟小型云。
同时，Multipass 提供了一个命令行界面来启动和管理 Linux 实例。下载一个全新的镜像需要几秒钟的时间，并且在几分钟内就可以启动并运行 VM。

## 下载

在使用 Multipass 之前 ，首先需要安装 Multipass 工具，可以打开官网进行下载
`https://multipass.run/`
安装成功后，点击运行，即可打开 Multipass 客户端.

## 常用命令

首先，通过以下指令查看可供下载的 Ubuntu 镜像
`multipass find`

不指定则，下载最新版的 Ubuntu 镜像并运行。
`multipass launch -n vm01 -c 1 -m 1G -d 10G`

-n, --name: 名称
-c, --cpus: cpu核心数, 默认: 1
-m, --mem: 内存大小, 默认: 1G
-d, --disk: 硬盘大小, 默认: 5G

虚拟机创建完成后，可以使用 multipass list 命令进行查看虚拟机列表
`multipass list`

我们通过 exec 命令，就可以在外部操作刚刚创建的虚拟机，例如查看内部所处的目录，执行 pwd 命令
`multipass exec vm01 pwd`

通过 multipass info 命令，即可查看当前运行的虚拟机信息
`multipass info vm01`

通过 multipass shell 命令，即可进入到虚拟机内部
`multipass shell vm01`

## 虚拟机设置密码

进入虚拟机内部,首先执行下面命令，给系统设置一个 root 密码，设置好密码后，使用 su root 切换到 root 用户
设置密码
`sudo passwd`
切换 root
`su root`

## 挂载

multipass 还提供和 Docker 一样的挂载数据卷的功能，能够与外部宿主机的文件保持同步。

```shell
# 挂载格式
multipass mount 宿主机目录  实例名:虚拟机目录
```

`multipass mount /Users/moxi/hello  vm01:/hello`

如果以后不需要用到挂载了，可以使用 unmount 命令卸载
`multipass umount 容器名`

## 文件传输

除了使用上述的 mount 挂载卷的方式实现文件的交互，同时还可以通过 transfer 命令，将宿主机的文件，发送到虚拟机内部
multipass transfer 主机文件 容器名:容器目录
`multipass transfer hello.txt vm01:/home/ubuntu/`

## 实例的操作

使用下面的命令，可以开启、停止、删除和释放实例

```shell
# 启动实例
multipass start vm01
# 停止实例
multipass stop vm01
# 删除实例（删除后，还会存在）
multipass delete vm01
# 释放实例（彻底删除）
multipass purge vm01
```

## 初始化配置

为了保持开发环境和线上环境一致性 同时节省部署时间 multipass 给我们提供了 --cloud-init 选项进行容器启动初始化配置:
`multipass launch --name ubuntu --cloud-init config.yaml`
上面 config.yaml 则是容器的初始化配置文件，例如，我们想在初始化容器的时候，自动下载安装 Node.js，内容如下：

``` shell
#cloud-config
runcmd:
  - curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
  - sudo apt-get install -y nodejs
```

`runcmd` 可以指定容器 首次启动 时运行的命令
凡是用户自定义的cloud-init的配置文件,必须以#cloud-config开头，这是cloud-init识别它的方式

yaml 配置文件可以参考下面的文章
`https://cloudinit.readthedocs.io/en/latest/topics/examples.html?highlight=lock-passwd#including-users-and-groups`

## 其他

更多关于 multipass 的高阶的技巧，欢迎访问 multipass 官方文档
`https://multipass.run/docs/`

## 用multipass 搭建ansible 访问aws服务，使用aws-vault的方法

```shell
// 最好使用18.04版本，其他版本镜像源有问题！！！需要网上单独找解决方法。
multipass launch --name 虚拟名字 18.04（这里指定了版本）  生成一个指定的镜像
ex: multipass launch --name k3s-master 18.04 --cpus 1 --mem 1024M 

sudo apt -y update
sudo apt -y upgrade
sudo apt -y install python3.6
sudo apt -y install awscli
sudo apt -y install linuxbrew-wrapper
brew install aws-vault
sudo apt -y install software-properties-common
sudo apt-add-repository -y --update ppa:ansible/ansible
sudo apt -y install ansible
sudo apt -y install python-pip
pip install botocore
sudo apt -y install python3-pip
pip3 install boto3
pip3 install boto
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
logout & login again
nvm install --lts （如果找不到nvm 则执行：source ~/.nvm/nvm.sh）
sudo apt -y install openjdk-8-jre-headless
sudo apt -y install maven
# this command run at host command line
multipass copy-files ~/.aws/config ub-ansible:/home/ubuntu/.aws/config
# this command run at host command line
multipass mount e:/askeycloud leo:/home/ubuntu/askeycloud
multipass mount /c/Users/Skysoft/.ssh ub-ansible:/home/ubuntu/.ssh
alias ap='ansible-playbook'
alias av='~/.linuxbrew/Cellar/aws-vault/5.4.4/bin/aws-vault'
alias awswho='aws sts get-caller-identity; aws iam list-account-aliases'

如果不支持mount: 
输入以下命令：multipass set local.privileged-mounts=true
然后在实例里面安装 
sudo apt -y install sshfs
异常情况：

// 出现GPG error: http://ppa.launchpad.net/deadsnakes/ppa/ubuntu focal InRelease: The following signatures couldn't be verified because the public key is not available: NO_PUBKEY BA6932366A755776
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys BA6932366A755776
//如果出现aws-vault: error: Specified keyring backend not available, try --help
将以下内容添加到您的~/.bashrc
export AWS_VAULT_BACKEND="file"
// 出现importerror: cannot import name 'docevents' 这个是awscli版本问题
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
// 出现aws-vault 命令找不到
vim ~/.bashrc
export PATH=$PATH:/home/ubuntu/.linuxbrew/Cellar/aws-vault/6.2.0/bin
source ~/.bashrc
// mount 出现以下错
Please install the 'multipass-sshfs' snap manually inside the instance.
执行命令：sudo apt install sshfs
--disk 30G
// 其他异常情况
1. sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt -y update
sudo apt install python3.6
2. sudo apt-get install software-properties-common
sudo apt-add-repository universe
sudo apt-get update
sudo apt-get install python-pip
3. /usr/bin/env: ‘bash\r’: No such file or directory
sudo apt install nodejs npm
4. ImportError: cannot import name 'docevents' from 'botocore.docs.bcdoc
pip3 install --upgrade awscli

```
