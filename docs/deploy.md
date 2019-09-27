# 部署

## 部署至服务器

```shell
npm run deploy
```

当中包括：生产构建、打包、上传、更新服务器上的代码等操作。部署成功后，即可操作接下来的几个要点。

## 了解服务器

详情参见 [`gelue-club/vps`](https://github.com/gelue-club/vps) 项目，包括服务器文档、脚手架、配置、架构等内容。

## 登录服务器

```shell
ssh root@34.92.102.151
```

## 停止 NGINX 服务器

```shell
pkill -9 nginx
```

## 清空 `pagespeed` 缓存

```shell
rm -rf /var/ngx_pagespeed_cache && mkdir /var/ngx_pagespeed_cache
```

## 重启 NGINX 服务器

```shell
/usr/local/nginx/sbin/nginx
```
