## 概念 
API Gateway WebSocket API 是双向的。客户端可以向服务发送消息，服务可以独立向客户端发送消息。WebSocket API 通常用于聊天应用程序、协作平台、多人游戏和金融交易平台等实时应用程序。
## 路由
在 WebSocket API 中，传入的 JSON 消息将根据您配置的路由定向到后端集成。（非 JSON 消息将定向到您配置的 $default 路由。）
可以使用三个预定义路由：$connect、$disconnect 和 $default。此外，您还可以创建自定义路由。
## $connect
客户端应用程序通过发送 WebSocket 升级请求连接到 WebSocket API。如果请求成功，则在建立连接时会执行 $connect 路由
由于 WebSocket 连接是有状态连接，因此您只能在 $connect 路由上配置授权。AuthN/AuthZ 仅在连接时执行。
在执行完与 $connect 路由关联的集成之前，升级请求处于待处理状态，将不会建立实际连接。如果 $connect 请求失败（例如，由于 AuthN/AuthZ 失败或集成失败），则不会建立连接。
## $disconnect
在连接关闭后，会执行 $disconnect 路由。
连接可以由服务器或客户端关闭。由于连接在执行时已经关闭，因此 $disconnect 是最适合的事件。
## $default
只有 JSON 消息可以根据消息内容路由到特定的集成。非 JSON 消息通过 $default 路由传递到后端。	
您可以配置 API Gateway，使其在继续集成请求之前对路由请求执行验证。如果验证失败，API Gateway 会在不调用后端的情况下使请求失败，向客户端发送类似于以下内容的 "Bad request body" 网关响应，这样可以减少对后端的不必要调用，并让您专注于 API 的其他要求。
您还可以为 API 的路由定义路由响应，以启用双向通信。路由响应描述了在完成特定路由的集成后将向客户端发送的数据。例如，如果您希望客户端向后端发送消息而不收到响应（单向通信），则无需为路由定义响应。但是，如果您不提供路由响应，API Gateway 将不会向您的客户端发送有关您的集成结果的任何信息。
## 后端服务向连接的客户端发送数据
- 集成可以发送响应，该响应通过您定义的路由响应返回到客户端。
- 您可以使用 @connections API 发送 POST 请求

## 其他
如果服务确定仅当客户端提供有效的 API 键时给定的请求才应继续，则会求解此表达式。
目前，仅支持的两个值是 $request.header.x-api-key 和 $context.authorizer.usageIdentifierKey。