---
title: "群友靶机之babypass"
date: "2025-12-24 21:04:59"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/24144.html"
abbrlink: "24144"
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

# 主机发现

![image-20251127131611170](/images/image-20251127131611170.png)

# 端口扫描

![image-20251127133658991](/images/image-20251127133658991.png)

# tip点探索

## 80端口探测

```
进去一个hello world f12查看源码提示有套tms，进去/tms发现一套旅游管理系统，但是没看出来是什么常见的cms
```

![image-20251127133717637](/images/image-20251127133717637.png)



## 目录扫描

```
dirsearch -u http://192.168.44.137/tms 
```

![image-20251127134208613](/images/image-20251127134208613.png)

## 信息泄露

```
把200响应包都看看，发现readme.txt有前后端账号密码的泄露
```

![image-20251127160112757](/images/image-20251127160112757.png)

```
Username : admin
Password : Test@123

Username : anuj@gmail.com
Password : Test@123
```

```
分别登录上去，发现后端没有什么实质的业务响应，前端登录也没有啥，在这里卡了一会，去扫描历史漏洞啥的，没看出来点在哪，想起来就两个服务22和80，尝试用这个账号密码去登录
```

![image-20251127160416546](/images/image-20251127160416546.png)

![image-20251127160432659](/images/image-20251127160432659.png)

# ssh连接获取权限

```
两个账号都分别尝试，都可以登录上去，查看sudo权限，发现都没有相应的权限，想着admin用户权限应该比anuj权限大，所以在admin下探索
```

![image-20251127162218081](/images/image-20251127162218081.png)

![image-20251127162241358](/images/image-20251127162241358.png)

# flag1

```
flag{user-0bb3c30dc72e63881db5005f1aa19ac3}
```

```
admin权限打开home下有个welcome，里面有个user.txt,就是flag1
```

![image-20251127162454884](/images/image-20251127162454884.png)

```
拿到flag1，flag2应该是在root下的。在这里又顿了，探测了圈，逻辑没连起来。想到ssh连接是tms下的账号密码复用联动，那么是不是tms的数据库里面有root的账号密码，然后ssh就拿到root权限了呢
```

# tip点再探索

## tms配置文件

```
现在是想要进数据库，先找找配置文件有没有账号密码
```

![image-20251127162835327](/images/image-20251127162835327.png)

```
tms_user/secure_password
```

## mysql探索

![image-20251127163135083](/images/image-20251127163135083.png)

![image-20251127163118200](/images/image-20251127163118200.png)

```
确实存在root的账号密码，所以逻辑连接起来了
root/fd50619cd7026f0f32272f77f4da6e92【md5加密】
Root@456
```

![image-20251127163252772](/images/image-20251127163252772.png)

# ssh连接获取权限

![image-20251127163341436](/images/image-20251127163341436.png)

# flag2

```
flag{root-bb289959b86dd81869df2eb9a7f3602a}
```

# 总结

```
就是信息泄露+账号密码复用+mysql操作+ssh连接
```

