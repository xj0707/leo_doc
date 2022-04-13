ffmpeg可以对我们常见的许多的多媒体格式的数据进行封装，解封转，编码，解码。其实一句话总结就是ffmpeg对多媒体数据有强大处理能力。
下面的命令查看 FFmpeg 支持的容器
`ffmpeg -formats`
下面的命令可以查看 FFmpeg 支持的编码格式，视频编码和音频编码都在内
`ffmpeg -codecs`
FFmpeg 内置的视频编码器
        libx264：最流行的开源 H.264 编码器
        NVENC：基于 NVIDIA GPU 的 H.264 编码器
        libx265：开源的 HEVC 编码器
        libvpx：谷歌的 VP8 和 VP9 编码器
        libaom：AV1 编码器
音频编码器如下
        libfdk-aac
        aac
下面的命令可以查看 FFmpeg 已安装的编码器
`ffmpeg -encoders`
FFmpeg 的命令行参数非常多，可以分成五个部分
`ffmpeg {1} {2} -i {3} {4} {5}`
上面命令中，五个部分的参数依次如下:
        1. 全局参数
        2. 输入文件参数
        3. 输入文件
        4. 输出文件参数
        5. 输出文件
下面是一个例子:
ffmpeg \
-y \ # 全局参数
-c:a libfdk_aac -c:v libx264 \ # 输入文件参数
-i input.mp4 \ # 输入文件
-c:v libvpx-vp9 -c:a libvorbis \ # 输出文件参数
output.webm # 输出文件
上面的命令将 mp4 文件转成 webm 文件，这两个都是容器格式。输入的 mp4 文件的音频编码格式是 aac，视频编码格式是 H.264；输出的 webm 文件的视频编码格式是 VP9，音频格式是 Vorbis。
如果不指明编码格式，FFmpeg 会自己判断输入文件的编码。因此，上面的命令可以简单写成下面的样子
`ffmpeg -i input.avi output.mp4`
FFmpeg 常用的命令行参数如下
        -c：指定编码器
        -c copy：直接复制，不经过重新编码（这样比较快）
        -c:v：指定视频编码器
        -c:a：指定音频编码器
        -i：指定输入文件
        -an：去除音频流
        -vn： 去除视频流
        -preset：指定输出的视频质量，会影响文件的生成速度，有以下几个可用的值 ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow。
        -y：不经过确认，输出时直接覆盖同名文件。

其他例子
`ffmpeg -s 0 -i input.mp4 -t 10 output.mp4`
这段命令将截取输入视频 `input.mp4` 从0秒开始到第10秒之间的片段，并保存的 `output.mp4` 文件。
常见用法：
1. 查看视频文件的元信息，比如编码格式和比特率，可以只使用-i参数
`ffmpeg -i input.mp4`
上面命令会输出很多冗余信息，加上-hide_banner参数，可以只显示元信息
`ffmpeg -i input.mp4 -hide_banner`
2. 转换编码格式,比如转成 H.264 编码，一般使用编码器libx264，所以只需指定输出文件的视频编码器即可
`ffmpeg -i [input.file] -c:v libx264 output.mp4`
3. 转换封装格式，下面是 mp4 转 webm 的写法
`ffmpeg -i input.mp4 -c copy output.webm`
上面例子中，只是转一下容器，内部的编码格式不变，所以使用-c copy指定直接拷贝，不经过转码，这样比较快。
4. 调整码率
调整码率（transrating）指的是，改变编码的比特率，一般用来将视频文件的体积变小。下面的例子指定码率最小为964K，最大为3856K，缓冲区大小为 2000K。
```
ffmpeg \
-i input.mp4 \
-minrate 964K -maxrate 3856K -bufsize 2000K \
output.mp4
```
5. 改变分辨率,从 1080p 转为 480p 
```
ffmpeg \
-i input.mp4 \
-vf scale=480:-1 \
output.mp4
```
6. 提取音频
```
ffmpeg \
-i input.mp4 \
-vn -c:a copy \
output.aac
```
上面例子中，-vn表示去掉视频，-c:a copy表示不改变音频编码，直接拷贝。
7. 添加音轨，将外部音频加入视频，比如添加背景音乐或旁白。
```
ffmpeg \
-i input.aac -i input.mp4 \
output.mp4
```
上面例子中，有音频和视频两个输入文件，FFmpeg 会将它们合成为一个文件
8. 截图，从指定时间开始,连续对1秒钟的视频进行截图
```
ffmpeg \
-y \
-i input.mp4 \
-ss 00:01:24 -t 00:00:01 \
output_%3d.jpg
```
如果只需要截一张图，可以指定只截取一帧
```
ffmpeg \
-ss 01:23:45 \
-i input \
-vframes 1 -q:v 2 \
output.jpg
```
上面例子中，-vframes 1指定只截取一帧，-q:v 2表示输出的图片质量，一般是1到5之间（1 为质量最高）
9. 裁剪,，截取原始视频里面的一个片段，输出为一个新视频。可以指定开始时间（start）和持续时间（duration），也可以指定结束时间（end）。
```
ffmpeg -ss [start] -i [input] -t [duration] -c copy [output]
ffmpeg -ss [start] -i [input] -to [end] -c copy [output]
ex:
ffmpeg -ss 00:01:50 -i [input] -t 10.5 -c copy [output]
ffmpeg -ss 2.5 -i [input] -to 10 -c copy [output]
```
10. 为音频添加封面,有些视频网站只允许上传视频文件。如果要上传音频文件，必须为音频添加封面，将其转为视频，然后上传
```
ffmpeg \
-loop 1 \
-i cover.jpg -i input.mp3 \
-c:v libx264 -c:a aac -b:a 192k -shortest \
output.mp4
```
上面命令中，有两个输入文件，一个是封面图片cover.jpg，另一个是音频文件input.mp3。-loop 1参数表示图片无限循环，-shortest参数表示音频文件结束，输出视频就结束。

