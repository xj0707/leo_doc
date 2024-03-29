# aa  

加密算法包括对称加密和非对称加密，对称加密就是加密和解密用一个秘钥 .密文的安全性完全依赖于 密钥的保密性，一旦密钥泄漏，将毫无保密性可言.后来又3位数学家提供了一种算法，实现非对称加密，后来算法也以他们三个的首字母命名，R（Rivest）S（Shamir ）A（Adleman ）算法。而非对称加密有两个秘钥，公钥和私钥。

公钥，就是给大家用的,私钥，就是自己的，必须非常小心保存.

公钥与私钥的作用是：用公钥加密的内容只能用私钥解密，用私钥加密的内容只能用公钥解密。

那如何保证这个公钥是准确性，不是他人冒用的，任何人都可以落款声称她/他就是你，因此[公钥](https://baike.baidu.com/item/公钥)必须向接受者信任的人（[身份](https://baike.baidu.com/item/身份)[认证机构](https://baike.baidu.com/item/认证机构)）来注册。于是就有了"证书中心"（certifi[ca](https://www.baidu.com/s?wd=ca&tn=24004469_oem_dg&rsv_dl=gh_pl_sl_csd)te authority，简称CA），为公钥做认证。

## RSA 加密原理

传统对称密码而言，密文的安全性完全依赖于 密钥的保密性，一旦密钥泄漏，将毫无保密性可言。

后来又3位数学家提供了一种算法，实现非对称加密，后来算法也以他们三个的首字母命名，R（Rivest）S（Shamir ）A（Adleman ）算法。

### RSA 数学理论基础

#### 1. 互质关系

> 两个正整数，除1以外，再没有别的公因子。 比如 2 和3， 2和 9

#### 2. 欧拉函数

> 任意给定正整数n，请问在小于等于n的正整数之中，有多少个与n构成互质关系？（比如，在1到8之中，有多少个数与8构成互质关系？）
>
> 计算上面这个多少个的函数就被成为欧拉函数，以φ(n)表示。在1到8之中，与8形成互质关系的是1、3、5、7，所以 φ(n) = 4。

#### 3. 欧拉定理

> 如果两个正整数a和n互质，则n的欧拉函数 φ(n) 可以让下面的等式成立：