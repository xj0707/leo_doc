### 概述
Twilio Programmable Video 是一个云平台，允许开发人员将视频和音频聊天添加到 Web、Android 和 iOS 应用程序。该平台提供 REST API、SDK 和帮助工具，使捕获、分发、记录和呈现高质量音频、视频和屏幕共享变得简单。  
创建 Twilio 视频应用程序，您需要三个要素：
1. 您的 Twilio 帐户：开设 Twilio 帐户是免费的。拥有 Twilio 帐户后，您将获得能够使用所有 Twilio 服务的适当凭据。
2. 您的服务器应用程序：服务器应用程序在您的应用程序服务器上运行。它使用您的 Twilio 帐户凭据授予对 Twilio Video 服务的访问权限。服务器应用程序还使用 Twilio Video REST API 来管理 RTC（实时通信）会话。您可以在以下平台下载 Twilio Video REST API 的帮助程序库：Node.js、Java、C#、Python、PHP和Ruby。
3. 您的客户端应用程序：客户端应用程序在 Web 或移动客户端上执行。它使用 Twilio 客户端 SDK 来捕获、发布、订阅和呈现 RTC 信息。Twilio Video SDK 可用于以下客户端平台：JavaScript、Android和iOS。

### twilio 视频工作原理
1. 创建房间
Twilio 使用 Rooms REST API 创建一个房间（应用程序服务器发起请求创建room--->twilio create room ----> twilio告诉应用的room sid）
2. 客服端获取访问令牌
客服端向应用程序服务器发起请求访问令牌 --->应用服务器使用twilio的sdk生成访问令牌--->返回客服端
3. 客服端连接房间
客服端1使用twilio的sdk连接room--->twilio服务器验证成功进入room
客服端2使用twilio的sdk连接room--->twilio服务器验证成功进入room
客服端3使用twilio的sdk连接room--->twilio服务器验证成功进入room
4. 媒体发布和订阅
房间的参与者（Room Participant）向 Room 发布音频、视频和数据轨道 如：客户端 1 发布名为 T1 的 Track。
其余房间参与者会收到此 Track 出版物的通知，并且可以订阅 T1。在这种情况下，客户端 2 订阅了 T1。

### 基本概念
`Room`: 代表实时音频、数据、视频和/或屏幕共享会话，并且是可编程视频应用程序的基本构建块。  
`Peer-to-peer Room`:媒体直接在参与者之间流动。在网状拓扑中最多支持 10 个参与者。  
`Group Room`:媒体通过 Twilio 的媒体服务器进行路由。最多支持 50 名参与者.  
`Participants`:代表连接到 Room 并相互共享音频、数据和/或视频媒体的客户端应用程序。  
`Tracks`: 代表在房间内共享的单个音频、数据和视频媒体流。
`LocalTracks`: 代表从本地客户端的媒体源（例如，麦克风和摄像头）捕获的音频、数据和视频。  
`RemoteTracks`: 代表连接到房间的其他参与者的音频、数据和视频轨道。  

### room
房间的概念是 Twilio 可编程视频的核心。直观地说，房间代表最终用户交流的虚拟空间。从技术上讲，Room 是一种计算资源，它通过一组 API 向客户端应用程序提供实时通信 (RTC) 服务。  
视频室基于发布/订阅模型。这意味着参与者可以将媒体曲目发布到房间。其余的参与者然后可以订阅这些曲目以开始接收媒体信息。  
Twilio Programmable Video 公开了四种具有不同功能的房间:WebRTC Go Rooms, P2P Rooms (Peer-to-Peer ), Group Rooms, and Small Group Rooms1.

在 Twilio 中，房间由 SID 标识：一个字符串，用于唯一标识 Twilio 中的房间。Room SID 始终以字符开头，RM如下所示：RMdba2b037253f3a9a81a591681e88ce96.

`Go Room` 可用于一对一视频通话。参与者的分钟数是免费的，包括每月 25 GB 的 TURN 服务器使用量。Go Room 使用点对点拓扑结构，类似于 P2P 房间，但 Go Room 的最大参与者数为 2。每个帐户一次最多可以有 100 个并发参与者，例如 50 2 人的房间。  
`P2P Rooms` 在 P2P 房间中，参与者直接交换媒体.  
`Group Rooms` 参与者通过 Twilio 交换媒体.

#### REST API 房间 和 临时房间  

