import type { SoftwareCategory } from '@/types'

export type { SoftwareItem, SoftwareCategory } from '@/types'

export const softwareCategories: SoftwareCategory[] = [
  {
    name: 'Design',
    items: [
      {
        name: 'Sketch',
        icon: 'i-logos-sketch',
        description: '一款仅Mac端的矢量设计工具。',
        url: 'https://www.sketch.com/',
        recommended: true,
      },
      {
        name: 'Adobe XD',
        icon: 'i-logos-adobe-xd',
        description: 'Adobe 的设计工具。',
        url: 'https://www.adobe.com/hk_zh/products/xd.html',
      },
      {
        name: 'Illustrator',
        icon: 'i-logos-adobe-illustrator',
        description: 'Adobe 的矢量软件。',
        url: 'https://www.adobe.com/hk_zh/products/illustrator.html',
      },
      {
        name: 'Photoshop',
        icon: 'i-logos-adobe-photoshop',
        description: 'Adobe提供的强大图像处理软件。',
        url: 'https://www.adobe.com/hk_zh/products/photoshop.html',
      },
    ],
  },
  {
    name: 'Mind',
    items: [
      {
        name: 'Notion',
        icon: 'i-logos-notion-icon',
        description: '一款集笔记、数据库、看板等功能于一体的生产力工具。',
        url: 'https://www.notion.so/',
        recommended: true,
      }
    ]
  },
  {
    name: 'Development & Tools',
    items: [
      {
        name: 'Visual Studio Code',
        icon: 'i-logos-visual-studio-code',
        description: '微软的代码编辑软件。',
        url: 'https://code.visualstudio.com/',
      },
      {
        name: 'Codex',
        icon: 'i-ooui-logo-codex',
        description: 'OpenAI 的代码生成模型，集成在 GitHub Copilot 中。',
        url: 'https://copilot.github.com/',
      },
      {
        name: 'Android Studio',
        icon: 'i-devicon-androidstudio',
        description: 'Google 的 Android 开发工具。',
        url: 'https://developer.android.com/studio',
      },
      {
        name: 'Xcode',
        icon: 'i-logos-xcode',
        description: 'Apple 的开发工具，主要用于 iOS 开发。',
        url: 'https://developer.apple.com/xcode/',
      },
      {
        name: '微信小程序开发工具',
        icon: 'i-icon-park-weixin-mini-app',
        description: '微信小程序开发工具。',
        url: 'https://mp.weixin.qq.com/',
      },
      {
        name: 'Google Chrome',
        icon: 'i-logos-chrome',
        description: 'Google 的浏览器，插件丰富。',
        url: 'https://www.google.com/chrome/',
      }
    ],
  },
  {
    name: 'Entertainment',
    items: [
      {
        name: 'Bilibili',
        icon: 'i-simple-icons-bilibili',
        description: '哔哩哔哩。',
        url: 'https://www.bilibili.com/',
      },
      {
        name: 'Youtube',
        icon: 'i-logos-youtube-icon',
        description: 'Google 的视频软件。',
        url: 'https://youtube.com',
      },
      {
        name: 'Netflix',
        icon: 'i-logos-netflix',
        description: '海外流媒体视频软件。',
        url: 'https://netflix.com/',
        recommended: true,
      },
      {
        name: 'Telegram',
        icon: 'i-logos-telegram',
        description: '著名的跨平台即时通讯软件。',
        url: 'https://telegram.org/',
      },
      {
        name: 'Spotify',
        icon: 'i-logos-spotify',
        description: '音乐软件。',
        url: 'https://www.spotify.com/',
      }
    ],
  },
]

