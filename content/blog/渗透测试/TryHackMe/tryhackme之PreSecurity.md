---
title: "TryHackMe Pre Security"
date: "2026-01-06 11:26:54"
tags: ["path"]
categories: ["TryHackMe"]
url: "/posts/10268.html"
abbrlink: "10268"
---

本来想来打打tryhackme的靶机，结果被hackpath种草了
只收录打tryhackme的部分答案，不涉及知识，tryhackme的知识体系确实很全面友好
平台：https://tryhackme.com/
视频：https://www.youtube.com/@The_Helpful_Hacker

# Pre Security

## Introduction to Cyber Security

### Offensive Security Intro

```
Which of the following options better represents the process where you simulate a hacker's actions to find vulnerabilities in a system?

Offensive Security
```

```
gobuster -u http://fakebank.thm -w wordlist.txt dir
-u 用于指定我们要扫描的网站， -w 用来遍历一组单词以查找隐藏的页面。
```

![image-20251229143556693](/images/image-20251229143556693.png)

```
根据情景输入即可
```

![image-20251229143944521](/images/image-20251229143944521.png)

### Defensive Security Intro

```
Which team focuses on defensive security?
Blue Team
```

```
What would you call a team of cyber security professionals that monitors a network and its systems for malicious events?
Security Operations Center

What does DFIR stand for?
Digital Forensics and Incident Response

Which kind of malware requires the user to pay money to regain access to their files?
ransomware
```

```
根据操作来就行比较简单，注意空格
THM{THREAT-BLOCKED}
```

### Careers in Cyber

#### Security Analyst 

```
Security analysts are integral to constructing security measures across organisations to protect the company from attacks. Analysts explore and evaluate company networks to uncover actionable data and recommendations for engineers to develop preventative measures. This job role requires working with various stakeholders to gain an understanding of security requirements and the security landscape.
```

#### Security Engineer

```
Security engineers develop and implement security solutions using threats and vulnerability data - often sourced from members of the security workforce. Security engineers work across circumventing a breadth of attacks, including web application attacks, network threats, and evolving trends and tactics. The ultimate goal is to retain and adopt security measures to mitigate the risk of attack and data loss.
```

#### Incident Responder

```
Incident responders respond productively and efficiently to security breaches. Responsibilities include creating plans, policies, and protocols for organisations to enact during and following incidents. This is often a highly pressurised position with assessments and responses required in real-time, as attacks are unfolding. Incident response metrics include MTTD, MTTA, and MTTR - the meantime to detect, acknowledge, and recover (from attacks.) The aim is to achieve a swift and effective response, retain financial standing and avoid negative breach implications. Ultimately, incident responders protect the company's data, reputation, and financial standing from cyber attacks.
```

#### Digital Forensics Examiner

```
If you like to play detective, this might be the perfect job. If you are working as part of a law-enforcement department, you would be focused on collecting and analysing evidence to help solve crimes: charging the guilty and exonerating the innocent. On the other hand, if your work falls under defending a company's network, you will be using your forensic skills to analyse incidents, such as policy violations.
```

#### Malware Analyst

```
A malware analyst's work involves analysing suspicious programs, discovering what they do and writing reports about their findings. A malware analyst is sometimes called a reverse-engineer as their core task revolves around converting compiled programs from machine language to readable code, usually in a low-level language. This work requires the malware analyst to have a strong programming background, especially in low-level languages such as assembly language and C language. The ultimate goal is to learn about all the activities that a malicious program carries out, find out how to detect it and report it.
```

#### Penetration Tester 

```
You may see penetration testing referred to as pentesting and ethical hacking. A penetration tester's job role is to test the security of the systems and software within a company - this is achieved through attempts to uncover flaws and vulnerabilities through systemised hacking. Penetration testers exploit these vulnerabilities to evaluate the risk in each instance. The company can then take these insights to rectify issues to prevent a real-world cyberattack.
```

#### Red Teamer 

```
Red teamers share similarities to penetration testers, with a more targeted job role. Penetration testers look to uncover many vulnerabilities across systems to keep cyber-defence in good standing, whilst red teamers are enacted to test the company's detection and response capabilities. This job role requires imitating cyber criminals' actions, emulating malicious attacks, retaining access, and avoiding detection. Red team assessments can run for up to a month, typically by a team external to the company. They are often best suited to organisations with mature security programs in place.
```

## Network Fundamentals 

### What is Networking

#### What is Networking

```
What is the key term for devices that are connected together?
Network
```

#### What is the Internet? 

```
Who invented the World Wide Web?
Tim Berners-Lee
```

#### Identifying Devices on a Network

```
What does the term "IP" stand for?
Internet Protocol

What is each section of an IP address called?
Octet

How many sections (in digits) does an IPv4 address have? 
4

What does the term "MAC" stand for?
Media Access Control
```

![image-20260102232046094](/images/image-20260102232046094.png)

#### Ping (ICMP)

```
What protocol does ping use?
ICMP

What is the syntax to ping 10.10.10.10?
ping 10.10.10.10
```

![image-20260102232005681](/images/image-20260102232005681.png)

### Intro to LAN

