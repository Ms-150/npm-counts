#!/usr/bin/env node

import fs from 'node:fs'
import { Command } from 'commander'
import inquirer from 'inquirer'
import ora from 'ora'
import { getDownload } from './util.js'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { getLocale } from './locales.js'

const program = new Command()

// 获取当前模块文件的路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let package_json

try {
  package_json = fs.readFileSync(
    path.resolve(__dirname, '../package.json'),
    'utf-8'
  )
  package_json = JSON.parse(package_json)
} catch (error) {
  console.error('Failed to read or parse package.json', error)
  process.exit(1)
}

const userLocale = process.env.LANG || 'en'
const language = userLocale.startsWith('zh') ? 'zh' : 'en'

const texts = getLocale(language)

program
  .name('npm-counts')
  .description('CLI tool to fetch npm package download counts')
  .version(package_json.version, '-v, --version', 'output the version number')

console.log(`${texts.welcome} ${package_json.version}\n`)

const getDatePrompt = () => ({
  type: 'list',
  name: 'date',
  message: texts.selectTimeRange,
  choices: [
    { name: language === 'zh' ? '周' : 'Week', value: 'week' },
    { name: language === 'zh' ? '月' : 'Month', value: 'month' },
    { name: language === 'zh' ? '年' : 'Year', value: 'year' }
  ],
  default: 'week'
})

program
  .command('query [packageName]')
  .description(texts.commandDownload)
  .action(async (packageName) => {
    const askForPackageName = !packageName
    const prompts = askForPackageName
      ? [
          {
            type: 'list',
            name: 'packageName',
            message: texts.selectPackage,
            choices: ['vue', 'react', 'angular']
          }
        ]
      : []

    prompts.push(getDatePrompt())

    try {
      const answers = await inquirer.prompt(prompts)
      const chosenPackageName = packageName || answers.packageName
      const spinner = ora(texts.fetchDownload).start()
      const res = await getDownload(chosenPackageName, answers.date)
      spinner.succeed(
        texts.successDownload(
          res.package,
          answers.date,
          res.downloads,
          res.start,
          res.end
        )
      )
    } catch (error) {
      spinner.fail(texts.fetchFailed)
      console.error(error.message)
    }
  })

program
  .command('list')
  .alias('ls')
  .description('')
  .action(async () => {
    const dependencies = package_json.dependencies || {}
    const devDependencies = package_json.devDependencies || {}
    const allDependencies = { ...dependencies, ...devDependencies }
    const modules = Object.keys(allDependencies)

    if (modules.length === 0) {
      console.log(texts.noLocalModules)
      return
    }

    const answers = await inquirer.prompt([getDatePrompt()])
    for (const moduleName of modules) {
      const spinner = ora(`${texts.fetchDownload} ${moduleName}...`).start()
      try {
        const res = await getDownload(moduleName, answers.date)
        spinner.succeed(
          texts.successDownload(
            res.package,
            answers.date,
            res.downloads,
            res.start,
            res.end
          )
        )
      } catch (error) {
        spinner.fail(`${texts.failedToFetch} ${moduleName}`)
        console.error(error.message)
      }
    }
  })

program
  .command('add [packageName]')
  .description(texts.commandAdd)
  .action((packageName) => {
    const askForPackageName = !packageName
    const prompts = []

    if (askForPackageName) {
      prompts.push({
        type: 'input',
        name: 'packageName',
        message: `${texts.selectPackage}:`,
        required: true
      })
    }

    prompts.push(getDatePrompt())

    inquirer
      .prompt(prompts)
      .then(async (answers) => {
        const spinner = ora(texts.fetchDownload).start()
        try {
          const res = await getDownload(packageName, answers.date)
          spinner.succeed(
            texts.successDownload(
              res.package,
              answers.date,
              res.downloads,
              res.start,
              res.end
            )
          )
        } catch (error) {
          spinner.fail(texts.fetchFailed)
          console.error(error.message)
        }
      })
      .catch(() => {
        process.exit(1) // 处理异常后退出
      })
  })

program.parse(process.argv)
