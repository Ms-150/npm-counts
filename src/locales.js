// locales.js
export const getLocale = (language) => {
  const locales = {
    zh: {
      welcome: '欢迎使用 npm-counts CLI 工具，版本号：',
      commandDownload: '查询 npm 模块的下载次数 默认 angular react vue',
      commandAdd: '自定义添加查询 npm 模块的下载量',
      selectPackage: '您想查询哪个npm 模块的下载次数？',
      selectTimeRange: '选择时间范围',
      fetchDownload: '正在查询下载数量...',
      fetchFailed: '查询下载数量失败。',
      successDownload: (pkg, date, downloads, start, end) =>
        `${pkg} 模块 ${date} 下载量 (${start} 至 ${end}) 为 ${downloads} 次`
    },
    en: {
      welcome: 'Welcome to npm-counts CLI tool, version:',
      commandDownload:
        'Query download counts for popular frontend frameworks angular, react, vue',
      commandAdd: 'Custom query for any npm package download counts',
      selectPackage: "Which framework's download counts do you want to check?",
      selectTimeRange: 'Select a time range',
      fetchDownload: 'Fetching download counts...',
      fetchFailed: 'Failed to fetch download counts.',
      successDownload: (pkg, date, downloads, start, end) =>
        `${pkg} module downloads for the past ${date} (${start} - ${end}) were ${downloads} times`
    }
  }

  return locales[language] || locales.en
}
