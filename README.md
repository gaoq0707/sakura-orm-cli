# OVERVIEW

基于sakura-node-3的脚手架工具,可一条命令创建你需要的mvc文件。

# INSTALL

`npm install gago-demo-token-validator`

# 使用方法

1. 先设置系统环境变量
```shell
export SAKURA_HOST=101.200.33.245;
export SAKURA_PORT=16063;
export SAKURA_DB=picc;
export SAKURA_USER=gaoqiang;
export SAKURA_PASSWORD=BHU*9ol.;
```

2. 执行shell
```shell

# f 代表强制覆盖

fi-cli g model/users/test user_device [f]
sakura-orm-cli g model/users/test user_device [f]
gago-orm-cli g model/users/test user_device [f]

```