#### Introducing LAN Topologies

```
What does LAN stand for?
Local Area Network 

What is the verb given to the job that Routers perform?
Routing

What device is used to centrally connect multiple devices on the local network and transmit data to the correct location?
Switch

What topology is cost-efficient to set up?
Bus Topology

What topology is expensive to set up and maintain?
Star Topology
```

#### A Primer on Subnetting

```
What is the technical term for dividing a network up into smaller pieces?
Subnetting

How many bits are in a subnet mask?
32

What is the range of a section (octet) of a subnet mask?
0-255

What address is used to identify the start of a network?
Network Address

What address is used to identify devices within a network?
Host Address

What is the name used to identify the device responsible for sending data to another network?
Default Gateway
```

#### ARP

```
What does ARP stand for?
Address Resolution Protocol

What category of ARP Packet asks a device whether or not it has a specific IP address?
Request 

What address is used as a physical identifier for a device on a network?
MAC address

What address is used as a logical identifier for a device on a network?
IP address
```

#### DHCP

```
What type of DHCP packet is used by a device to retrieve an IP address?
DHCP Discover

What type of DHCP packet does a device send once it has been offered an IP address by the DHCP server?
DHCP Request

Finally, what is the last DHCP packet that is sent to a device from a DHCP server?
DHCP ACK
```

### OSI Model

#### What is the OSI Model?

```
What does the "OSI" in "OSI Model" stand for?
Open Systems Interconnection

How many layers (in digits) does the OSI model have?
7

What is the key term for when pieces of information get added to data?
encapsulation
```

#### Layer 1 - Physical

```
What is the name of this Layer?
Physical

What is the name of the numbering system that is both 0's and 1's?
Binary

What is the name of the cables that are used to connect devices?
Ethernet Cables
```

#### Layer 2 - Data Link

```
What is the name of this Layer?
Data Link

What is the name of the piece of hardware that all networked devices come with?
Network Interface Card
```

#### Layer 3 - Network

```
What is the name of this Layer?
Network

Will packets take the most optimal route across a network? (Y/N)
Y

What does the acronym "OSPF" stand for?
Open Shortest Path First

What does the acronym "RIP" stand for?
Routing Information Protocol

What type of addresses are dealt with at this layer?
IP Addresses
```

#### Layer 4 - Transport

```
What is the name of this Layer?
Transport

What does TCP stand for?
Transmission Control Protocol

What does UDP stand for?
User Datagram Protocol

What protocol guarantees the accuracy of data?
TCP

What protocol doesn't care if data is received or not by the other device?
UDP

What protocol would an application such as an email client use?
TCP

What protocol would an application that downloads files use?
TCP

What protocol would an application that streams video use?
UDP
```

#### Layer 5 - Session

```
What is the name of this layer?
Session

What is the technical term for when a connection is succesfully established?
Session
```

#### Layer 6 - Presentation

```
What is the name of this Layer?
Presentation

What is the main purpose that this Layer acts as?
Translator
```

#### Layer 7 - Application 

```
What is the name of this Layer?
Application

What is the technical term that is given to the name of the software that users interact with?
Graphical User Interface
```

### Packets & Frames

#### What are Packets and Frames

```
What is the name for a piece of data when it does have IP addressing information?
Packet

What is the name for a piece of data when it does not have IP addressing information?
Frame
```

#### TCP/IP (The Three-Way Handshake)

```
What is the header in a TCP packet that ensures the integrity of data?
checksum

Provide the order of a normal Three-way handshake (with each step separated by a comma)
SYN,SYN/ACK,ACK
```

#### UDP/IP

```
What does the term "UDP" stand for?
User Datagram Protocol

What type of connection is "UDP"?
stateless

What protocol would you use to transfer a file?
TCP

What protocol would you use to have a video call?
UDP
```

### Extending Your Network

#### Introduction to Port Forwarding

```
What is the name of the device that is used to configure port forwarding?
router
```

#### Firewalls 101

```
What layers of the OSI model do firewalls operate at?
3 & 4

What category of firewall inspects the entire connection?
stateful

What category of firewall inspects individual packets?
stateless

```

#### VPN Basics 

```
What VPN technology only encrypts & provides the authentication of data?
PPP

What VPN technology uses the IP framework?
IPSec
```

#### LAN Networking Devices 

```
What is the verb for the action that a router does?
routing

What are the two different layers of switches? Separate these by a comma I.e.: Layer X,Layer Y
Layer 2,Layer 3
```

## How The Web Works

### DNS in Detail

#### What is DNS? 

```
What does DNS stand for?
Domain Name System
```

#### Domain Hierarchy

```
What is the maximum length of a subdomain?
63

Which of the following characters cannot be used in a subdomain ( 3 b _ - )?
_

What is the maximum length of a domain name?
253

What type of TLD is .co.uk?
ccTLD
```

#### Record Types

```
What type of record would be used to advise where to send email?
用于指示将电子邮件发送到哪里的记录类型是什么？
MX

What type of record handles IPv6 addresses?
哪种记录类型用于处理 IPv6 地址？
AAAA
```

#### Making A Request

