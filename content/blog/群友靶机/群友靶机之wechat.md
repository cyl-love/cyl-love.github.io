---
title: "群友靶机之wechat"
date: "2025-12-24 21:06:38"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/34595.html"
abbrlink: "34595"
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

![image-20251221190510125](/images/image-20251221190510125.png)

```
经典的22,80端口还提示robots.txt了个1.txt
```

# 80端口探测

## ctf小游戏

![image-20251221190712548](/images/image-20251221190712548.png)

```
进来一眼看到密码的rsa，直接一把梭就好了
```

![image-20251221190741272](/images/image-20251221190741272.png)

```
base64加rot13编码
```

![image-20251221191630551](/images/image-20251221191630551.png)

```
有一张没有显示出来的图片，base64解码，string分析获得的图片
```

```
将三部分的解码之后可以获得登录凭证
flag{welcome:wlc0mE@660930334}
```

# user-flag

![image-20251221192850708](/images/image-20251221192850708.png)

```
发现有一个wechat_files文件，得到一个微信聊天记录的数据库
```

![image-20251221193129460](/images/image-20251221193129460.png)

```
打包出来，用工具进行解密sqlite数据库https://github.com/adysec/wechat_sqlite
```

![image-20251221194948213](/images/image-20251221194948213.png)

# root-flag

![image-20251221195159850](/images/image-20251221195159850-1766582083764-151.png)
