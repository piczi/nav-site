import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { CategoriesProvider } from '@/components/categories-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '导航站点 - 发现优质网站',
  description: '收录国内外知名网站，提供快捷的网址导航服务',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CategoriesProvider>
            {children}
          </CategoriesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
