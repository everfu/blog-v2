import type { AlbumCategory } from '@/types'

export type { AlbumCategory, AlbumPhoto } from '@/types'

export const albumCategories: AlbumCategory[] = [
  {
    name: 'daily',
    label: 'DAILY',
    image: 'https://cdn.lightxi.com/cloudreve/uploads/2025/12/02/znXNlPOB_photo-1506905925346-21bda4d32df4.jpeg',
    list: []
  },
  {
    name: 'landscape',
    label: 'LANDSCAPE',
    image: 'https://cdn.lightxi.com/cloudreve/uploads/2025/12/02/TqvUXcGi_photo-1501594907352-04cda38ebc29.jpeg',
  },
  {
    name: 'portrait',
    label: 'PORTRAIT',
    image: 'https://cdn.lightxi.com/cloudreve/uploads/2025/12/02/ikUprqQG_photo-1441974231531-c6227db76b6e.jpeg',
    list: [
      {
        label: '四兄弟',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/2PJxKeDW_38c6060513707fd34d5be3792f27fa7e.HEIC'
      },
      {
        label: '朋友合照',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/7VrDkck6_a1277ea74dcca2742acc4bab7f606b0c.JPG'
      },
      {
        label: '朋友合照',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/w3MQpC7r_IMG_4376.HEIC'
      },
      {
        label: '演讲',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/Ba3x0jrB_6c0863288a39b91e4826141c499db09e.JPG'
      },
      {
        label: '橘子洲头',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/kxAAiWaG_b548aa01244983ff48bc11dc85a3a1cf.JPG'
      }
    ]
  },
  {
    name: 'food',
    label: 'FOOD',
    image: 'https://cdn.lightxi.com/cloudreve/uploads/2025/12/02/4bluhWPO_photo-1504674900247-0877df9cc836.jpeg',
  },
  {
    name: 'travel',
    label: 'TRAVEL',
    image: 'https://cdn.lightxi.com/cloudreve/uploads/2025/12/02/JkyZ5FzL_photo-1469854523086-cc02fe5d8800.jpeg',
    list: [
      {
        label: '鄱阳湖畔',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/H3MZQAVx_IMG20250930181531.JPG'
      },
      {
        label: '武功山',
        image: 'https://cdn.lightxi.com/cloudreve/uploads/2026/06/05/5Ss8HlpQ_dji_mimo_20250617_053224_20250617053224_1750132940985_photo.JPG'
      }
    ]
  },
]
