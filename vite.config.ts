import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Production + `vite preview` use GitHub project pages base:
// https://elitenewb.github.io/Random_Group/
// `vite dev` keeps "/" so http://localhost:5173/ works.
// (Preview uses command "serve" but isPreview is true — see Vite ConfigEnv.)
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'serve' && !isPreview ? '/' : '/Random_Group/',
  plugins: [react(), tailwindcss()],
}))
