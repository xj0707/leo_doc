模板是一个 JSON 或 YAML 文本文件，其中包含有关您希望在堆栈中创建的 AWS 资源的配置信息
示例模板包含六个顶级部分：AWSTemplateFormatVersion、Description、Parameters、Mappings、Resources 和 Outputs；但只有 Resources 部分是必需的
Resources 部分包含要使用该模板创建的 AWS 资源的定义。每项资源将分别列明，并指定创建此特定资源所需的属性。
模板是对组建堆栈的 AWS 资源的声明。模板将存储为文本文件，其格式符合 JavaScript 对象表示法 (JSON) 或 YAML 标准。鉴于只是文本文件，您可以在任何文本编辑器中创建编辑它们
让我们先从最基础的模板开始，该模板只包含一个单一资源声明的资源对象。
Resources 对象包含一系列资源对象。
一个资源必须有一个 Type 属性，该属性规定了您要创建 AWS 资源的类别
以下模板声明了一个名字为 HelloBucket 的 AWS::S3::Bucket: 类型的单一资源。
Resources:
  HelloBucket:
    Type: AWS::S3::Bucket

资源声明使用Properties属性来指定用于创建资源的信息。
例如，AWS::S3::Bucket 资源具有两个属性，即 AccessControl 和 WebsiteConfiguration。WebsiteConfiguration 属性有 IndexDocument 和 ErrorDocument 两个子属性。以下模板将展示我们的具有附加属性的原有存储桶资源。
Resources:
  HelloBucket:
    Type: AWS::S3::Bucket
    Properties:
      AccessControl: PublicRead
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: error.html

CloudFormation 具有一些内部函数，可用于引用其他资源及其属性。您可以使用 Ref 函数引用资源的标识属性。通常，这是资源的实体名称
以下模板包含一个 AWS::EC2::Instance 资源。该资源的 SecurityGroups 属性调用了 Ref 函数，以便能参阅 AWS::EC2::SecurityGroup 资源，即 InstanceSecurityGroup。
Resources:
  Ec2Instance:
    Type: 'AWS::EC2::Instance'
    Properties:
      SecurityGroups:
        - !Ref InstanceSecurityGroup
      KeyName: mykey
      ImageId: ''
  InstanceSecurityGroup:
    Type: 'AWS::EC2::SecurityGroup'
    Properties:
      GroupDescription: Enable SSH access via port 22
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '22'
          ToPort: '22'
          CidrIp: 0.0.0.0/0

注：函数使用都是前面使用 !

TODO: 可以抽空看看 https://docs.aws.amazon.com/zh_cn/AWSCloudFormation/latest/UserGuide/continuous-delivery-codepipeline.html