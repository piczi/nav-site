import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建种子数据...')

  // 创建分类
  const categories = [
    {
      name: '搜索引擎',
      slug: 'search-engines',
      color: '#3b82f6',
      description: '全球知名搜索引擎',
    },
    {
      name: '社交媒体',
      slug: 'social-media',
      color: '#8b5cf6',
      description: '国内外主流社交平台',
    },
    {
      name: '开发工具',
      slug: 'dev-tools',
      color: '#10b981',
      description: '开发者常用工具和平台',
    },
    {
      name: '在线学习',
      slug: 'learning',
      color: '#f59e0b',
      description: '优质在线学习平台',
    },
    {
      name: '新闻资讯',
      slug: 'news',
      color: '#ef4444',
      description: '国内外主流新闻媒体',
    },
  ]

  for (const cat of categories) {
    await prisma.category.create({
      data: cat,
    })
  }
  console.log(`创建了 ${categories.length} 个分类`)

  // 获取所有分类
  const allCategories = await prisma.category.findMany()
  const getCategoryId = (slug: string) => {
    const cat = allCategories.find(c => c.slug === slug)
    return cat?.id || allCategories[0].id
  }

  // 创建网站
  const websites = [
    {
      title: 'Google',
      url: 'https://www.google.com',
      description: '全球最大的搜索引擎',
      categorySlug: 'search-engines',
      isFeatured: true,
      clickCount: 1500,
    },
    {
      title: 'Bing',
      url: 'https://www.bing.com',
      description: '微软搜索引擎，AI功能强大',
      categorySlug: 'search-engines',
      isFeatured: true,
      clickCount: 800,
    },
    {
      title: '百度',
      url: 'https://www.baidu.com',
      description: '中国最大的搜索引擎',
      categorySlug: 'search-engines',
      isFeatured: true,
      clickCount: 2000,
    },
    {
      title: 'GitHub',
      url: 'https://github.com',
      description: '全球最大的代码托管平台',
      categorySlug: 'dev-tools',
      isFeatured: true,
      clickCount: 1200,
    },
    {
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      description: '程序员问答社区',
      categorySlug: 'dev-tools',
      clickCount: 900,
    },
    {
      title: 'Twitter/X',
      url: 'https://twitter.com',
      description: '全球知名社交媒体平台',
      categorySlug: 'social-media',
      isFeatured: true,
      clickCount: 1100,
    },
    {
      title: '微信网页版',
      url: 'https://wx.qq.com',
      description: '微信网页版登录',
      categorySlug: 'social-media',
      clickCount: 1500,
    },
    {
      title: 'Coursera',
      url: 'https://www.coursera.org',
      description: '全球知名在线教育平台',
      categorySlug: 'learning',
      clickCount: 600,
    },
    {
      title: '中国大学MOOC',
      url: 'https://www.icourse163.org',
      description: '中国知名在线学习平台',
      categorySlug: 'learning',
      clickCount: 800,
    },
    {
      title: 'BBC News',
      url: 'https://www.bbc.com/news',
      description: 'BBC新闻',
      categorySlug: 'news',
      clickCount: 700,
    },
    {
      title: '新浪新闻',
      url: 'https://news.sina.com.cn',
      description: '新浪新闻中心',
      categorySlug: 'news',
      clickCount: 1000,
    },
  ]

  for (const site of websites) {
    await prisma.website.create({
      data: {
        title: site.title,
        url: site.url,
        description: site.description,
        categoryId: getCategoryId(site.categorySlug),
        isFeatured: site.isFeatured || false,
        clickCount: site.clickCount || 0,
        isShow: true,
      },
    })
  }
  console.log(`创建了 ${websites.length} 个网站`)

  console.log('种子数据创建完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
