
module.exports = (themeConfig, ctx) => {
  Object.assign(themeConfig, {
    dateFormat: 'YYYY-MM-DD',
    summary: false,
    summaryLength: 200,
    pwa: {
      serviceWorker: true,
      updatePopup: true
    }
  })

  return {
    // 默认主题
    // extend: '@vuepress/theme-default',

    extend: '@vuepress/theme-blog',
    plugins: [
      ['@vuepress/blog', {
        globalPagination: {
          lengthPerPage: 10,
          // prevText: 'Prev',
          // nextText: 'Next',
          // layout: 'DirectoryPagination'
        },
        directories: [{
          // 唯一分类标识
          id: 'post',
          // 分类目录
          dirname: '_posts',
          // 分类路径
          path: '/post/',
          // 分类标题
          title: 'Post',
          // 永久链接
          itemPermalink: '/post/:year/:month/:day/:slug',
          // 分页
          pagination: {
            lengthPerPage: 2,
            getPaginationPageTitle (pageNumber) {
              return `Page ${pageNumber} | Post`
            }
          },
          // 默认布局组件
          // layout: 'IndexPost',
          // itemLayout: 'Post'
        }],
        frontmatters: [{
          // 唯一分类标识
          id: 'tag',
          // frontmatter键名
          keys: ['tag', 'tags'],
          // 分类路径
          path: '/tag/',
          // 分类标题
          title: '',
          // entry的frontmatter配置
          frontmatter: {
            metaTitle: '标签列表'
          },
          // 分页
          pagination: {
            lengthPerPage: 2,
            getPaginationPageTitle (pageNumber, key) {
              return `Page ${pageNumber} | ${key}`
            }
          },
          // 默认布局组件
          // layout: 'FrontmatterKey',
          // scopeLayout: 'FrontmatterPagination'
        }],
        // 搜索引擎优化
        sitemap: {
          hostname: 'https://mjazz.xyz'
        },
        // 评论
        comment: {
          service: 'vssue',
          platform: 'github-v4',
          owner: 'yibhou',
          repo: 'blog',
          clientId: '59512f7178946aed4ff6',
          clientSecret: '0bee803ce292455f27bf26f57cb2c22938d35391'
        },
        // 邮件订阅
        newsletter: {
          // mailchimp endpoint
          endpoint: 'https://billyyyyy3320.us4.list-manage.com/subscribe/post?u=4905113ee00d8210c2004e038&amp;id=bd18d40138',
          title: '邮件订阅',
          content: '接收最新文章的更新通知~',
          submitText: '订阅'
        },
        feed: {
          canonical_base: 'https://mjazz.xyz'
        }
      }]
    ]
  }
}
