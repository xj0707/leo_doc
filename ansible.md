# 在Ubuntu上安装Ansible
要在你的计算机上配置PPA并安装ansible,请运行以下命令：
```
$ sudo apt update
$ sudo apt install software-properties-common
$ sudo apt-add-repository --yes --update ppa:ansible/ansible
$ sudo apt install ansible
```
# 配置Ansible

# 入门
1. 调用`ansible-playbook`命令来运行Ansible命令和剧本
2. 请编辑（或创建）`/etc/ansible/hosts`并向其中添加一些远程系统
   ```
    192.0.2.50
    aserver.example.org
    bserver.example.org
   ```
3. Ansible通过SSH协议与远程计算机进行通信。
4. 确认您可以使用SSH使用相同的用户名连接到清单中的所有节点
5. 连接后，Ansible会将命令或剧本所需的模块传输到远程计算机以执行.
6. 运行您的第一个Ansible命令
`ansible all -m ping`
7. 默认情况下，Ansible使用SFTP传输文件。果要管理的机器或设备不支持SFTP，则可以在配置Ansible中切换到SCP模式。这些文件被放置在一个临时目录中并从那里执行。

