# 区块链开发工具

ChaintoolDao 包含多个工具，帮助开发者在使用、开发区块链项目时提高效率。部分工具需要后端提供支持，比如"交易分析工具"，需要启动一个http 服务器。

## 环境依赖以及所需软件
- Linux 
- Node.js v16^
- postgresql v14.1^


## 安装依赖
```
yarn install
```

## 部署

需要先安装 postgresql 数据库
###  postgresql 数据库安装和导入数据
以 ubuntu 为例
1. 安装 postgresql
    ```
    > sudo apt-get install postgresql
    ```

    ```
    > sudo su postgres 
    > psql
    ```
2. 创建数据库及用户：
    ```
    > CREATE USER <DatabaseUser> PASSWORD '<DatabasePassword>';
    > CREATE DATABASE <DatabaseName>;
    > GRANT ALL PRIVILEGES ON DATABASE <DatabaseName> TO <DatabaseUser>;
    ```
3. 初始化数据库:
    在项目根目录下执行
    ```
    > psql -p 5432 -h 127.0.0.1 -U <DatabaseUser> -d <DatabaseName> -f ./sql/chaintool.sql; 
    ```
4. 登录数据库：
    ```
    > psql -U <DatabaseUser> -p 5432 -h 127.0.0.1 <DatabaseName>;
    ```
5. 查看数据库表
    ```
    > \d
    ```

### 修改配置
默认配置在 [env_sample](./env_sample)。需用自己的配置替换对应配置。
```
cp env_sample .env
vi .env
```

#### 启动 http 服务
```
yarn start
```