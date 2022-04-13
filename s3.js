import {S3} from "aws-sdk";
import cryptos from "crypto";
import {url_config, url_prefix} from "@/utils/request/url_config";
import * as http from "@/utils/request/http";
import store from "../../store/index";

const cryptolib = crypto.subtle;

const urlPrefix = url_prefix.aiot_url_prefix + "alert/download/token?deviceid=";
let timestamp = new Date().getTime(), nonce = "abcdefg";
let concated = [timestamp, nonce, url_config.cur_env_config().CLIENT_ID].join(";");
let keyHash = cryptos.createHmac("SHA256",url_config.cur_env_config().SECRET).update(concated).digest("hex");
let key_hash = [timestamp, nonce, keyHash].join(";");
sessionStorage.setItem("key_hash",key_hash);

export let S3Tool;

(function () {
  let stsCredential;
  let request;

  async function _arrayBufferToHexString(arrayBuffer)
  {
    const array = Array.from(new Uint8Array(arrayBuffer));
    return array.map((b) => (`00${b.toString(16)}`).slice(-2)).join("");
  }

  async function _sha256(msg)
  {
    const hashBuff = await cryptolib.digest("SHA-256", new TextEncoder("utf-8").encode(msg));
    return await _arrayBufferToHexString(hashBuff);
  }

  async function _doHMAC_SHA256(password, data)
  {
    const dataBuff = new TextEncoder().encode(data);
    const key = await cryptolib.importKey("raw", password, {name: "HMAC",hash: { name: "SHA-256" }}, false, ["sign"]);
    return await cryptolib.sign({name: "HMAC",hash: { name: "SHA-256" }}, key, dataBuff);
  }
  //获取图片、影片地址
  async function _awsSignV4(credential, request)
  {
    let strISO = new Date().toISOString();
    let strDate = strISO.substring(0, 10).replace(/-/g, "");
    let strDateTime = `${strDate}T${strISO.substring(11, 19).replace(/:/g, "")}Z`;

    // XXX parameterize
    let AccessKeyId = credential.AccessKeyId;
    let SecretAccessKey = credential.SecretAccessKey;
    let SessionToken = credential.SessionToken;
    let region = request.region;//'ap-northeast-1'.toLowerCase();
    let service = request.service;//'s3'.toLowerCase();
    let method = request.method;//'GET';
    let host = request.host;//'s3-ap-northeast-1.amazonaws.com';
    let path = request.path;//'/bucket.dev.apn1.aiov.askeycloud.com/account-0001/948700000000001/1544177610176/1544177610176.mp4';

    let credentialScope = `${AccessKeyId}/${strDate}/${region}/${service}/aws4_request`;
    console.log(credentialScope);
    let headerParams = new URLSearchParams();

    headerParams.set("host", host);
    headerParams.sort();

    let queryParams = new URLSearchParams();

    queryParams.set("response-content-disposition", "attachment");
    queryParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
    queryParams.set("X-Amz-Credential", credentialScope);
    queryParams.set("X-Amz-Date", strDateTime);
    queryParams.set("X-Amz-SignedHeaders", "host"); // XXX SignedHeaders headerParams.toLowerCase() not implements yet

    if ( SessionToken )
    {
      queryParams.set("X-Amz-Security-Token", SessionToken);
      queryParams.set("X-Amz-Expires", 300); // XXX expire time
    }
    queryParams.sort();


    let canonicalRequest = `${method}\n${path}\n${queryParams.toString()}\nhost:${host}\n\nhost\nUNSIGNED-PAYLOAD`;
    //console.log('canonicalRequest:\n' + canonicalRequest);

    let reqHash = await _sha256(canonicalRequest);

    let string2sign = `AWS4-HMAC-SHA256\n${strDateTime}\n${strDate}/${region}/${service}/aws4_request\n${reqHash}`;
    //console.log('string2sign:\n' + string2sign);

    let ret = await _doHMAC_SHA256(new TextEncoder().encode("AWS4" + SecretAccessKey), strDate);
    ret = await _doHMAC_SHA256(ret, region);
    ret = await _doHMAC_SHA256(ret, service);
    ret = await _doHMAC_SHA256(ret, "aws4_request");
    ret = await _doHMAC_SHA256(ret, string2sign);

    const hashHex = await _arrayBufferToHexString(ret);
    //console.log('signature:\n' + hashHex);

    queryParams.set("X-Amz-Signature", hashHex);

    //  console.log('url: ' + url);
    return `https://${host}${path}?${queryParams.toString()}`;
  }

  /**
     * 获取凭证
     */
  async function _getCredential(deviceid,originUrl)
  {
    // 如果传递了originUrl则代表是非自动上传的alert
    if (originUrl){
      // 调用upload接口获取token
      stsCredential = await http.get(
        {
          path: url_prefix.arfs_url_prefix + `device/${deviceid}/uploadfile/${encodeURIComponent(originUrl)}/token`
        });
    } else {
      // 自动上传的alert保持原逻辑
      stsCredential = await http.get(
        {
          path: urlPrefix + `${deviceid}`
        });
    }
  }
  //获取内容
  async function _parseURL(urlStr)
  {
    console.log("urlStr:" + urlStr);
    const url = new URL(urlStr);
    let region = url.host.substring(0, url.host.indexOf("."));
    region = ( region.length > 3 ) ? region.substring(3, region.length) : "us-east-1";
    request =
         {
           service: "s3",
           region,
           method: "GET",
           host: url.host,
           path: url.pathname
         };
    //  console.log('request:' + JSON.stringify(stsCredential));
  }
  S3Tool = class S3Tool {
    constructor(deviceId, originUrl) {
      this.deviceId = deviceId;
      this.originUrl = originUrl;
    }

    async getS3Url(callback)
    {
      //  console.log(this.originUrl)
      let url;
      // 1.a 如果不是自动上传的media
      if (!this.originUrl[0].includes("https")){
        // 1.a.1 获取凭证
        await _getCredential(this.deviceId,this.originUrl[0]);
        // 1.a.2 构造S3 SDK实例
        const s3 = new S3({
          credentials: {
            accessKeyId: stsCredential.data.token.AccessKeyId,
            secretAccessKey: stsCredential.data.token.SecretAccessKey,
            sessionToken: stsCredential.data.token.SessionToken
          },
          region: stsCredential.data.region
        });
        // 1.a.3 调用方法获取地址
        url = await this.getManualUrl(s3,stsCredential);
      } else {
        // 1.b 自动上传的alert保留原逻辑
        await _getCredential(this.deviceId);
        await _parseURL(this.originUrl);
        url = await _awsSignV4(stsCredential, request);
      }
      console.log(url);
      callback(url);
    }

    /**
          * 获取非自动上传的文件S3路径
          */
    async getManualUrl(s3, row) {
      let path = await s3.getSignedUrl("getObject", {
        Bucket: row.data.bucketName,
        Key: row.data.s3Prefix + `${this.originUrl[0]}`
      });
      return path;
    }

    async getS3UrlList(callback)
    {
      let urlList = [];
      let url = "";
      await _getCredential(this.deviceId);

      for (let i = 0; i < this.originUrl.length; i++) {
        await _parseURL(this.originUrl[i]);
        url = await _awsSignV4(stsCredential, request);
        urlList.push(url);
        console.log("url:" + url);
      }
      callback(urlList);
    }

  };
})();
