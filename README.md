# smart [![Build Status](https://travis-ci.org/zhijunzhou/smart.svg?branch=master)](https://travis-ci.org/zhijunzhou/smart)

> smart project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

参考资料：
1. Element-UI: [http://element.eleme.io/#/en-US/component/installation](http://element.eleme.io/#/en-US/component/installation)
2. ECharts: [https://github.com/ecomfe/vue-echarts](https://github.com/ecomfe/vue-echarts)
3. 微信开放平台：[https://open.weixin.qq.com](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=open1419316505&token=&lang=zh_CN)
4: [Travis CI](https://travis-ci.org)

# **Smart** 
 
 ### 项目框架 ：
>  Vue：一套构建用户界面的渐进式框架。[https://cn.vuejs.org/](https://cn.vuejs.org/) 

### 项目插件 ：
>  EChars -- 折线图 [http://echarts.baidu.com/echarts2/doc/example.html](http://echarts.baidu.com/echarts2/doc/example.html)
（用于产品分析曲线图）

>  Element UI [http://element-cn.eleme.io/#/zh-CN](http://element-cn.eleme.io/#/zh-CN)

 ### 代码结构 :

```
    |-- src                                    项目源码目录
    |   |-- App.vue                            根组件  
    |   |-- main.js                            入口js文件
    |   |-- components                         组件目录  
    |   |   |-- Hello.vue                      微信扫描
    |   |   |-- csvDownload
    |   |   |   |-- csvDownload.vue            csv下载
    |   |   |-- loading
    |   |   |   |-- loading.vue                loading           
    |   |   |-- period
    |   |   |   |-- period.vue                 自定义时间
    |   |   |-- productAnalysis
    |   |   |   |-- productAnalysis.vue        产品分析
    |   |   |-- productSearch
    |   |   |   |-- productSearch.vue          时间单位选择
    |   |   |-- search-bar
    |   |       |-- search-bar.vue             店铺国家选择
    |   |-- filter                             角色配置
    |   |   |-- role.js
    |   |-- router                             前端路由
    |   |   |-- index.js                            
    |   |-- store                              应用级数据（state）
    |   |   |-- index.js
    |   |   |-- types.js
    |   |   |-- modules
    |   |       |-- com.js
    |   |       |-- user.js
    |   |-- styles                             echarts
    |   |   |-- echarts.css
    |   |-- utils                              公共配置文件目录
    |   |   |-- api.js
    |   |   |-- enum.js
    |   |   |-- service.js
    |   |   |-- util.js
    |   |-- views                              页面目录
    |       |-- Login.vue                      登陆页
    |       |-- Main.vue                       首页
    |       |-- Analysis
    |       |   |-- Analysis.vue               产品分析
    |       |-- config
    |       |   |-- config.vue                 优化类型
    |       |   |-- mailSetting.vue            邮件配置
    |       |-- feedback
    |       |   |-- feedback-total.vue         反馈统计
    |       |   |-- feedback.vue               反馈详情
    |       |-- Products
    |       |   |-- Add.vue                    添加关键字&竞品
    |       |   |-- Ads.vue                    广告管理
    |       |   |-- orders.vue                 订单查询
    |       |   |-- Products.vue               销量报表
    |       |-- Setting
    |       |   |-- Setting.vue                用户管理
    |       |-- workflow
    |           |-- workflow.vue               工作管理

```

程序中使用的函数有规范的命名和注释, 请参考代码

