import { lazy } from 'react';
import calculusManifest from '@course-calculus/../course.manifest.json';
import aiSkillsManifest from '@course-ai/../course.manifest.json';
import promptCampManifest from '@course-prompt/../course.manifest.json';
import cloudflareManifest from '@course-cloudflare/../course.manifest.json';
import aiMasteryManifest from '@course-ai-mastery/../course.manifest.json';
import aiSkillEngManifest from '@course-skill-eng/../course.manifest.json';
import fineTuneManifest from '@course-finetune/../course.manifest.json';
import quantumManifest from '@course-quantum/../course.manifest.json';
import linuxManifest from '@course-linux/../course.manifest.json';
import tcpipManifest from '@course-tcpip/../course.manifest.json';
import seoManifest from '@course-seo/../course.manifest.json';
import pythonManifest from '@course-python/../course.manifest.json';
import devopsManifest from '@course-devops/../course.manifest.json';
import dbManifest from '@course-db/../course.manifest.json';
import nginxManifest from '@course-nginx/../course.manifest.json';
import pyAdvManifest from '@course-pyad/../course.manifest.json';
import cloudManifest from '@course-cloud/../course.manifest.json';
import secManifest from '@course-sec/../course.manifest.json';
import llmManifest from '@course-llm/../course.manifest.json';
import deManifest from '@course-de/../course.manifest.json';
import cicdManifest from '@course-cicd/../course.manifest.json';
import sdManifest from '@course-sd/../course.manifest.json';
import archManifest from '@course-arch/../course.manifest.json';
import web3Manifest from '@course-web3/../course.manifest.json';
import perfManifest from '@course-perf/../course.manifest.json';
import aiApiManifest from '@course-ai-api/../course.manifest.json';
import mlEngManifest from '@course-ml-eng/../course.manifest.json';
import daManifest    from '@course-da/../course.manifest.json';
import agentManifest from '@course-agent/../course.manifest.json';
import algoManifest  from '@course-algo/../course.manifest.json';
import pmManifest    from '@course-pm/../course.manifest.json';
import llmpdManifest from '@course-llmpd/../course.manifest.json';
import omftManifest  from '@course-omft/../course.manifest.json';

