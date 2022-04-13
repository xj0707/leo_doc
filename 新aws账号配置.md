### 手机安装mfa应用程序
- ios下载地址：[app](https://apps.apple.com/app/microsoft-authenticator/id983156458)
- 安卓下载地址：[app](https://play.google.com/store/apps/details?id=com.azure.authenticator)
### 登录aws账号
选择我的账号->点击生成mfa->用手机扫描mfa->填写手机code
### windows下 管理员下执行powershell
```

Get-ExecutionPolicy  输出 Restricted

Set-ExecutionPolicy AllSigned   输出 选择 Y

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

```
注：powershell版本需要大于3.0 ，下载[Windows6.1-KB2819745-x64-MultiPkg.msu](https://www.microsoft.com/zh-CN/download/details.aspx?id=40855)
### 安装aws-vault
` choco install aws-vault `
### 在`~/.aws/config`配置以下内容
```
[profile aum]
mfa_serial=你的mfa
region=ap-northeast-1

[profile lab]
role_arn=arn:aws:iam::662373416267:role/AskeyRoleDeveloper
source_profile=aum
mfa_serial=你的mfa

[profile dev]
role_arn=arn:aws:iam::068605911073:role/AskeyRoleDeveloper
source_profile=aum
mfa_serial=arn:aws:iam::992310820197:mfa/leo_xiao

[profile qat]
role_arn=arn:aws:iam::631751596361:role/AskeyRoleDeveloper
source_profile=aum
mfa_serial=arn:aws:iam::992310820197:mfa/leo_xiao

[profile sbx]
role_arn=arn:aws:iam::907570720989:role/AskeyRoleAdministrator
source_profile=aum
mfa_serial=arn:aws:iam::992310820197:mfa/leo_xiao

[profile dvr]
role_arn=arn:aws:iam::502341547540:role/AskeyRoleDebugger
source_profile=aum
mfa_serial=arn:aws:iam::992310820197:mfa/leo_xiao

[profile prd]
role_arn=arn:aws:iam::502188785805:role/AskeyRoleDebugger
source_profile=aum
mfa_serial=arn:aws:iam::992310820197:mfa/leo_xiao
```
### 进入aws console 生成 key 和 id
### 在bash shell 里面执行以下命令
```
aws-vault add aum  //写入生成的key和id
aws-vault exec lab //切换角色
aws iam list-account-aliases //查看角色是否切换成功

```
