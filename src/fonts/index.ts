import localFont from 'next/font/local'

// Arabic fonts configuration
export const louguiya = localFont({
  src: [
    {
      path: './Louguiya.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Louguiya-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-louguiya',
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
})

// French fonts configuration
export const louguiyaFR = localFont({
  src: [
    {
      path: './LouguiyaFR.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './LouguiyaFR-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-louguiya-fr',
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
})