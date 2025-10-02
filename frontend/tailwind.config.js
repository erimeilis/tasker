import tailwindcss from 'tailwindcss'

export default [
  tailwindcss({
    content: [
      './pages/**/*.{ts,tsx}',
      './components/**/*.{ts,tsx}',
      './app/**/*.{ts,tsx}',
      './src/**/*.{ts,tsx}',
    ],
  }),
]
