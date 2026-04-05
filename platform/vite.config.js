import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@course-calculus': path.resolve(__dirname, '../微积分/src'),
      '@course-ai': path.resolve(__dirname, '../AI技能入门/src'),
      '@course-prompt': path.resolve(__dirname, '../PromptEngineering/src'),
      '@course-cloudflare': path.resolve(__dirname, '../CloudflareMastery/src'),
      '@course-ai-mastery': path.resolve(__dirname, '../AISkillsMastery/src'),
      '@course-skill-eng': path.resolve(__dirname, '../AISkillEngineering/src'),
      '@course-finetune': path.resolve(__dirname, '../LLMFineTuning/src'),
      '@course-quantum': path.resolve(__dirname, '../QuantumMechanics/src'),
      '@course-linux': path.resolve(__dirname, '../LinuxMastery/src'),
      '@course-tcpip': path.resolve(__dirname, '../TCPIPMastery/src'),
      '@course-seo':    path.resolve(__dirname, '../SEOMastery/src'),
      '@course-python': path.resolve(__dirname, '../PythonMastery/src')
    }
  }
})
