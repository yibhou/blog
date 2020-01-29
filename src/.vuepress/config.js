
/**
 * 配置文件
 */

const path = require('path')

const resolve = file => path.join(__dirname, file)

module.exports = {
  locales: {
    '/': {
      lang: 'zh-CN',
      // 站点标题
      title: '学习博客',
      // 站点描述
      description: '记录个人学习与成长的点滴'
    },
    '/en/': {
      lang: 'en-US',
      title: 'VuePress'
    }
  },
  // 站点头部
  head: [
    ['meta', { name: 'keywords', content: 'HTML,CSS,JavaScript,Node,React,Vue,VuePress' }]
  ],
  // 永久链接
  permalink: '/:regular',
  // 主题
  // theme: '@vuepress/default',
  themeConfig: {
    // 仓库链接
    repo: 'https://github.com/yibhou/blog',
    // 仓库链接文字
    repoLabel: '',
    // 文档仓库链接
    docsRepo: 'https://github.com/yibhou/blog',
    // 文档仓库分支
    docsBranch: 'master',
    // 文档仓库源文件目录
    docsDir: 'src',
    // 是否使用编辑链接
    editLinks: true,
    // 是否开启页面平滑滚动
    smoothScroll: true,
    // 是否开启内置搜索
    search: false,
    // 最多搜索多少条结果
    searchMaxSuggestions: 10,
    // 是否开启algolia搜索来替换内置搜索功能
    algolia: {
      apiKey: '3a539aab83105f01761a137c61004d85',
      indexName: 'vuepress'
    },
    // 侧边栏是否展示多个页面的标题链接
    displayAllHeaders: false,
    // 侧边栏深度 可选值0|1|2
    sidebarDepth: 2,
    // 是否展示导航栏
    navbar: true,
    // 导航栏logo
    // logo: '/hero.png',
    locales: {
      '/': {
        // 多语言下拉菜单的标题
        selectText: '选择语言',
        // 该语言在下拉菜单中的标签
        label: '简体中文',
        // 编辑链接文字
        editLinkText: '在 GitHub 上编辑此页',
        // 最后更新时间
        lastUpdated: '上次更新',
        // 导航栏
        nav: require('./nav/zh'),
        // 侧边栏
        sidebar: {
          '/docs/': getSidebar(),
          '/': [
            {
              // 分组标题
              title: '分组',
              // 分组是否可折叠
              collapsable: false,
              // 侧边栏深度 可选值0|1|2
              sidebarDepth: 2,
              // 多个页面的标题链接
              children: [
                ['', '首页'],
                // '/docs/hello'
              ]
            }
          ]
        }
      },
      '/en/': {
        selectText: 'Languages',
        ariaLabel: 'Select language',
        label: 'English',
        sidebar: 'auto'
      }
    }
  },

  // 基础路径
  base: '/',
  // 编译目标路径
  dest: 'public',
  // devServer服务
  host: '0.0.0.0',
  // 端口
  port: '9090',
  // 额外监听文件
  extraWatchFiles: [
    '.vuepress/nav/zh.js'
  ],

  // webpack配置
  configureWebpack: {
    resolve: {
      alias: {
        // src目录别名
        '@': resolve('../')
      }
    }
  },
  chainWebpack (config, isServer) {

  },
  alias: {
    // 图片资源目录
    '@images': resolve('./assets/images')
  },
  // DefinePlugin配置
  define () {
    return {
      APP_VERSION: require('../../package.json').version
    }
  },

  // markdown配置
  markdown: {
    // 代码块是否显示行号
    lineNumbers: false,
    // 目录
    toc: {
      includeLevel: [1, 2, 3, 4],
      markerPattern: /^\[TOC\]/m
    },
    // 插件
    plugins: [
      // 'markdown-it-sup',
      // 'markdown-it-sub',
      ['markdown-it-anchor', {
        permalink: true
      }]
    ],
    extendMarkdown: md => {
      md
        .use(require('markdown-it-sup'))
        .use(require('markdown-it-sub'))
    }
  },
  // 插件
  plugins: [
    ['@vuepress/back-to-top', true],
    ['@vuepress/last-updated', {
      // transformer (timestamp, lang) {
      //   const moment = require('moment')
      //   moment.locale(lang)
      //   return moment(timestamp).fromNow()
      // }
    }],
    ['vuepress-plugin-clean-urls', {
      normalSuffix: '',
      indexSuffix: '/',
      notFoundPath: '/404.html'
    }],
    ['container', {
      type: 'tip',
      defaultTitle: {
        '/': '提示',
        '/en/': 'TIP'
      }
    }],
    ['container', {
      type: 'warning',
      defaultTitle: {
        '/': '注意',
        '/en/': 'WARNING'
      }
    }],
    ['container', {
      type: 'danger',
      defaultTitle: {
        '/': '警告',
        '/en/': 'WARNING'
      }
    }],
    ['container', {
      type: 'details',
      before: info => `<details class="custom-block details">${info ? `<summary>${info}</summary>` : ''}\n`,
      after: () => `</details>\n`
    }]
  ]
}

function getSidebar () {
  // return [
  //   'A9系统开发指南',
  //   'hello'
  // ]
  return [
    {
      title: '规范',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        '前端代码规范'
      ]
    }, {
      title: '方案',
      collapsable: false,
      sidebarDepth: 1,
      children: [
        'GitLab'
      ]
    }
  ]
}