// Simple registry mapping course manifest to its lazy-loaded components
export const courseRegistry = {
  'calculus-intuition': {
    manifest: calculusManifest,
    components: {
      LessonLimits: lazy(() => import('@course-calculus/pages/LessonLimits')),
      LessonDerivatives: lazy(() => import('@course-calculus/pages/LessonDerivatives')),
      LessonIntegrals: lazy(() => import('@course-calculus/pages/LessonIntegrals'))
    }
  },
  'ai-skills-mastery': {
    manifest: aiSkillsManifest,
    components: {
      LessonFamily: lazy(() => import('@course-ai/pages/LessonFamily')),
      LessonCooking: lazy(() => import('@course-ai/pages/LessonCooking')),
      LessonLearning: lazy(() => import('@course-ai/pages/LessonLearning')),
      LessonJargon: lazy(() => import('@course-ai/pages/LessonJargon')),
      LessonLimits: lazy(() => import('@course-ai/pages/LessonLimits'))
    }
  },
  'prompt-engineering-camp': {
    manifest: promptCampManifest,
    components: {
      LessonIcebreaker: lazy(() => import('@course-prompt/pages/LessonIcebreaker')),
      LessonFrameworks: lazy(() => import('@course-prompt/pages/LessonFrameworks')),
      LessonLimitsBreak: lazy(() => import('@course-prompt/pages/LessonLimitsBreak')),
      LessonScenarios: lazy(() => import('@course-prompt/pages/LessonScenarios')),
      LessonEnterprise: lazy(() => import('@course-prompt/pages/LessonEnterprise')),
      LessonWorkshop: lazy(() => import('@course-prompt/pages/LessonWorkshop'))
    }
  },
  'cloudflare-mastery': {
    manifest: cloudflareManifest,
    components: {
      LessonArchitecture: lazy(() => import('@course-cloudflare/pages/LessonArchitecture')),
      LessonPerformance: lazy(() => import('@course-cloudflare/pages/LessonPerformance')),
      LessonSecurity: lazy(() => import('@course-cloudflare/pages/LessonSecurity')),
      LessonZeroTrust: lazy(() => import('@course-cloudflare/pages/LessonZeroTrust')),
      LessonEdge: lazy(() => import('@course-cloudflare/pages/LessonEdge')),
      LessonSRE: lazy(() => import('@course-cloudflare/pages/LessonSRE')),
      LessonLabs: lazy(() => import('@course-cloudflare/pages/LessonLabs')),
      LessonAI: lazy(() => import('@course-cloudflare/pages/LessonAI')),
      LessonHA: lazy(() => import('@course-cloudflare/pages/LessonHA')),
      LessonNetwork: lazy(() => import('@course-cloudflare/pages/LessonNetwork'))
    }
  },
  'ai-skills-mastery-pro': {
    manifest: aiMasteryManifest,
    components: {
      LessonFoundation: lazy(() => import('@course-ai-mastery/pages/LessonFoundation')),
      LessonPrompt: lazy(() => import('@course-ai-mastery/pages/LessonPrompt')),
      LessonWriting: lazy(() => import('@course-ai-mastery/pages/LessonWriting')),
      LessonCoding: lazy(() => import('@course-ai-mastery/pages/LessonCoding')),
      LessonData: lazy(() => import('@course-ai-mastery/pages/LessonData')),
      LessonAutomation: lazy(() => import('@course-ai-mastery/pages/LessonAutomation')),
      LessonCreative: lazy(() => import('@course-ai-mastery/pages/LessonCreative')),
      LessonBuild: lazy(() => import('@course-ai-mastery/pages/LessonBuild'))
    }
  },
  'ai-skill-engineering': {
    manifest: aiSkillEngManifest,
    components: {
      LessonOverview: lazy(() => import('@course-skill-eng/pages/LessonOverview')),
      LessonStructure: lazy(() => import('@course-skill-eng/pages/LessonStructure')),
      LessonTDD: lazy(() => import('@course-skill-eng/pages/LessonTDD')),
      LessonGallery: lazy(() => import('@course-skill-eng/pages/LessonGallery')),
      LessonWorkshop: lazy(() => import('@course-skill-eng/pages/LessonWorkshop')),
      LessonDeploy: lazy(() => import('@course-skill-eng/pages/LessonDeploy'))
    }
  },
  'llm-finetuning-mastery': {
    manifest: fineTuneManifest,
    components: {
      LessonFoundation: lazy(() => import('@course-finetune/pages/LessonFoundation')),
      LessonData: lazy(() => import('@course-finetune/pages/LessonData')),
      LessonSFT: lazy(() => import('@course-finetune/pages/LessonSFT')),
      LessonPEFT: lazy(() => import('@course-finetune/pages/LessonPEFT')),
      LessonRLHF: lazy(() => import('@course-finetune/pages/LessonRLHF')),
      LessonInfra: lazy(() => import('@course-finetune/pages/LessonInfra')),
      LessonEval: lazy(() => import('@course-finetune/pages/LessonEval')),
      LessonDeploy: lazy(() => import('@course-finetune/pages/LessonDeploy'))
    }
  },
  'quantum-mechanics-intro': {
    manifest: quantumManifest,
    components: {
      LessonRevolution: lazy(() => import('@course-quantum/pages/LessonRevolution')),
      LessonDuality: lazy(() => import('@course-quantum/pages/LessonDuality')),
      LessonUncertainty: lazy(() => import('@course-quantum/pages/LessonUncertainty')),
      LessonSchrodinger: lazy(() => import('@course-quantum/pages/LessonSchrodinger')),
      LessonEntanglement: lazy(() => import('@course-quantum/pages/LessonEntanglement')),
      LessonTunneling: lazy(() => import('@course-quantum/pages/LessonTunneling')),
      LessonFuture: lazy(() => import('@course-quantum/pages/LessonFuture'))
    }
  },
  'linux-mastery': {
    manifest: linuxManifest,
    components: {
      LessonPhilosophy:  lazy(() => import('@course-linux/pages/LessonPhilosophy')),
      LessonShell:       lazy(() => import('@course-linux/pages/LessonShell')),
      LessonFilesystem:  lazy(() => import('@course-linux/pages/LessonFilesystem')),
      LessonProcess:     lazy(() => import('@course-linux/pages/LessonProcess')),
      LessonNetwork:     lazy(() => import('@course-linux/pages/LessonNetwork')),
      LessonStorage:     lazy(() => import('@course-linux/pages/LessonStorage')),
      LessonSysadmin:    lazy(() => import('@course-linux/pages/LessonSysadmin')),
      LessonPerformance: lazy(() => import('@course-linux/pages/LessonPerformance'))
    }
  },
  'tcpip-mastery': {
    manifest: tcpipManifest,
    components: {
      LessonOverview:     lazy(() => import('@course-tcpip/pages/LessonOverview')),
      LessonModel:        lazy(() => import('@course-tcpip/pages/LessonModel')),
      LessonIP:           lazy(() => import('@course-tcpip/pages/LessonIP')),
      LessonTCP:          lazy(() => import('@course-tcpip/pages/LessonTCP')),
      LessonUDP:          lazy(() => import('@course-tcpip/pages/LessonUDP')),
      LessonApplication:  lazy(() => import('@course-tcpip/pages/LessonApplication')),
      LessonSecurity:     lazy(() => import('@course-tcpip/pages/LessonSecurity')),
      LessonDiagnosis:    lazy(() => import('@course-tcpip/pages/LessonDiagnosis')),
    }
  },
  'seo-mastery': {
    manifest: seoManifest,
    components: {
      LessonFoundation: lazy(() => import('@course-seo/pages/LessonFoundation')),
      LessonKeyword:    lazy(() => import('@course-seo/pages/LessonKeyword')),
      LessonTechnical:  lazy(() => import('@course-seo/pages/LessonTechnical')),
      LessonOnPage:     lazy(() => import('@course-seo/pages/LessonOnPage')),
      LessonOffPage:    lazy(() => import('@course-seo/pages/LessonOffPage')),
      LessonContent:    lazy(() => import('@course-seo/pages/LessonContent')),
      LessonAnalytics:  lazy(() => import('@course-seo/pages/LessonAnalytics')),
      LessonCase:       lazy(() => import('@course-seo/pages/LessonCase')),
    }
  },
  'python-mastery': {
    manifest: pythonManifest,
    components: {
      LessonBasics:       lazy(() => import('@course-python/pages/LessonBasics')),
      LessonFunctions:    lazy(() => import('@course-python/pages/LessonFunctions')),
      LessonOOP:          lazy(() => import('@course-python/pages/LessonOOP')),
      LessonDataIO:       lazy(() => import('@course-python/pages/LessonDataIO')),
      LessonStdLib:       lazy(() => import('@course-python/pages/LessonStdLib')),
      LessonConcurrent:   lazy(() => import('@course-python/pages/LessonConcurrent')),
      LessonDataScience:  lazy(() => import('@course-python/pages/LessonDataScience')),
      LessonProjects:     lazy(() => import('@course-python/pages/LessonProjects')),
    }
  },
  'devops-mastery': {
    manifest: devopsManifest,
    components: {
      LessonContainers:    lazy(() => import('@course-devops/pages/LessonContainers')),
      LessonDocker:        lazy(() => import('@course-devops/pages/LessonDocker')),
      LessonDockerfile:    lazy(() => import('@course-devops/pages/LessonDockerfile')),
      LessonCompose:       lazy(() => import('@course-devops/pages/LessonCompose')),
      LessonK8sCore:       lazy(() => import('@course-devops/pages/LessonK8sCore')),
      LessonK8sAdvanced:   lazy(() => import('@course-devops/pages/LessonK8sAdvanced')),
      LessonObservability: lazy(() => import('@course-devops/pages/LessonObservability')),
      LessonProduction:    lazy(() => import('@course-devops/pages/LessonProduction')),
    }
  },
  'database-mastery': {
    manifest: dbManifest,
    components: {
      LessonFundamentals:  lazy(() => import('@course-db/pages/LessonFundamentals')),
      LessonMySQL:         lazy(() => import('@course-db/pages/LessonMySQL')),
      LessonSQLAdvanced:   lazy(() => import('@course-db/pages/LessonSQLAdvanced')),
      LessonIndex:         lazy(() => import('@course-db/pages/LessonIndex')),
      LessonRedis:         lazy(() => import('@course-db/pages/LessonRedis')),
      LessonRedisAdvanced: lazy(() => import('@course-db/pages/LessonRedisAdvanced')),
      LessonDesign:        lazy(() => import('@course-db/pages/LessonDesign')),
      LessonProjects:      lazy(() => import('@course-db/pages/LessonProjects')),
    }
  },
  'nginx-mastery': {
    manifest: nginxManifest,
    components: {
      LessonNginxCore:     lazy(() => import('@course-nginx/pages/LessonNginxCore')),
      LessonConfig:        lazy(() => import('@course-nginx/pages/LessonConfig')),
      LessonProxy:         lazy(() => import('@course-nginx/pages/LessonProxy')),
      LessonSSL:           lazy(() => import('@course-nginx/pages/LessonSSL')),
      LessonMicroservices: lazy(() => import('@course-nginx/pages/LessonMicroservices')),
      LessonGateway:       lazy(() => import('@course-nginx/pages/LessonGateway')),
      LessonPerformance:   lazy(() => import('@course-nginx/pages/LessonPerformance')),
      LessonProduction:    lazy(() => import('@course-nginx/pages/LessonProduction')),
    }
  },
  'python-advanced': {
    manifest: pyAdvManifest,
    components: {
      LessonAsyncCore:     lazy(() => import('@course-pyad/pages/LessonAsyncCore')),
      LessonAsyncPatterns: lazy(() => import('@course-pyad/pages/LessonAsyncPatterns')),
      LessonFastAPIBasics: lazy(() => import('@course-pyad/pages/LessonFastAPIBasics')),
      LessonFastAPIAuth:   lazy(() => import('@course-pyad/pages/LessonFastAPIAuth')),
      LessonFastAPIDB:     lazy(() => import('@course-pyad/pages/LessonFastAPIDB')),
      LessonTDD:           lazy(() => import('@course-pyad/pages/LessonTDD')),
      LessonPerformance:   lazy(() => import('@course-pyad/pages/LessonPerformance')),
      LessonProjects:      lazy(() => import('@course-pyad/pages/LessonProjects')),
    }
  },
  'cloud-native': {
    manifest: cloudManifest,
    components: {
      LessonCloudCore:      lazy(() => import('@course-cloud/pages/LessonCloudCore')),
      LessonAWSCore:        lazy(() => import('@course-cloud/pages/LessonAWSCore')),
      LessonGCPCore:        lazy(() => import('@course-cloud/pages/LessonGCPCore')),
      LessonServerless:     lazy(() => import('@course-cloud/pages/LessonServerless')),
      LessonContainerCloud: lazy(() => import('@course-cloud/pages/LessonContainerCloud')),
      LessonIaC:            lazy(() => import('@course-cloud/pages/LessonIaC')),
      LessonCostObs:        lazy(() => import('@course-cloud/pages/LessonCostObs')),
      LessonProduction:     lazy(() => import('@course-cloud/pages/LessonProduction')),
    }
  },
  'security-pentest': {
    manifest: secManifest,
    components: {
      LessonSecCore:  lazy(() => import('@course-sec/pages/LessonSecCore')),
      LessonWebSec:   lazy(() => import('@course-sec/pages/LessonWebSec')),
      LessonSQLi:     lazy(() => import('@course-sec/pages/LessonSQLi')),
      LessonXSSCSRF:  lazy(() => import('@course-sec/pages/LessonXSSCSRF')),
      LessonRecon:    lazy(() => import('@course-sec/pages/LessonRecon')),
      LessonPrivesc:  lazy(() => import('@course-sec/pages/LessonPrivesc')),
      LessonCrypto:   lazy(() => import('@course-sec/pages/LessonCrypto')),
      LessonDefense:  lazy(() => import('@course-sec/pages/LessonDefense')),
    }
  },
  'llm-dev': {
    manifest: llmManifest,
    components: {
      LessonLLMCore:     lazy(() => import('@course-llm/pages/LessonLLMCore')),
      LessonPrompting:   lazy(() => import('@course-llm/pages/LessonPrompting')),
      LessonRAGBasics:   lazy(() => import('@course-llm/pages/LessonRAGBasics')),
      LessonRAGAdvanced: lazy(() => import('@course-llm/pages/LessonRAGAdvanced')),
      LessonAgent:       lazy(() => import('@course-llm/pages/LessonAgent')),
      LessonFinetune:    lazy(() => import('@course-llm/pages/LessonFinetune')),
      LessonDeploy:      lazy(() => import('@course-llm/pages/LessonDeploy')),
      LessonProject:     lazy(() => import('@course-llm/pages/LessonProject')),
    }
  },
  'data-engineering': {
    manifest: deManifest,
    components: {
      LessonDataArch:    lazy(() => import('@course-de/pages/LessonDataArch')),
      LessonKafka:       lazy(() => import('@course-de/pages/LessonKafka')),
      LessonKafkaStreams: lazy(() => import('@course-de/pages/LessonKafkaStreams')),
      LessonFlink:       lazy(() => import('@course-de/pages/LessonFlink')),
      LessonSpark:       lazy(() => import('@course-de/pages/LessonSpark')),
      LessonPipeline:    lazy(() => import('@course-de/pages/LessonPipeline')),
      LessonMonitor:     lazy(() => import('@course-de/pages/LessonMonitor')),
      LessonProject:     lazy(() => import('@course-de/pages/LessonProject')),
    }
  },
  'cicd-gitops': {
    manifest: cicdManifest,
    components: {
      LessonCICDCore:     lazy(() => import('@course-cicd/pages/LessonCICDCore')),
      LessonGitActions:   lazy(() => import('@course-cicd/pages/LessonGitActions')),
      LessonDockerBuild:  lazy(() => import('@course-cicd/pages/LessonDockerBuild')),
      LessonHelmChart:    lazy(() => import('@course-cicd/pages/LessonHelmChart')),
      LessonArgoCD:       lazy(() => import('@course-cicd/pages/LessonArgoCD')),
      LessonKubeDeploy:   lazy(() => import('@course-cicd/pages/LessonKubeDeploy')),
      LessonMonitorAlert: lazy(() => import('@course-cicd/pages/LessonMonitorAlert')),
      LessonProject:      lazy(() => import('@course-cicd/pages/LessonProject')),
    }
  },
  'system-design': {
    manifest: sdManifest,
    components: {
      LessonFundamentals: lazy(() => import('@course-sd/pages/LessonFundamentals')),
      LessonHighAvail:    lazy(() => import('@course-sd/pages/LessonHighAvail')),
      LessonCache:        lazy(() => import('@course-sd/pages/LessonCache')),
      LessonMQ:           lazy(() => import('@course-sd/pages/LessonMQ')),
      LessonDatabase:     lazy(() => import('@course-sd/pages/LessonDatabase')),
      LessonDistributed:  lazy(() => import('@course-sd/pages/LessonDistributed')),
      LessonMicroservice: lazy(() => import('@course-sd/pages/LessonMicroservice')),
      LessonInterview:    lazy(() => import('@course-sd/pages/LessonInterview')),
    }
  },
  'computer-arch': {
    manifest: archManifest,
    components: {
      LessonOverview:  lazy(() => import('@course-arch/pages/LessonOverview')),
      LessonDigital:   lazy(() => import('@course-arch/pages/LessonDigital')),
      LessonISA:       lazy(() => import('@course-arch/pages/LessonISA')),
      LessonPipeline:  lazy(() => import('@course-arch/pages/LessonPipeline')),
      LessonCache:     lazy(() => import('@course-arch/pages/LessonCache')),
      LessonMemory:    lazy(() => import('@course-arch/pages/LessonMemory')),
      LessonIO:        lazy(() => import('@course-arch/pages/LessonIO')),
      LessonParallel:  lazy(() => import('@course-arch/pages/LessonParallel')),
    }
  },
  'blockchain-web3': {
    manifest: web3Manifest,
    components: {
      LessonFoundation: lazy(() => import('@course-web3/pages/LessonFoundation')),
      LessonSolidity:   lazy(() => import('@course-web3/pages/LessonSolidity')),
      LessonDeFi:       lazy(() => import('@course-web3/pages/LessonDeFi')),
      LessonNFT:        lazy(() => import('@course-web3/pages/LessonNFT')),
      LessonSecurity:   lazy(() => import('@course-web3/pages/LessonSecurity')),
      LessonOracle:     lazy(() => import('@course-web3/pages/LessonOracle')),
      LessonLayer2:     lazy(() => import('@course-web3/pages/LessonLayer2')),
      LessonFullstack:  lazy(() => import('@course-web3/pages/LessonFullstack')),
    }
  },
  'perf-optimization': {
    manifest: perfManifest,
    components: {
      LessonFoundation: lazy(() => import('@course-perf/pages/LessonFoundation')),
      LessonLinux:      lazy(() => import('@course-perf/pages/LessonLinux')),
      LessonPython:     lazy(() => import('@course-perf/pages/LessonPython')),
      LessonJavaScript: lazy(() => import('@course-perf/pages/LessonJavaScript')),
      LessonDatabase:   lazy(() => import('@course-perf/pages/LessonDatabase')),
      LessonAPM:        lazy(() => import('@course-perf/pages/LessonAPM')),
      LessonMemory:     lazy(() => import('@course-perf/pages/LessonMemory')),
      LessonStress:     lazy(() => import('@course-perf/pages/LessonStress')),
    }
  },
  'ai-api-mastery': {
    manifest: aiApiManifest,
    components: {
      LessonBasics:     lazy(() => import('@course-ai-api/pages/LessonBasics')),
      LessonOpenAI:     lazy(() => import('@course-ai-api/pages/LessonOpenAI')),
      LessonGemini:     lazy(() => import('@course-ai-api/pages/LessonGemini')),
      LessonClaude:     lazy(() => import('@course-ai-api/pages/LessonClaude')),
      LessonPrompt:     lazy(() => import('@course-ai-api/pages/LessonPrompt')),
      LessonStreaming:  lazy(() => import('@course-ai-api/pages/LessonStreaming')),
      LessonRouting:    lazy(() => import('@course-ai-api/pages/LessonRouting')),
      LessonProduction: lazy(() => import('@course-ai-api/pages/LessonProduction')),
    }
  },
  'ml-engineering': {
    manifest: mlEngManifest,
    components: {
      LessonMLFoundation: lazy(() => import('@course-ml-eng/pages/LessonMLFoundation')),
      LessonPyTorch:      lazy(() => import('@course-ml-eng/pages/LessonPyTorch')),
      LessonCNN:          lazy(() => import('@course-ml-eng/pages/LessonCNN')),
      LessonTransformer:  lazy(() => import('@course-ml-eng/pages/LessonTransformer')),
      LessonFineTuning:   lazy(() => import('@course-ml-eng/pages/LessonFineTuning')),
      LessonMLOps:        lazy(() => import('@course-ml-eng/pages/LessonMLOps')),
      LessonServing:      lazy(() => import('@course-ml-eng/pages/LessonServing')),
      LessonMonitoring:   lazy(() => import('@course-ml-eng/pages/LessonMonitoring')),
    }
  },
  'data-analysis': {
    manifest: daManifest,
    components: {
      LessonPandasCore:   lazy(() => import('@course-da/pages/LessonPandasCore')),
      LessonSQLAnalytics: lazy(() => import('@course-da/pages/LessonSQLAnalytics')),
      LessonPlotlyViz:    lazy(() => import('@course-da/pages/LessonPlotlyViz')),
      LessonStatsAB:      lazy(() => import('@course-da/pages/LessonStatsAB')),
      LessonUserBehavior: lazy(() => import('@course-da/pages/LessonUserBehavior')),
      LessonBusinessDash: lazy(() => import('@course-da/pages/LessonBusinessDash')),
      LessonMLAnalysis:   lazy(() => import('@course-da/pages/LessonMLAnalysis')),
      LessonCaseStudy:    lazy(() => import('@course-da/pages/LessonCaseStudy')),
    }
  },
  'ai-agent-engineering': {
    manifest: agentManifest,
    components: {
      LessonAgentCore:    lazy(() => import('@course-agent/pages/LessonAgentCore')),
      LessonLangChain:    lazy(() => import('@course-agent/pages/LessonLangChain')),
      LessonToolCalling:  lazy(() => import('@course-agent/pages/LessonToolCalling')),
      LessonMemory:       lazy(() => import('@course-agent/pages/LessonMemory')),
      LessonLangGraph:    lazy(() => import('@course-agent/pages/LessonLangGraph')),
      LessonMultiAgent:   lazy(() => import('@course-agent/pages/LessonMultiAgent')),
      LessonAgentSafety:  lazy(() => import('@course-agent/pages/LessonAgentSafety')),
      LessonAgentProject: lazy(() => import('@course-agent/pages/LessonAgentProject')),
    }
  },
  'algo-interview': {
    manifest: algoManifest,
    components: {
      LessonArrayPtr:     lazy(() => import('@course-algo/pages/LessonArrayPtr')),
      LessonLinkedTree:   lazy(() => import('@course-algo/pages/LessonLinkedTree')),
      LessonStackQueue:   lazy(() => import('@course-algo/pages/LessonStackQueue')),
      LessonHashString:   lazy(() => import('@course-algo/pages/LessonHashString')),
      LessonBinarySearch: lazy(() => import('@course-algo/pages/LessonBinarySearch')),
      LessonDP:           lazy(() => import('@course-algo/pages/LessonDP')),
      LessonGraph:        lazy(() => import('@course-algo/pages/LessonGraph')),
      LessonDesignAlgo:   lazy(() => import('@course-algo/pages/LessonDesignAlgo')),
    }
  },
  'pm-ai-mastery': {
    manifest: pmManifest,
    components: {
      LessonPMmindset:   lazy(() => import('@course-pm/pages/LessonPMmindset')),
      LessonResearch:    lazy(() => import('@course-pm/pages/LessonResearch')),
      LessonPRD:         lazy(() => import('@course-pm/pages/LessonPRD')),
      LessonNoCode:      lazy(() => import('@course-pm/pages/LessonNoCode')),
      LessonDataInsight: lazy(() => import('@course-pm/pages/LessonDataInsight')),
      LessonRoadmap:     lazy(() => import('@course-pm/pages/LessonRoadmap')),
      LessonCollabEng:   lazy(() => import('@course-pm/pages/LessonCollabEng')),
      LessonPMProject:   lazy(() => import('@course-pm/pages/LessonPMProject')),
    }
  },
  'llm-product-design': {
    manifest: llmpdManifest,
    components: {
      LessonProductMatrix:   lazy(() => import('@course-llmpd/pages/LessonProductMatrix')),
      LessonAIUX:            lazy(() => import('@course-llmpd/pages/LessonAIUX')),
      LessonPromptProduct:   lazy(() => import('@course-llmpd/pages/LessonPromptProduct')),
      LessonColdStart:       lazy(() => import('@course-llmpd/pages/LessonColdStart')),
      LessonMetrics:         lazy(() => import('@course-llmpd/pages/LessonMetrics')),
      LessonBizModel:        lazy(() => import('@course-llmpd/pages/LessonBizModel')),
      LessonCaseStudy:       lazy(() => import('@course-llmpd/pages/LessonCaseStudy')),
      LessonAIProductProject:lazy(() => import('@course-llmpd/pages/LessonAIProductProject')),
    }
  },
  'open-model-finetune': {
    manifest: omftManifest,
    components: {
      LessonFTIntro:    lazy(() => import('@course-omft/pages/LessonFTIntro')),
      LessonDataPrep:   lazy(() => import('@course-omft/pages/LessonDataPrep')),
      LessonLoRA:       lazy(() => import('@course-omft/pages/LessonLoRA')),
      LessonSFT:        lazy(() => import('@course-omft/pages/LessonSFT')),
      LessonDPO:        lazy(() => import('@course-omft/pages/LessonDPO')),
      LessonEval:       lazy(() => import('@course-omft/pages/LessonEval')),
      LessonQuant:      lazy(() => import('@course-omft/pages/LessonQuant')),
      LessonFTProject:  lazy(() => import('@course-omft/pages/LessonFTProject')),
    }
  },
};