#### 使用 REST API 创建的房间符合以下要求：
- 首次加入超时：第一个参与者必须在创建房间后 5 分钟内加入。否则房间会被破坏。
- 最后离开超时：房间在最后一位参与者离开后 5 分钟被销毁。
- 最长参与者持续时间：参与者最多可以连接到房间 4 小时。在那之后，参与者断开连接。
- 最大房间持续时间：一个房间可以从创建时间起最多存在 24 小时。在那之后，房间被破坏，所有参与者都断开连接。  

#### 临时房间  
在第一个参与者连接时即时创建房间。当一个房间以这种方式创建时，我们说它是一个临时房间。这是创建房间的推荐方式，因为临时房间允许您在短时间内创建多个房间，并且它们允许您创建房间而无需进行 REST API 调用。  

为了使用临时房间，开发人员必须按照以下简单步骤在Twilio 控制台房间设置中启用“客户端房间创建” ：
https://www.twilio.com/console/video/configure 配置如下：  
- 将 STATUS CALLBACK URL 设置为应接收状态回调的 URL（可以留空）。  
- 将 ROOM TYPE 设置为要创建的房间类型：（Go对于 WebRTC Go 房间）、Peer-to-peer（对于 P2P 房间）或Group（对于组房间）  
- 将 CLIENT-SIDE ROOM CREATION 设置为ENABLED。  
- 按保存按钮。

临时房间符合以下特性：
- 第一次加入超时：没有任何，因为房间只是在第一个参与者连接时。
- 最后离开超时：在最后一个参与者离开后，房间被销毁。这里没有等待时间。
- 最长参与者持续时间：参与者最多可以连接到房间 4 小时。在那之后，参与者断开连接。
- 最大房间持续时间：一个房间可以从创建时间起最多存在 24 小时。在那之后，房间被摧毁，所有参与者都断开连接。

### 参与者
Participant 代表连接到 Room 并且可以使用 Room 的通信功能的客户端（即最终用户）。在给定的房间中可以有零个（即空房间）或多个参与者。一个参与者只能连接到一个房间。

在Twilio，参与者唯一地由一个SID标识与PA像下面的前缀：PA734b33d8bde2a3b3c7720964c87961c9。

### Track
Track 是一个字节流，其中包含由多媒体源（如麦克风或相机）生成的数据。Twilio Rooms 基于发布/订阅模型。这意味着参与者可以将媒体曲目发布到房间。然后其余的参与者可以订阅这些曲目并开始接收媒体信息。

在Twilio，轨道被唯一地标识由与一个SIDMT像下面的前缀：MT6e87a66bd033cdced4efe1267c595a16。
Track 的三种子类型：
- AudioTrack：它表示由音频源（如麦克风）生成的字节流。
- VideoTrack：它表示由视频源（例如网络摄像头或屏幕）生成的字节流。
- DataTrack：它表示由应用程序生成的字节（或字符）流。换句话说，开发人员可以使用 DataTrack 以极低的延迟在参与者之间传输任意数据。请注意，参与者发布的所有轨道共享相同的底层传输。因此，Participant 发布的DataTrack 字节的延迟属性应该与Participant 发布的音频和视频信息的延迟属性相同。

### SubscribeRule 
SubscribeRule 是指定参与者应订阅的轨道的规范。
TrackPublication 表示从参与者到房间的媒体轨道的通信。一个 Participant 可以有零个或多个 TrackPublications。

### localParticipant
它是“这个”客户端（即运行代码的客户端）上的参与者。LocalParticipant 可以访问客户端硬件资源并管理客户端关于房间的状态和偏好。开发人员可以从 Room 实例获取对 LocalParticipant 的引用，如下代码所示：
```
localParticipant = room.localParticipant
console.log('The LocalParticipant identity is ${localparticipant.identity}')
console.log('The LocalParticipant SID is ${localParticipant.sid}')
```
### RemoteParticipant 
它代表“其余”客户的参与者。RemoteParticipant 对象可以被视为代表“这个”客户端上的远程客户端状态和功能的存根。  
RemoteParticipants 可以从 Room 获取，如下面的代码所示：
```
//List RemoteParticipants connected to the Room
room.participants.forEach(remoteParticipant => {
  console.log('RemoteParticipant ${remoteParticipant.identity} is connected')
  console.log('RemoteParticipant SID is ${remoteParticipant.sid}')
});

//Get notified when a RemoteParticipant connects to the Room
room.on('participantConnected', remoteParticipant => {
  console.log('RemoteParticipant ${remoteParticipant.identity} just connected')
  console.log('RemoteParticipant SID is ${remoteParticipant.sid}')
});
```
