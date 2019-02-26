#!/usr/bin/env node

const commander = require("commander");
const symbols = require("log-symbols");
const ora = require("ora");
const chalk = require("chalk");
const sakuraNode3 = require("sakura-node-3");
const fs = require("fs");
const utils = require("./utils");
const dbUtils = require("./db-utils");
const moment = require("moment");
let program = new commander.Command();

// 控制台输入参数
let argv = process.argv;

/**
 * 版本号
 */
let packageJson = require("../package");
program
    .version(packageJson.version, "-v, --version")
    .usage("[command] [options]");


/*
* 生成新模版
* */
program
    .command("generate")
    .alias("g")
    .description("生成新Model模块(g modelFilePath tableName)")
    .option("-f, --file", "全部覆盖", "a")
    .action(async function (arg0, arg1, arg2, arg3) {
        if (!arg1 || !arg2) {
            throw "缺少初始化参数！";
        }

        let tableName = arg2,           // 表名
            tableDescription = "",      // 表描述
            filePath = "src/" + arg1,    // 路径
            fileOption = "";        // 覆盖类型

        if (!arg3) {
            tableName = arg1;
            filePath = "src/" + arg0;
        } else {
            fileOption = arg0;
        }

        let spinner = ora("正在连接数据库...");
        try {
            spinner.start("检查配置信息...");

            if (!process.env.SAKURA_HOST) {
                throw "未找到配置项:数据库地址 [SAKURA_HOST]";
            }
            if (!process.env.SAKURA_PORT) {
                throw "未找到配置项:数据库端口 [SAKURA_HOST]";
            }
            if (!process.env.SAKURA_DB) {
                throw "未找到配置项:数据库名称 [SAKURA_DB]";
            }
            if (!process.env.SAKURA_USER) {
                throw "未找到配置项:数据库用户 [SAKURA_USER]";
            }
            if (!process.env.SAKURA_PASSWORD) {
                throw "未找到配置项:数据库密码 [SAKURA_PASSWORD]";
            }
            spinner.info("数据库配置信息如下：");
            console.log(symbols.success, chalk.default.gray("数据库地址:" + process.env.SAKURA_HOST));
            console.log(symbols.success, chalk.default.gray("数据库端口:" + process.env.SAKURA_PORT));
            console.log(symbols.success, chalk.default.gray("数据库名称:" + process.env.SAKURA_DB));
            console.log(symbols.success, chalk.default.gray("数据库用户:" + process.env.SAKURA_USER));
            console.log(symbols.success, chalk.default.gray("数据库密码:" + process.env.SAKURA_PASSWORD));
            let dbClient = sakuraNode3.DBClient.createClient({
                type: sakuraNode3.DriverType.MYSQL,
                username: process.env.SAKURA_USER,
                password: process.env.SAKURA_PASSWORD,
                database: process.env.SAKURA_DB,
                host: process.env.SAKURA_HOST,
                port: Number(process.env.SAKURA_PORT)
            });


            await dbClient.query("select now();");
            console.log(symbols.success, chalk.default.green("数据库连接成功！"));

            let nowExecPath = process.cwd();
            let modelName = tableName.replace(/_/g, "-");
            let modelNameUpper = utils.fileNameExec(tableName, true);
            let fileName = `${nowExecPath}/${filePath}/${modelName}/${modelName}`;

            // 创建model主目录
            utils.makeDirByModelPath(nowExecPath, filePath);
            // 创建model存放目录
            utils.makeDir(`${nowExecPath}/${filePath}/${modelName}`);

            // 数据库中表的信息
            let dbTableList = await dbClient.query(`select table_comment from information_schema.tables where table_schema ='${process.env.SAKURA_DB}' and table_name = '${tableName}'`);
            if (dbTableList && dbTableList.rows && dbTableList.rows.length > 0) {
                tableDescription = dbTableList.rows[0]["table_comment"];
            } else {
                throw `数据库操作失败: 表[${tableName}]不存在`;
            }

            // model.ts

            // 数据库中列的列表
            let dbColumnList = await dbClient.query(`select table_schema,table_name,column_name,column_default,is_nullable,data_type,character_maximum_length,column_key,extra,column_comment from information_schema.columns where table_schema ='${process.env.SAKURA_DB}' and table_name = '${tableName}'`);
            let columnContent = dbUtils.columnGenerate(dbColumnList.rows);

            let fileContent = `/**
 * ${modelName}, Created on ${moment().format("YYYY/MM/DD HH:mm:ss")}
 * @author sakura-cli(automatic generation)
 * @since 1.0.0
 * @version 1.0.0
 */

import {Column, TableName, SqlFlag, SqlType, SqlDefaultValue, GGModel} from "sakura-node-3";

/**
 * @description ${tableDescription}Model类
 * @author sakura-cli(automatic generation)
 * @version 1.0.0
 */
@TableName("${tableName}")
export class ${modelNameUpper} extends GGModel {
    ${columnContent}
}
`;

            if (fs.existsSync(`${fileName}.ts`)) {
                // 如没有-f参数
                if (!fileOption) {
                    console.log(symbols.error, chalk.default.red(`${modelName}.ts 生成失败，文件已存在`));
                } else {
                    if (fileOption === "a" || fileOption === "m") {
                        fs.writeFileSync(`${fileName}.ts`, "");
                        fs.writeFileSync(`${fileName}.ts`, fileContent);
                        console.log(symbols.warning, chalk.default.yellow(`${modelName}.ts 文件已存在，已覆盖原文件`));
                        console.log(symbols.success, chalk.default.green(`${modelName}.ts 生成成功`));
                    } else {
                        console.log(symbols.info, chalk.default.blue(`${modelName}.ts 文件已存在，跳过覆盖`));
                    }
                }
            } else {
                fs.writeFileSync(`${fileName}.ts`, fileContent);
                console.log(symbols.success, chalk.default.green(`${modelName}.ts 生成成功`));
            }


            // model-service.ts
            fileContent = `/**
 * ${modelName}-service, Created on ${moment().format("YYYY/MM/DD HH:mm:ss")}
 * @author sakura-cli(automatic generation)
 * @since 1.0.0
 * @version 1.0.0
 */

import {${modelNameUpper} as Model} from "./${modelName}";
import {${modelNameUpper}Repository as Repository} from "./${modelName}-repository";
import {BaseService} from "${utils.replaceObliqueLine(filePath)}../base/base-service";

/**
 * @description ${tableDescription}Service类
 * @author sakura-cli(automatic generation)
 * @version 1.0.0
 */
export class ${modelNameUpper}Service extends BaseService {

  /**
   * 添加${modelName}信息
   * @returns
   */
  static async create(model: Model): Promise<number | string> {
    return await Repository.create(model);
  }

  /**
   * 修改${modelName}信息
   * @returns
   */
  static async update(model: Model): Promise<number> {
    return await Repository.update(model);
  }

  /**
   * 删除${modelName}信息
   * @returns
   */
  static async destroy(model: Model): Promise<number> {
    return await Repository.destroy(model);
  }

  /**
   * 查询单个${modelName}信息
   * @returns
   */
  static async findOne(id: number): Promise<Model> {
    return await Repository.findOne(Model, id);
  }


  /**
   * 查看所有${modelName}信息
   * @returns
   */
  static async findAll(limit: number, offset: number): Promise<Model[]> {
    return await Repository.findAllWithLimitAndOffsetAndSort(Model, limit, offset, "sort", "DESC");
  }

  /**
   * 查看${modelName}信息数量
   * @returns
   */
  static async count(): Promise<number> {
    return await Repository.count(Model);
  }

}`;


            if (fs.existsSync(`${fileName}-service.ts`)) {
                if (!fileOption) {
                    console.log(symbols.error, chalk.default.red(`${modelName}-service.ts 生成失败，文件已存在`));
                } else {
                    if (fileOption === "a" || fileOption === "s") {
                        fs.writeFileSync(`${fileName}-service.ts`, "");
                        fs.writeFileSync(`${fileName}-service.ts`, fileContent);
                        console.log(symbols.warning, chalk.default.yellow(`${modelName}-service.ts 文件已存在，已覆盖原文件`));
                        console.log(symbols.success, chalk.default.green(`${modelName}-service.ts 生成成功`));
                    } else {
                        console.log(symbols.info, chalk.default.blue(`${modelName}-service.ts 文件已存在，跳过覆盖`));
                    }
                }
            } else {
                fs.writeFileSync(`${fileName}-service.ts`, fileContent);
                console.log(symbols.success, chalk.default.green(`${modelName}-service.ts 生成成功`));
            }


            // model-repository.ts
            fileContent = `/**
 * ${modelName}-repository, Created on ${moment().format("YYYY/MM/DD HH:mm:ss")}
 * @author sakura-cli(automatic generation)
 * @since 1.0.0
 * @version 1.0.0
 */

import {InsertQuery, SelectQuery, DBClient, QueryResult, MySqlQueryBuilder, GGModel} from "sakura-node-3";
import {${modelNameUpper} as Model} from "./${modelName}";
import {BaseRepository} from "${utils.replaceObliqueLine(filePath)}../base/base-repository";

/**
 * @description ${tableDescription}Repository类
 * @author sakura-cli(automatic generation)
 * @version 1.0.0
 */
export class ${modelNameUpper}Repository extends BaseRepository {

}
`;

            if (fs.existsSync(`${fileName}-repository.ts`)) {
                if (!fileOption) {
                    console.log(symbols.error, chalk.default.red(`${modelName}-repository.ts 生成失败，文件已存在`));
                } else {
                    if (fileOption === "a" || fileOption === "r") {
                        fs.writeFileSync(`${fileName}-repository.ts`, "");
                        fs.writeFileSync(`${fileName}-repository.ts`, fileContent);
                        console.log(symbols.warning, chalk.default.yellow(`${modelName}-repository.ts 文件已存在，已覆盖原文件`));
                        console.log(symbols.success, chalk.default.green(`${modelName}-repository.ts 生成成功`));
                    } else {
                        console.log(symbols.info, chalk.default.blue(`${modelName}-repository.ts 文件已存在，跳过覆盖`));
                    }
                }
            } else {
                fs.writeFileSync(`${fileName}-repository.ts`, fileContent);
                console.log(symbols.success, chalk.default.green(`${modelName}-repository.ts 生成成功`));
            }

            // model-controller.ts
            fileContent = `/**
 * ${modelName}-controller, Created on ${moment().format("YYYY/MM/DD HH:mm:ss")}
 * @author sakura-cli(automatic generation)
 * @since 1.0.0
 * @version 1.0.0
 */


import {${modelNameUpper} as Model} from "./${modelName}";
import {${modelNameUpper}Service as Repository} from "./${modelName}-service";
import {BaseController} from "${utils.replaceObliqueLine(filePath)}../base/base-controller";

/**
 * @description ${tableDescription}Controller类
 * @author sakura-cli(automatic generation)
 * @version 1.0.0
 */
export class ${modelNameUpper}Controller extends BaseController {

}
`;

            if (fs.existsSync(`${fileName}-controller.ts`)) {
                if (!fileOption) {
                    console.log(symbols.error, chalk.default.red(`${modelName}-controller.ts 生成失败，文件已存在`));
                } else {
                    if (fileOption === "a" || fileOption === "c") {
                        fs.writeFileSync(`${fileName}-controller.ts`, "");
                        fs.writeFileSync(`${fileName}-controller.ts`, fileContent);
                        console.log(symbols.warning, chalk.default.yellow(`${modelName}-controller.ts 文件已存在，已覆盖原文件`));
                        console.log(symbols.success, chalk.default.green(`${modelName}-controller.ts 生成成功`));
                    } else {
                        console.log(symbols.info, chalk.default.blue(`${modelName}-controller.ts 文件已存在，跳过覆盖`));
                    }
                }
            } else {
                fs.writeFileSync(`${fileName}-controller.ts`, fileContent);
                console.log(symbols.success, chalk.default.green(`${modelName}-controller.ts 生成成功`));
            }


            spinner.succeed(chalk.default.green("model已成功生成！"));
            process.exit();
        } catch (err) {
            spinner.fail();
            console.log(symbols.error, chalk.default.red(err));
            process.exit();
        }
    });

program.parse(argv);


/*
* 帮助
* */
if (program.args.length === 0) {
    // 这里是处理默认没有输入参数或者命令的时候，显示help信息
    program.help();
}


