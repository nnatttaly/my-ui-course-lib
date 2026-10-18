import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), vanillaExtractPlugin()],
  // `vite build --mode lib` собирает библиотеку вместо демо-приложения
  ...(mode === 'lib' && {
    build: {
      outDir: 'dist-lib',
      copyPublicDir: false,
      lib: {
        entry: 'src/index.ts',
        formats: ['es'],
        fileName: 'my-ui-library',
        cssFileName: 'my-ui-library',
      },
      rolldownOptions: {
        external: [/^react(-dom)?(\/|$)/, 'clsx', /^@vanilla-extract\//],
      },
    },
  }),
}))
