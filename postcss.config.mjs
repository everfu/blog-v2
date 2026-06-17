const postcssConfig = {
  plugins: {
    '@unocss/postcss': {
      content: [
        './src/app/**/*.{html,js,ts,jsx,tsx}',
        './src/components/**/*.{html,js,ts,jsx,tsx}',
        './src/features/**/*.{html,js,ts,jsx,tsx}',
        './src/lib/**/*.{html,js,ts,jsx,tsx}',
        './mdx-components.tsx',
      ],
    },
  },
}

export default postcssConfig
