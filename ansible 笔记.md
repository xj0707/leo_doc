### 概念
Ansible默认通过 SSH 协议管理机器.
安装Ansible之后,不需要启动或运行一个后台进程,或是添加一个数据库.只要在一台电脑(可以是一台笔记本)上安装好,就可以通过这台电脑管理一组远程的机器.在远程被管理的机器上,不需要安装运行任何软件,因此升级Ansible版本不会有太多问题.
### 管理主机要求
只要机器上安装了 Python 2.6 或 Python 2.7 (windows系统不可以做控制主机),都可以运行Ansible.
### 托管节点的要求
通常我们使用 ssh 与托管节点通信，默认使用 sftp.如果 sftp 不可用，可在 ansible.cfg 配置文件中配置成 scp 的方式. 在托管节点上也需要安装 Python 2.4 或以上的版本.
### 通过apt(ubuntu)安装最新版本
配置PPA及安装ansible,执行如下命令:
```
 sudo apt update
 sudo apt install software-properties-common
 sudo apt-add-repository --yes --update ppa:ansible/ansible
 sudo apt install ansible
```
### 配置文件
Ansible中的某些设置可以通过配置文件（ansible.cfg）进行调整。
以包管理器安装Ansible，则最新`ansible.cfg`文件应存在于中`/etc/ansible`
Ansible还允许使用环境变量配置设置。如果设置了这些环境变量，它们将覆盖从配置文件加载的所有设置。
命令行中的设置将覆盖通过配置文件和环境传递的设置。
### 你的第一条命令
1. 编辑(或创建)/etc/ansible/hosts 并在其中加入一个或多个远程被控制系统.
```
192.168.1.50
aserver.example.org
```
在控制机中生成的 public SSH key 必须放在被控制系统的``authorized_keys``中.
2. 我们假定你使用SSH Key来授权.为了避免在建立SSH连接时,重复输入密码你可以这么 做.
```
ssh-agent bash
ssh-add ~/.ssh/id_rsa
```
3. 现在ping 你的所有节点.
```
ansible all -m ping
```
4. 通过编辑` /etc/ansible/ansible.cfg` or ` ~/.ansible.cfg`来,禁止交互的确认提示
```
host_key_checking = False
```
### 现在使用一些临时命令来做一些演示
临时命令如下所示：`ansible [pattern] -m [module] -a "[module options]"`

### 模板
Ansible使用Jinja2模板来启用动态表达式和访问变量。
1. 获取当前时间：`now()`
2. 提供默认值：`{{ some_variable | default(5) }}` ,如果未定义变量“ some_variable”，则Ansible将使用默认值5。你也可以添加一个`defaults/main.yml`来定义角色中变量的默认值。
3. 如果要在变量评估为false或空字符串时使用默认值，则必须将第二个参数设置为true：`{{ lookup('env', 'MY_USER') | default('admin', true) }}`
4. Ansible需要模板表达式中所有变量的值。但是，您可以将特定变量设为可选,要使变量成为可选变量，请将默认值设置为特殊变量`omit`
5. 使用`type_debug`，`dict2items`和`items2dict`过滤器来管理数据类型.
- 如果不确定变量的基础Python类型，则可以使用`type_debug`过滤器显示它。当您需要特定类型的变量时，这在调试时很有用：`{{ myvar | type_debug }}`
- 使用`dict2items`过滤器将字典转换为适合循环的项目列表：`{{ dict | dict2items }}` or  `{{ files | dict2items(key_name='file', value_name='path') }}`
- 该`dict2items`过滤器是的逆`items2dict`滤波器,使用`items2dict`过滤器将列表转换成字典，将内容映射成对：`key: value` 如：`{{ tags | items2dict }}` or `{{ tags | items2dict(key_name='fruit', value_name='color') }}`
6. 格式化数据（用时查看相关文档）:
 `{{ some_variable | to_nice_json }}`  
 `{{ some_variable | to_nice_yaml }}`
