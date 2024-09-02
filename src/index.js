#!/usr/bin/env node

import fs from "node:fs";
import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { getDownload } from "./util.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const program = new Command();

// 获取当前模块文件的路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let package_json;

try {
  package_json = fs.readFileSync(
    path.resolve(__dirname, "../package.json"),
    "utf-8"
  );
  package_json = JSON.parse(package_json);
} catch (error) {
  console.error("Failed to read or parse package.json", error);
  process.exit(1);
}

program
  .name("npm-counts")
  .description("CLI tool 获取 npm 网站的包下载量")
  .version(package_json.version, "-v, --version", "output the version number");

console.log(
  "Welcome to npm-counts CLI tool, version:",
  package_json.version,
  "\n"
);

program
  .command("download")
  .alias("down")
  .description("查询流行前端框架 angular react vue 的下载次数")
  .action(() => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "packageName",
          message: "您想检查哪个框架的下载次数？",
          choices: ["vue", "react", "angular"],
        },
        {
          type: "list",
          name: "date",
          message: "时间范围",
          choices: ["周", "月", "年"],
          default: "周",
        },
      ])
      .then(async (answers) => {
        const spinner = ora("正在查询下载数量...").start();
        console.log(answers);

        const data = await getDownload(answers.packageName, answers.date);
        spinner.succeed(
          `${answers.packageName} 框架的${answers.date}(${data.start}-${data.end})下载量为 ${data.downloads} 次`
        );
      })
      .catch(() => {
        process.exit(1); // 处理异常后退出
      });
  });

program
  .command("list")
  .alias("ls")
  .description("查询 npm 下载量列表")
  .action(() => {
    console.log("angular react vue");
  });

program
  .command("add")
  .description("自定义查询任意 npm 包的下载量")
  .action(() => {
    inquirer
      .prompt([
        {
          type: "input",
          name: "packageName",
          message: "请输入您想查询的 npm 包名称：",
          required: true,
        },
        {
          type: "list",
          name: "date",
          message: "请选择时间范围",
          choices: ["周", "月", "年"],
          default: "周",
        },
      ])
      .then(async (answers) => {
        const spinner = ora("Fetching download counts...").start();
        try {
          const data = await getDownload(answers.packageName, answers.date);
          if (answers.packageName) {
            spinner.succeed(
              `在过去的一${answers.date}(${data.start}-${data.end})总下载量为 ${data.downloads} 次`
            );
          } else {
            spinner.succeed(
              `${answers.packageName} 在过去的一${answers.date}(${data.start}-${data.end})下载量为 ${data.downloads} 次`
            );
          }
        } catch (error) {
          spinner.fail("Failed to fetch download counts.");
          console.error(error.message);
        }
      });
  });

program.parse(process.argv);
