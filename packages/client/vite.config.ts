import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
// @ts-expect-error: something wrong, but I need it
import VueMacros from 'unplugin-vue-macros/vite'
import Layouts from 'vite-plugin-vue-layouts'
import Pages from 'vite-plugin-pages'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue(),
      },
    }),
    AutoImport({
      imports: ['vue', 'vue-router', '@vueuse/core'],
      vueTemplate: true,
      dts: 'auto-imports.d.ts',
    }),
    Components({
      dts: 'components.d.ts',
    }),
    UnoCSS(),
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'Index',
    }),
    Pages(),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
