import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '14 Slots Time Management',
    short_name: '14 Slots',
    description: '14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1E1F22',
    theme_color: '#1E1F22',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
    id: '14slots',
    orientation: 'portrait',
    categories: ['productivity', 'lifestyle'],
    lang: 'ko',
    dir: 'ltr',
    prefer_related_applications: false,
    scope: '/'
  }
} 