```
What field specifies how long a DNS record should be cached for?
TTL

What type of DNS Server is usually provided by your ISP?
recursive

What type of server holds all the records for a domain?
authoritative
```

### HTTP in Detail

#### What is HTTP(S)?

```
What does HTTP stand for?
HyperText Transfer Protocol

Correct Answer
What does the S in HTTPS stand for?

secure
```

#### Requests And Responses 

```
What HTTP protocol is being used in the above example?
HTTP/1.1

Correct Answer
What response header tells the browser how much data to expect?

Content-Length
```

#### HTTP Methods

```
What method would be used to create a new user account?
POST

Correct Answer
What method would be used to update your email address?

PUT

Correct Answer
What method would be used to remove a picture you've uploaded to your account?

DELETE

Correct Answer
What method would be used to view a news article?

GET
```

####  HTTP Status Codes 

```
What response code might you receive if you've created a new user or blog post article?

201

Correct Answer
What response code might you receive if you've tried to access a page that doesn't exist?

404

Correct Answer
What response code might you receive if the web server cannot access its database and the application crashes?

503

Correct Answer
What response code might you receive if you try to edit your profile without logging in first?

401

```

#### HTTPHeaders 

```
What header tells the web server what browser is being used?
User-Agent

Correct Answer
What header tells the browser what type of data is being returned?

Content-Type

Correct Answer
What header tells the web server which website is being requested?

Host
```

#### Cookies

```
Which header is used to save cookies to your computer?
Set-Cookie
```

### How Websites Work 

#### How websites work

```
What term best describes the component of a web application rendered by your browser?

Front End
```

#### HTML

![image-20260104150023154](/images/image-20260104150023154.png)

#### JavaScript

![image-20260104150438327](/images/image-20260104150438327.png)

#### Sensitive Data Exposure

![image-20260104150624679](/images/image-20260104150624679.png)

#### HTML Injection

![image-20260104151732879](/images/image-20260104151732879.png)

### Putting it all together

#### Other Components

![image-20260104152732665](/images/image-20260104152732665.png)

#### How Web Servers Work

![image-20260104152929036](/images/image-20260104152929036.png)

#### quiz

![image-20260104153204298](/images/image-20260104153204298.png)

## Linux Fundamentals

### Linux Fundamentals Part 1

#### Running Your First few Commands

![image-20260104160437040](/images/image-20260104160437040.png)

#### Interacting With the Filesystem!

![image-20260104160835458](/images/image-20260104160835458.png)

#### Searching for Files

![image-20260104161133411](/images/image-20260104161133411.png)

#### An Introduction to Shell Operators

![image-20260104161402833](/images/image-20260104161402833.png)

### Linux Fundamentals Part 2

#### Introduction to Flags and Switches

![image-20260104163054403](/images/image-20260104163054403.png)

#### Filesystem Interaction Continued

![image-20260104163600179](/images/image-20260104163600179.png)

#### Permissions 101

![image-20260104163742019](/images/image-20260104163742019.png)

#### Common Directories

![image-20260104164014636](/images/image-20260104164014636.png)

### Linux Fundamentals Part 3

#### Terminal Text Editors 

![image-20260104164320163](/images/image-20260104164320163.png)

#### General/Useful Utilities 

![image-20260104164616243](/images/image-20260104164616243.png)

#### Processes 101

![image-20260104165232526](/images/image-20260104165232526.png)

#### Maintaining Your System: Automation

![image-20260104165614990](/images/image-20260104165614990.png)

#### ManagementMaintaining Your System: Logs

![image-20260104211512279](/images/image-20260104211512279.png)

## Windows Fundamentals

### Windows Fundamentals 1

#### The File System 文件系统

![image-20260106082258890](/images/image-20260106082258890.png)





#### The Windows\System32 Folders

![image-20260106082343509](/images/image-20260106082343509.png)



#### User Accounts, Profiles, and Permissions![image-20260106083931231](/images/image-20260106083931231.png)



#### User Account Control 

![image-20260106084339426](/images/image-20260106084339426.png)



#### The Desktop (GUI)

![image-20260106085359578](/images/image-20260106085359578.png)

### Windows Fundamentals 2

#### System Configuration and Advanced System Settings

![image-20260106090731220](/images/image-20260106090731220.png)

#### Change UAC Settings

![image-20260106091048567](/images/image-20260106091048567.png)

#### Computer Management 

![image-20260106093001611](/images/image-20260106093001611.png)

#### System Information 

![image-20260106093239465](/images/image-20260106093239465.png)

#### Resource Monitor

![image-20260106093602097](/images/image-20260106093602097.png)

#### Command Prompt

![image-20260106093546864](/images/image-20260106093546864.png)



### Windows Fundamentals 3

#### Firewall & network protection

![image-20260106111326422](/images/image-20260106111326422.png)

#### Device security 

![image-20260106111343445](/images/image-20260106111343445.png)

#### BitLocker

![image-20260106111356214](/images/image-20260106111356214.png)

#### Volume Shadow Copy Service

#### ![image-20260106111406456](/images/image-20260106111406456-1767670074097-39.png)



#### 
