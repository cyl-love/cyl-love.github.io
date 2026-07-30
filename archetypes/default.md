---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
tags: []
categories: []
url: "/posts/{{ .Date.Format "20060102150405" }}.html"
abbrlink: "{{ .Date.Format "20060102150405" }}"
draft: true
---
