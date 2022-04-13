### 前言
> 上一篇了解一些基本概念，本篇主要针对SDK中常用的方法做记录。

### 先决条件
NPM  
`npm install --save twilio-video@2.8.0`  

CDN  
`<script src="//sdk.twilio.com/js/video/releases/2.8.0/twilio-video.min.js"></script>`  

在 `Twilio` 控制台创建 API 密钥  (https://www.twilio.com/console/video/project/api-keys)。
密钥是 访问 Twilio API 的凭据。

### JavaScript SDK
>可编程视频 REST API 允许您通过 HTTP 请求从后端服务器控制视频应用程序。您可以创建和完成聊天室、查询其状态、检索录音文件、为状态回调配置 webhook 等。

所有可编程视频 REST API 资源都使用以下基本 URL:`https://video.twilio.com`

可使用api控制的有：
- `Rooms`  代表应用程序中用户之间的多方通信会话，用户可以在其中共享和接收实时音频和视频轨道
- `Particpants`  参与者是房间中的一个用户会话
- `PublishedTrack`  已发布的曲目代表参与者在房间中共享的媒体
- `Recordings`  录音代表在房间中共享的音频、视频或屏幕共享轨道的录制媒体
- `Compositions`  组合表示由一组 Group Room 视频记录混合产生的可播放媒体文件

#### `Rooms`
属性：
- sid: 用于标识 Room 资源的唯一字符串。<RM>
- status: 房间的状态。可以是：in-progress，failed，或completed。
- dateCreated: 创建资源时的 GMT 日期和时间(以ISO 8601格式)
- dateUpdated: 上次更新资源时的 GMT 日期和时间，以ISO 8601格式指定。
- accountSid: 创建房间资源的帐户的 SID 。
- uniqueName: 唯一标识资源的应用程序定义的字符串,对于in-progress房间是唯一的
- statusCallback: 我们使用 调用的 URLstatus_callback_method将每个房间事件的状态信息发送到您的应用程序。
- statusCallbackMethod: 我们用来调用的 HTTP 方法status_callback。可以是POST或GET并且默认为POST。
- endTime: 房间的 UTC 结束时间，采用ISO 8601格式。
- duration: 房间的持续时间（以秒为单位）。
- type: 房间的类型。可以是：go，peer-to-peer，group-small，或group。默认值为group
- maxParticipants: 房间中允许的最大并发参与者数。
- maxConcurrentPublishedTracks: 许在房间内同时发布所有参与者组合的最大已发布音频、视频和数据轨道数。如果设置为 0，则表示不受约束。
- recordParticipantsOnConnect: 是否在参与者连接时开始录制。此功能在peer-to-peer客房内不可用。
- videoCodecs: 在房间中发布曲目时支持的视频编解码器数组。可以是：VP8和H264。 此功能不适用于peer-to-peer客房
- mediaRegion: Group Rooms 中媒体服务器的区域。可以是：可用的媒体区域之一。此功能在peer-to-peer客房内不可用。
- url: 资源的绝对 URL。
- links: 相关资源的 URL

```
const client = require('twilio')(accountSid, authToken);

# 创建一个名为DailyStandup的房间
client.video.rooms
            .create({
               recordParticipantsOnConnect: true,
               statusCallback: 'http://example.org',
               type: 'group',
               uniqueName: 'DailyStandup'
             })
            .then(room => console.log(room.sid));
# 注：通过 REST API 创建的房间存在五分钟，以允许第一个参与者连接。如果五分钟内没有参与者加入，房间将超时，必须创建一个新房间。

# 完成一个房间
client.video.rooms('RMXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
            .update({status: 'completed'})
            .then(room => console.log(room.uniqueName));

# 检索in-progress的room可以使用uniqueName
client.video.rooms('DailyStandup')
            .fetch()
            .then(room => console.log(room.uniqueName));

# 通过roomSid来检索Room
client.video.rooms('RMXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
            .fetch()
            .then(room => console.log(room.uniqueName));

# 检索room列表
client.video.rooms
            .list({status: 'completed', uniqueName: 'DailyStandup', limit: 20})
            .then(rooms => rooms.forEach(r => console.log(r.sid)));
```


#### `Particpants`
属性：
- Sid: 用于标识 RoomParticipant 资源的唯一字符串 <PA>
- roomSid: 参与者房间的 SID。
- accountSid: 创建 RoomParticipant 资源的帐户的 SID 。
- status: 参与者的状态。可以是：connected或disconnected。
- identity: 应用程序定义的字符串，用于唯一标识房间内资源的用户
- dateCreated: 以ISO 8601格式指定创建资源时的 GMT 日期和时间
- dateUpdated: 上次更新资源时的 GMT 日期和时间，以ISO 8601格式指定。
- startTime: 参与者以ISO 8601格式连接到房间的时间。
- endTime: 参与者以ISO 8601格式与房间断开连接的时间。
- duration: 参与者的持续时间（以秒为单位）connected。仅在参与者为 之后填充disconnected。
- url: 资源的绝对 URL。
- links: 相关资源的 URL。

```
var apiKeySid = 'SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
var apiKeySecret = 'your_api_key_secret';
var accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
var Twilio = require('twilio');
var client = new Twilio(apiKeySid, apiKeySecret, {accountSid: accountSid});
# 根据 identity 从房间检索参与者
client.video.rooms('DailyStandup')
  .participants.get('Alice')
  .fetch()
  .then(participant => {
    console.log(participant.duration);
  });
# 将参与者的状态更新为disconnected以从房间中删除参与者
client.video.rooms('DailyStandup')
  .participants('Alice')
  .update({status: 'disconnected'})
  .then(participant => {
    console.log(participant.status);
  });
# 检索连接的参与者列表
client.video.rooms('DailyStandup').participants
  .each({status: 'connected'}, (participant) => {
    console.log(participant.sid);
  });
```


#### `PublishedTrack`
> Published Track 资源是 Participant 实例资源的子资源。它代表参与者当前发布到房间的曲目。

属性:
- sid: 我们为标识 RoomParticipantPublishedTrack 资源而创建的唯一字符串。<MT>
- participantSid: 具有已发布曲目的参与者资源的 SID。
- roomSid: 发布曲目的房间资源的 SID。
- name: 曲目名称。不得超过 128 个字符，并且在参与者已发布的曲目中是独一无二的。
- dateCreated: 以ISO 8601格式指定创建资源时的 GMT 日期和时间。
- dateUpdated: 上次更新资源时的 GMT 日期和时间，以ISO 8601格式指定.
- enabled: 是否启用轨道。
- kind: 轨道类型。可以是：audio,video或data。
- url: 资源的绝对 URL。

```
var apiKeySid = 'SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
var apiKeySecret = 'your_api_key_secret';
var accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
var Twilio = require('twilio');
var client = new Twilio(apiKeySid, apiKeySecret, {accountSid: accountSid});
# 检索参与者发布的曲目
client.video.rooms('DailyStandup')
  .participants.get('Alice')
  .publishedTracks.list()
  .then(publishedTracks => {
    publishedTracks.forEach(publishedTrack => console.log(publishedTrack.sid))
  });
```

#### Track Subscription
> 默认情况下，Group Rooms 使用“全部订阅”模型。因此，每个参与者都订阅了其他参与者发布到房间的所有曲目。

#### `Recording`
> 要在组房间中打开录音，请在创建房间时将该RecordParticipantsOnConnect 属性设置为true。

属性:
- accountSid: 创建录制资源的帐户的 SID 。<AC>
- status: 录音状态。可以是：processing，completed，或deleted。processing表示正在录制中；completed表示录音已被捕获，现在可供下载。deleted表示录制媒体已从系统中删除，但其元数据仍然可用。
- dateCreated: 以ISO 8601格式指定创建资源时的 GMT 日期和时间。
- sid: 我们创建的用于标识 Recording 资源的唯一字符串。<RT>
- sourceSid: 录制源的 SID。对于房间录音，此值为track_sid.
- size: 记录轨道的大小，以字节为单位。
- url: 资源的绝对 URL。
- type: 录音的媒体类型。可以是：audio或video。
- duration: 记录的持续时间（以秒为单位）四舍五入到最接近的秒。亚秒轨道具有Duration1 秒的属性.
- containerFormat: 记录的文件格式。可以是：mka或mkv。视频室录音以Matroska 容器格式捕获，mka用于音频文件和mkv视频文件。
- codec: 用于对轨道进行编码的编解码器。可以是：VP8，H264，OPUS，和PCMU。
- groupingSids: 与录音相关的 SID 列表。包括room_sid和participant_sid。
- trackName: 为录音的源轨道指定的名称。如果未给出名称，source_sid则使用 。
- offset: 从任意时间点（所有组房间共有）到此轨道的源房间开始的时刻之间经过的时间（以毫秒为单位）。该信息为属于同一房间的录音提供了一种同步机制。
- links: 相关资源的 URL。

```
const client = require('twilio')(accountSid, authToken);
# 检索录音
client.video.recordings('RTXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
            .fetch()
            .then(recording => console.log(recording.trackName));
# 删除录音
client.video.recordings('RTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX').remove();
# 获取删除录音的列表
client.video.recordings.list({status: 'deleted', limit: 20})
            .then(recordings => recordings.forEach(r => console.log(r.sid)));
# 获取房间的所有录音
client.video.recordings
            .list({
               groupingSid: ['RMXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
               limit: 20
             })
            .then(recordings => recordings.forEach(r => console.log(r.sid)));
# 获取给定room的所有录音
client.video.rooms('RMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
            .recordings
            .list({limit: 20})
            .then(recordings => recordings.forEach(r => console.log(r.sid)));
```
```
# 检索录音的媒体
const Twilio = require("twilio");
const apiKeySid = "SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const apiKeySecret = "your_api_key_secret";
const accountSid = "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const client = new Twilio(apiKeySid, apiKeySecret, { accountSid: accountSid });
const recordingSid = "RTXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
const uri = `https://video.twilio.com/v1/Recordings/${recordingSid}/Media`;
client.request({ method: "GET", uri: uri }).then(response => {
  const mediaLocation = response.data.redirect_to;
  request.get(mediaLocation, (err, res, media) => {
    console.log(media);
  });
});
```

### 其他可能会用到方法
```
# 连接到房间
const { connect } = require('twilio-video');
connect('$TOKEN', { name:'my-new-room' }).then(room => {
  console.log(`Successfully joined a Room: ${room}`);
  room.on('participantConnected', participant => {
    console.log(`A remote Participant connected: ${participant}`);
  });
}, error => {
  console.error(`Unable to connect to Room: ${error.message}`);
});

```

使用 Twilio 的createLocalTracks API 来访问用户的麦克风和摄像头。
```
const { connect, createLocalTracks } = require('twilio-video');

// Option 1
createLocalTracks({
  audio: true,
  video: { width: 640 }
}).then(localTracks => {
  return connect('$TOKEN', {
    name: 'my-room-name',
    tracks: localTracks
  });
}).then(room => {
  console.log(`Connected to Room: ${room.name}`);
});

// Option 2
connect('$TOKEN', {
  audio: true,
  name: 'my-room-name',
  video: { width: 640 }
}).then(room => {
  console.log(`Connected to Room: ${room.name}`);
});
```
当您加入会议室时，参与者可能已经在场。您可以使用 Room 的participants集合来检查现有参与者：
```
// Log your Client's LocalParticipant in the Room
const localParticipant = room.localParticipant;
console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

// Log any Participants already connected to the Room
room.participants.forEach(participant => {
  console.log(`Participant "${participant.identity}" is connected to the Room`);
});

// Log new Participants as they connect to the Room
room.once('participantConnected', participant => {
  console.log(`Participant "${participant.identity}" has connected to the Room`);
});

// Log Participants as they disconnect from the Room
room.once('participantDisconnected', participant => {
  console.log(`Participant "${participant.identity}" has disconnected from the Room`);
});
```
要查看远程参与者发送的视频轨道，我们需要将它们渲染到屏幕上,我们可以通过迭代来处理前者`tracks`
已经在 Room 中的 RemoteParticipant，我们可以通过遍历 Room 的 来附加他们的 RemoteTracks participants：
```
room.participants.forEach(participant => {
  participant.tracks.forEach(publication => {
    if (publication.track) {
      document.getElementById('remote-media-div').appendChild(publication.track.attach());
    }
  });

 participant.on('trackSubscribed', track => {
    document.getElementById('remote-media-div').appendChild(track.attach());
  });
});
```
将本地媒体静音,可以通过调用 disable 方法将 LocalAudioTracks（麦克风）和 LocalVideoTracks（摄像头）静音，如下所示：
```
room.localParticipant.audioTracks.forEach(publication => {
  publication.track.disable();
});

room.localParticipant.videoTracks.forEach(publication => {
  publication.track.disable();
});
```
通过调用 enable 方法取消 LocalAudioTracks 和 LocalVideoTracks 的静音，如下所示：
```
room.localParticipant.audioTracks.forEach(publication => {
  publication.track.enable();
});

room.localParticipant.videoTracks.forEach(publication => {
  publication.track.enable();
});
```
断开当前正在参与的房间的连接。其他参与者将收到“participantDisconnected”事件：
```
room.on('disconnected', room => {
  // Detach the local media elements
  room.localParticipant.tracks.forEach(publication => {
    const attachedElements = publication.track.detach();
    attachedElements.forEach(element => element.remove());
  });
});

// To disconnect from a Room
room.disconnect();
```
