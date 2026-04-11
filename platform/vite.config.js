import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
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
      '@course-python': path.resolve(__dirname, '../PythonMastery/src'),
      '@course-devops':  path.resolve(__dirname, '../DockerK8sMastery/src'),
      '@course-db':      path.resolve(__dirname, '../DatabaseMastery/src'),
      '@course-nginx':   path.resolve(__dirname, '../NginxMastery/src'),
      '@course-pyad':    path.resolve(__dirname, '../PythonAdvanced/src'),
      '@course-cloud':   path.resolve(__dirname, '../CloudNative/src'),
      '@course-sec':     path.resolve(__dirname, '../SecurityMastery/src'),
      '@course-llm':     path.resolve(__dirname, '../LLMMastery/src'),
      '@course-de':      path.resolve(__dirname, '../DataEngineering/src'),
      '@course-cicd':    path.resolve(__dirname, '../CICDMastery/src'),
      '@course-sd':      path.resolve(__dirname, '../SystemDesign/src'),
      '@course-arch':    path.resolve(__dirname, '../CompArch/src'),
      '@course-web3':    path.resolve(__dirname, '../BlockchainWeb3/src'),
      '@course-perf':    path.resolve(__dirname, '../PerfOptimization/src'),
      '@course-ai-api':  path.resolve(__dirname, '../AIAPIMastery/src'),
      '@course-ml-eng':  path.resolve(__dirname, '../MLEngineering/src'),
      '@course-da':      path.resolve(__dirname, '../DataAnalysis/src'),
      '@course-agent':   path.resolve(__dirname, '../AIAgentEngineering/src'),
      '@course-algo':    path.resolve(__dirname, '../AlgoInterview/src'),
      '@course-pm':      path.resolve(__dirname, '../PMAIMastery/src'),
      '@course-llmpd':   path.resolve(__dirname, '../LLMProductDesign/src'),
      '@course-omft':    path.resolve(__dirname, '../OpenModelFinetune/src'),
      '@course-rt':      path.resolve(__dirname, '../ReactTypeScript/src'),
      '@course-ase':     path.resolve(__dirname, '../AIStrategyExecutive/src'),
      '@course-rag':     path.resolve(__dirname, '../RAGEngineering/src'),
      '@course-k8s':     path.resolve(__dirname, '../KubernetesOps/src'),
      '@course-aae':     path.resolve(__dirname, '../AIAgentEngineering/src'),
      '@course-lfp':     path.resolve(__dirname, '../LLMFinetunePro/src'),
      '@course-nns':     path.resolve(__dirname, '../NodeNestJS/src'),
      '@course-aif':     path.resolve(__dirname, '../AIInfra/src'),
      '@course-dss':     path.resolve(__dirname, '../DesignSystem/src'),
      '@course-wae':     path.resolve(__dirname, '../WasmEdge/src'),
      '@course-btd':     path.resolve(__dirname, '../BlueTeam/src'),
      '@course-osc':     path.resolve(__dirname, '../OpenSourceContrib/src'),
      '@course-tse':     path.resolve(__dirname, '../TestingEngineering/src'),
      '@course-pgm':     path.resolve(__dirname, '../PostgreSQLMastery/src'),
      '@course-obe':     path.resolve(__dirname, '../ObservabilityEngineering/src')
    }
  }
})