**node-fluent-ffmpeg是一个node上可用的ffmpeg，使用前必须先安装了ffmpeg。**

码率和帧率是视频文件的最重要的基本特征，对于他们的特有设置会决定视频质量
帧率：帧率也叫帧频率，帧率是视频文件中每一秒的帧数，肉眼想看到连续移动图像至少需要15帧。
码率：比特率(也叫码率，数据率)是一个确定整体视频/音频质量的参数，秒为单位处理的字节数，码率和视频质量成正比，在视频文件中中比特率用bps来表达。
设置帧率
1、用 -r 参数设置帧率
ffmpeg –i input.mp4 –r fps output.mp4
2、用fps filter设置帧率
ffmpeg -i clip.mpg -vf fps=fps=25 clip.webm
设置码率 –b 参数
-b
ffmpeg -i film.avi -b 1.5M film.mp4
音频：-b:a 视频： - b:v
设置视频码率为1500kbps
ffmpeg -i input.avi -b:v 1500k output.mp4
计算输出文件大小
(视频码率+音频码率) * 时长 /8 = 文件大小K
用-s参数设置视频分辨率，参数值wxh，w宽度单位是像素，h高度单位是像素
ffmpeg -i input_file -s 320x240 output_file

在node实现中，本质上是使用 `spawn` 接口调用 `ffmpeg` 命令，借助父子进程间的管道通讯机制，将 `ffmpeg` 命令的标准输出流输出到目标视频文件中，实现保存效果，完整示例：

```
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function transform(sourceFile, outputStream, start, duration) {
	const params = [`-ss`, start, `-i`, sourceFile, `-t`, duration, '-f', 'mpegts', '-'];
	return new Promise((r, j) => {
    const cp = spawn('ffmpeg', params);
    // ffmpeg 标准输出流
		cp.stdout.pipe(outputStream);
    // 将 ffmpeg 执行的过程日志输出到程序的标准输出流，通常为console
		cp.stderr.pipe(process.stdout);
		cp.on('error', (err) => {
			j(err);
		});
		cp.on('close', (code) => {
			console.log(`ffmpeg process close all stdio with code ${code}`);
			r(code);
		});
		cp.on('exit', (code) => {
			console.log(`ffmpeg process exited with code ${code}`);
		});
	});
}

async function run() {
	const inputFile = path.join(__dirname, 'test.mp4');
	const output = fs.createWriteStream(path.join(__dirname, 'output.mp4'));
	await transform(inputFile, output, 0, 100);
}

run();
```
下面采用express 视频转码用到的是ffmpeg,nodejs取到表单的参数采用的是目录multiparty; 方式实现转码，例子如下：
```

const express = require( 'express' );
const path = require( 'path' );
const multiparty=require( 'multiparty' );
const ffmpeg=require( 'fluent-ffmpeg' );
const fs=require( 'fs' );
const bodyParser = require( 'body-parser' );
const app=express();
app.use(express. static (path.join(__dirname,  'public' ))); //设置静态文件根路径
app.use(bodyParser.urlencoded({ extended:  false  }));
app.get( '/' , function  (req,res) {
     res.sendfile( './public/html/login.html' )
})
app.post( '/ffuser/login' , function  (req,res) {
     var  form =  new  multiparty.Form({uploadDir:  './public/upload/' });
     form.parse(req,  function  (err, fields, files) {
         console.log(files);
         var  filesTmp = JSON.stringify(files,  null , 2);
         var  inputFile = files.avatar[0];
         var  uploadedPath = inputFile.path;
         var  dstPath =  './public/realvideo/'  + inputFile.originalFilename;
         var  exchangePath= './public/convert/'  + inputFile.originalFilename;
         fs.rename(uploadedPath, dstPath,  function  (err) {
             if  (err) {
                 console.log( 'rename error: '  + err);
             }  else  {
                 console.log( 'rename ok' )
                 if  (inputFile.originalFilename.split( '.' )[1] ==  'MP4'  || inputFile.originalFilename.split( '.' )[1] ==  'mp4' ) {
                     var  trans =  new  ffmpeg({source: dstPath})
                         .setFfmpegPath( './public/ffmpeg-64/bin/ffmpeg.exe' )
                         .withAspect( '4:3' )
                         .withSize( '1280x960' )
                         .applyAutopadding( true ,  'white' )
                         .saveToFile(exchangePath,  function  (retcode, error) {
                             if  (error) {
                                 console.log(error)
                             }  else  {
                                 console.log(retcode)
                             }
                         })
                         .on( 'end' , function  () {
                             console.log( '转码完成!' )
                             res.send({code: 'success' ,json:{fields: fields, video:  '/convert/' +inputFile.originalFilename}});
                         })
                 }
             }
         });
     });
})
app.listen(3000, function  () {
     console.log( 'server start' )
})

```