7. 合并对象和子元素 
该`subelements`滤波器产生的对象的产品和该对象的子元素值
您可以将转换后的数据`loop`用于对多个对象的同一子元素进行迭代：`loop: "{{ users | subelements('authorized') }}"`
8. 哈希字典
该`ombine`过滤器允许哈希被合并: `{{ {'a':1, 'b':2} | combine({'b':3}) }}`
9. 太多了，请参考 [相关文档](https://docs.ansible.com/ansible/latest/user_guide/playbooks_filters.html '模板变量')
### 查询
查找插件从外部资源（例如文件，数据库，键/值存储，API和其他服务）检索数据，从Ansible 2.5开始，查找被更明确地用作Jinja2表达式的一部分，输入到`loop`关键字中
### 剧本
1. 什么是持续交付？ 持续交付（CD）意味着经常向您的软件应用程序交付更新。
2. 角色：是一种将内容（任务，处理程序，模板和文件）组织到可重用组件中的方法。
3. 组变量：是应用于服务器组的变量。它们可用于模板和剧本中，以自定义行为并提供易于更改的设置和参数。它们存储在group_vars与库存相同位置的目录中。
### 剧本简介
1. Ansible Playbooks提供了可重复，可重用，简单的配置管理和多机部署系统，非常适合部署复杂的应用程序。如果您需要使用Ansible多次执行任务，请编写一本剧本并将其置于源代码控制之下。然后，您可以使用剧本推送新配置或确认远程系统的配置。
2. 剧本以YAML格式表达，且语法最少。
3. 剧本从上到下依次运行。
4. `remote_user`为每个剧本设置了一个。这是SSH连接的用户帐户。您可以在剧本，剧本或任务级别添加其他剧本关键字，以影响Ansible的行为方式。
5. 运行剧本时，Ansible返回有关连接，name所有剧本和任务的行，每台计算机上的每个任务成功还是失败以及每台计算机上的每个任务是否进行更改的信息。
6. 要运行您的剧本，请使用ansible-playbook命令：`ansible-playbook playbook.yml`
7. --verbose运行您的剧本时，请使用该标志以查看成功模块和不成功模块的详细输出。
### 小技巧
1. 大量使用空格（例如，在每个块或任务之前使用空白行）使剧本易于扫描。
2. 总是命名任务，任务名称是可选的，但非常有用。在其输出中，Ansible为您显示它运行的每个任务的名称。选择描述每个任务做什么以及原因的名称。
3. 对于许多模块，“ state”参数是可选的。不同的模块具有不同的“状态”默认设置，并且某些模块支持多个“状态”设置。显式设置“状态=存在”或“状态=不存在”可使剧本和角色更加清晰。
4. 添加评论（以“＃”开头的任何行）可以帮助其他人（将来可能也是您自己）了解游戏或任务（或变量设置）的作用，其作用方式以及原因。
5. 一个系统可以在多个组中，如果创建以该组中节点的功能命名的组，例如webservers或dbservers，则您的剧本可以基于功能来定位计算机。您可以使用组变量系统分配特定于功能的变量，并设计Ansible角色来处理特定于功能的用例。
6. 通过为每个环境使用单独的清单文件或目录，可以使生产环境与开发，测试和登台环境分开。这样，您可以使用-i选择目标对象。
### 循环
有时您想重复执行多次任务，Ansible提供了两个用于创建循环的关键字：`loop`和`with_<lookup>`。 注：尽量使用 loop
1. 遍历一个简单的列表
```
- name: Add several users
  ansible.builtin.user:
    name: "{{ item }}"
    state: present
    groups: "wheel"
  loop:
     - testuser1
     - testuser2
```
可以在变量文件或剧本的“ vars”部分中定义列表，然后在任务中引用列表的名称：`loop: "{{ somelist }}"`
2. 将条件`when:`语句与循环语句组合使用时，将为每个项目分别处理该语句。
3. 您可以将循环的输出注册为变量, `register`与循环一起使用时，放置在变量中的数据结构将包含一个results属性，该属性是模块中所有响应的列表。
4. 当遍历复杂的数据结构时，任务的控制台输出可能非常庞大。要限制显示的输出，请将该`label`指令与结合使用`loop_control：`
```
- name: Create servers
  digital_ocean:
    name: "{{ item.name }}"
    state: present
  loop:
    - name: server1
      disks: 3gb
      ram: 15Gb
      network:
        nic01: 100Gb
        nic02: 10Gb
        ...
  loop_control:
    label: "{{ item.name }}"
```
5. 要跟踪您在循环中的位置，请在中使用`index_var`指令`loop_control`
### 创建可重复使用的文件和角色
一般可重复使用的构件：变量文件、任务文件、剧本和角色
变量文件：仅包含变量
任务文件：仅包含任务
剧本：至少包含一个剧本，可能包含变量、任务和其他内容
角色：一组相关的任务、变量、默认值、处理程序、甚至模块或插件
### 重用剧本
将多个剧本合并到一个主剧本中。通过使用导入来重复使用剧本
Ansible提供两种重用剧本中文件和角色的方式：动态和静态
动态重用：`include_*`
静态重用：`import_*`
### 角色
Ansible角色具有定义的目录结构，其中包含七个主要的标准目录。每个角色中必须至少包含这些目录之一。每个目录中`main.yml`查找相关内容的文件
```
roles/
	common/
		tasks/  # 角色执行的主要任务列表
		handlers/  # 处理程序，可以在此角色内部或外部使用。
		library/  # 模块，可以在该角色中使用
		files/    # 角色部署的文件。
		templates/  # 角色部署的模板
		vars/	# 角色的其他变量
		defaults/ # 角色的默认变量
		meta/  # 角色的元数据，包括角色依赖性。
```
### 标签
如果您有大型剧本，则仅运行其特定部分而不是运行整个剧本可能会很有用，使用标签执行或跳过所选任务是一个两步过程。
`tags`关键字总是定义标签并将它们添加到任务; 它不会选择或跳过要执行的任务。运行剧本时，只能在命令行基于标签选择或跳过任务。
### 库存
使用清单的列表或列表组，同时针对基础架构中的多个受管节点或“主机”进行工作。
库存的默认位置是名为的文件`/etc/ansible/hosts`
```
mail.example.com

[webservers]
foo.example.com
bar.example.com

[dbservers]
one.example.com
two.example.com
three.example.com
```
括号中的标题是组名，用于对主机进行分类并确定您在什么时候，什么目的控制什么主机