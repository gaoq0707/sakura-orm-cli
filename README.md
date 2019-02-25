# OVERVIEW

基于sakura-node-3的脚手架工具,可一条命令创建你需要的mvc文件。

# INSTALL

`npm install sakura-orm-cli -g`

# 使用方法

1. 先设置系统环境变量

```shell
export SAKURA_HOST=;
export SAKURA_PORT=;
export SAKURA_DB=;
export SAKURA_USER=;
export SAKURA_PASSWORD=;
```

2. 熟悉全局变量

```
* fi-cli
* sakura-orm-cli
* gago-orm-cli
```

3. 执行命令 

```shell

# -f 代表强制覆盖

fi-cli g model/users/test user_device [-f] [file option]

```

* -f a: 全部覆盖
* -f r: 只覆盖repository
* -f m: 只覆盖model
* -f s: 只覆盖service
* -f c: 只覆盖controller
