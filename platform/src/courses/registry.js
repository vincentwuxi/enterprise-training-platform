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
import safetyManifest from '@course-safety/../course.manifest.json';
import evalManifest   from '@course-eval/../course.manifest.json';
import deployManifest from '@course-deploy/../course.manifest.json';
import algoManifest  from '@course-algo/../course.manifest.json';
import pmManifest    from '@course-pm/../course.manifest.json';
import llmpdManifest from '@course-llmpd/../course.manifest.json';
import omftManifest  from '@course-omft/../course.manifest.json';
import rtManifest    from '@course-rt/../course.manifest.json';
import aseManifest   from '@course-ase/../course.manifest.json';
import ragManifest   from '@course-rag/../course.manifest.json';
import k8sManifest   from '@course-k8s/../course.manifest.json';
import aaeManifest   from '@course-aae/../course.manifest.json';
import lfpManifest   from '@course-lfp/../course.manifest.json';
import nnsManifest   from '@course-nns/../course.manifest.json';
import aifManifest   from '@course-aif/../course.manifest.json';
import dssManifest   from '@course-dss/../course.manifest.json';
import waeManifest   from '@course-wae/../course.manifest.json';
import btdManifest   from '@course-btd/../course.manifest.json';
import oscManifest   from '@course-osc/../course.manifest.json';
import tseManifest   from '@course-tse/../course.manifest.json';
import pgmManifest   from '@course-pgm/../course.manifest.json';
import obeManifest   from '@course-obe/../course.manifest.json';

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
      LessonProduction:    lazy(() => import('@course-ai-api/pages/LessonProduction')),
      LessonParamBible:    lazy(() => import('@course-ai-api/pages/LessonParamBible')),
      LessonResponsesAPI:  lazy(() => import('@course-ai-api/pages/LessonResponsesAPI')),
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
  'react-typescript': {
    manifest: rtManifest,
    components: {
      LessonFoundation:  lazy(() => import('@course-rt/pages/LessonFoundation')),
      LessonTypeScript:  lazy(() => import('@course-rt/pages/LessonTypeScript')),
      LessonState:       lazy(() => import('@course-rt/pages/LessonState')),
      LessonStyling:     lazy(() => import('@course-rt/pages/LessonStyling')),
      LessonNextjs:      lazy(() => import('@course-rt/pages/LessonNextjs')),
      LessonPerformance: lazy(() => import('@course-rt/pages/LessonPerformance')),
      LessonTesting:     lazy(() => import('@course-rt/pages/LessonTesting')),
      LessonDeployment:  lazy(() => import('@course-rt/pages/LessonDeployment')),
    }
  },
  'ai-strategy-executive': {
    manifest: aseManifest,
    components: {
      LessonCognition:   lazy(() => import('@course-ase/pages/LessonCognition')),
      LessonOpportunity: lazy(() => import('@course-ase/pages/LessonOpportunity')),
      LessonROI:         lazy(() => import('@course-ase/pages/LessonROI')),
      LessonVendor:      lazy(() => import('@course-ase/pages/LessonVendor')),
      LessonTeam:        lazy(() => import('@course-ase/pages/LessonTeam')),
      LessonData:        lazy(() => import('@course-ase/pages/LessonData')),
      LessonRisk:        lazy(() => import('@course-ase/pages/LessonRisk')),
      LessonRoadmap:     lazy(() => import('@course-ase/pages/LessonRoadmap')),
    }
  },
  'rag-engineering': {
    manifest: ragManifest,
    components: {
      LessonFoundation:  lazy(() => import('@course-rag/pages/LessonFoundation')),
      LessonChunking:    lazy(() => import('@course-rag/pages/LessonChunking')),
      LessonEmbedding:   lazy(() => import('@course-rag/pages/LessonEmbedding')),
      LessonVectorDB:    lazy(() => import('@course-rag/pages/LessonVectorDB')),
      LessonRetrieval:   lazy(() => import('@course-rag/pages/LessonRetrieval')),
      LessonGeneration:  lazy(() => import('@course-rag/pages/LessonGeneration')),
      LessonEvaluation:  lazy(() => import('@course-rag/pages/LessonEvaluation')),
      LessonProduction:  lazy(() => import('@course-rag/pages/LessonProduction')),
    }
  },
  'kubernetes-ops': {
    manifest: k8sManifest,
    components: {
      LessonArchitecture:  lazy(() => import('@course-k8s/pages/LessonArchitecture')),
      LessonWorkloads:     lazy(() => import('@course-k8s/pages/LessonWorkloads')),
      LessonNetworking:    lazy(() => import('@course-k8s/pages/LessonNetworking')),
      LessonStorage:       lazy(() => import('@course-k8s/pages/LessonStorage')),
      LessonScheduling:    lazy(() => import('@course-k8s/pages/LessonScheduling')),
      LessonObservability: lazy(() => import('@course-k8s/pages/LessonObservability')),
      LessonSecurity:      lazy(() => import('@course-k8s/pages/LessonSecurity')),
      LessonTroubleshoot:  lazy(() => import('@course-k8s/pages/LessonTroubleshoot')),
    }
  },
  'ai-agent-engineering': {
    manifest: aaeManifest,
    components: {
      LessonFoundation:  lazy(() => import('@course-aae/pages/LessonFoundation')),
      LessonTools:       lazy(() => import('@course-aae/pages/LessonTools')),
      LessonMemory:      lazy(() => import('@course-aae/pages/LessonMemory')),
      LessonLangGraph:   lazy(() => import('@course-aae/pages/LessonLangGraph')),
      LessonMultiAgent:  lazy(() => import('@course-aae/pages/LessonMultiAgent')),
      LessonProduction:  lazy(() => import('@course-aae/pages/LessonProduction')),
      LessonPatterns:    lazy(() => import('@course-aae/pages/LessonPatterns')),
      LessonSecurity:    lazy(() => import('@course-aae/pages/LessonSecurity')),
    }
  },
  'llm-finetune-pro': {
    manifest: lfpManifest,
    components: {
      LessonOverview:    lazy(() => import('@course-lfp/pages/LessonOverview')),
      LessonLoRA:        lazy(() => import('@course-lfp/pages/LessonLoRA')),
      LessonQLoRA:       lazy(() => import('@course-lfp/pages/LessonQLoRA')),
      LessonData:        lazy(() => import('@course-lfp/pages/LessonData')),
      LessonTraining:    lazy(() => import('@course-lfp/pages/LessonTraining')),
      LessonAlignment:   lazy(() => import('@course-lfp/pages/LessonAlignment')),
      LessonInference:   lazy(() => import('@course-lfp/pages/LessonInference')),
      LessonEvaluation:  lazy(() => import('@course-lfp/pages/LessonEvaluation')),
    }
  },
  'nodejs-nestjs': {
    manifest: nnsManifest,
    components: {
      LessonNodeCore:    lazy(() => import('@course-nns/pages/LessonNodeCore')),
      LessonNestArch:    lazy(() => import('@course-nns/pages/LessonNestArch')),
      LessonDatabase:    lazy(() => import('@course-nns/pages/LessonDatabase')),
      LessonRestAPI:     lazy(() => import('@course-nns/pages/LessonRestAPI')),
      LessonAuth:        lazy(() => import('@course-nns/pages/LessonAuth')),
      LessonRealtime:    lazy(() => import('@course-nns/pages/LessonRealtime')),
      LessonTesting:     lazy(() => import('@course-nns/pages/LessonTesting')),
      LessonProduction:  lazy(() => import('@course-nns/pages/LessonProduction')),
    }
  },
  'ai-infra': {
    manifest: aifManifest,
    components: {
      LessonGPUArch:     lazy(() => import('@course-aif/pages/LessonGPUArch')),
      LessonCUDA:        lazy(() => import('@course-aif/pages/LessonCUDA')),
      LessonPyTorch:     lazy(() => import('@course-aif/pages/LessonPyTorch')),
      LessonQuant:       lazy(() => import('@course-aif/pages/LessonQuant')),
      LessonInference:   lazy(() => import('@course-aif/pages/LessonInference')),
      LessonDistributed: lazy(() => import('@course-aif/pages/LessonDistributed')),
      LessonCluster:     lazy(() => import('@course-aif/pages/LessonCluster')),
      LessonCost:        lazy(() => import('@course-aif/pages/LessonCost')),
    }
  },
  'design-system': {
    manifest: dssManifest,
    components: {
      LessonDesignToken: lazy(() => import('@course-dss/pages/LessonDesignToken')),
      LessonFigma:       lazy(() => import('@course-dss/pages/LessonFigma')),
      LessonComponent:   lazy(() => import('@course-dss/pages/LessonComponent')),
      LessonStorybook:   lazy(() => import('@course-dss/pages/LessonStorybook')),
      LessonCSSArch:     lazy(() => import('@course-dss/pages/LessonCSSArch')),
      LessonA11y:        lazy(() => import('@course-dss/pages/LessonA11y')),
      LessonDarkMode:    lazy(() => import('@course-dss/pages/LessonDarkMode')),
      LessonPublish:     lazy(() => import('@course-dss/pages/LessonPublish')),
    }
  },
  'wasm-edge': {
    manifest: waeManifest,
    components: {
      LessonWasmCore:    lazy(() => import('@course-wae/pages/LessonWasmCore')),
      LessonRustWasm:    lazy(() => import('@course-wae/pages/LessonRustWasm')),
      LessonBrowserWasm: lazy(() => import('@course-wae/pages/LessonBrowserWasm')),
      LessonWASI:        lazy(() => import('@course-wae/pages/LessonWASI')),
      LessonCFWorkers:   lazy(() => import('@course-wae/pages/LessonCFWorkers')),
      LessonEdgeRuntime: lazy(() => import('@course-wae/pages/LessonEdgeRuntime')),
      LessonEdgeAI:      lazy(() => import('@course-wae/pages/LessonEdgeAI')),
      LessonWasmProd:    lazy(() => import('@course-wae/pages/LessonWasmProd')),
    }
  },
  'blue-team-defense': {
    manifest: btdManifest,
    components: {
      LessonSOC:        lazy(() => import('@course-btd/pages/LessonSOC')),
      LessonSIEM:       lazy(() => import('@course-btd/pages/LessonSIEM')),
      LessonEDR:        lazy(() => import('@course-btd/pages/LessonEDR')),
      LessonNDR:        lazy(() => import('@course-btd/pages/LessonNDR')),
      LessonCloudSec:   lazy(() => import('@course-btd/pages/LessonCloudSec')),
      LessonZeroTrust:  lazy(() => import('@course-btd/pages/LessonZeroTrust')),
      LessonThreatIntel:lazy(() => import('@course-btd/pages/LessonThreatIntel')),
      LessonIncident:   lazy(() => import('@course-btd/pages/LessonIncident')),
    }
  },
  'opensource-contrib': {
    manifest: oscManifest,
    components: {
      LessonFindProject: lazy(() => import('@course-osc/pages/LessonFindProject')),
      LessonFirstPR:     lazy(() => import('@course-osc/pages/LessonFirstPR')),
      LessonNonCode:     lazy(() => import('@course-osc/pages/LessonNonCode')),
      LessonGitAdvanced: lazy(() => import('@course-osc/pages/LessonGitAdvanced')),
      LessonCIContrib:   lazy(() => import('@course-osc/pages/LessonCIContrib')),
      LessonGovernance:  lazy(() => import('@course-osc/pages/LessonGovernance')),
      LessonOwnProject:  lazy(() => import('@course-osc/pages/LessonOwnProject')),
      LessonCareer:      lazy(() => import('@course-osc/pages/LessonCareer')),
    }
  },
  'testing-engineering': {
    manifest: tseManifest,
    components: {
      LessonPyramid:   lazy(() => import('@course-tse/pages/LessonPyramid')),
      LessonUnitTest:  lazy(() => import('@course-tse/pages/LessonUnitTest')),
      LessonComponent: lazy(() => import('@course-tse/pages/LessonComponent')),
      LessonAPITest:   lazy(() => import('@course-tse/pages/LessonAPITest')),
      LessonE2E:       lazy(() => import('@course-tse/pages/LessonE2E')),
      LessonPerfTest:  lazy(() => import('@course-tse/pages/LessonPerfTest')),
      LessonTDD:       lazy(() => import('@course-tse/pages/LessonTDD')),
      LessonTestArch:  lazy(() => import('@course-tse/pages/LessonTestArch')),
    }
  },
  'postgresql-mastery': {
    manifest: pgmManifest,
    components: {
      LessonInternals:   lazy(() => import('@course-pgm/pages/LessonInternals')),
      LessonAdvancedSQL: lazy(() => import('@course-pgm/pages/LessonAdvancedSQL')),
      LessonIndexing:    lazy(() => import('@course-pgm/pages/LessonIndexing')),
      LessonPgvector:    lazy(() => import('@course-pgm/pages/LessonPgvector')),
      LessonPartition:   lazy(() => import('@course-pgm/pages/LessonPartition')),
      LessonReplication: lazy(() => import('@course-pgm/pages/LessonReplication')),
      LessonTuning:      lazy(() => import('@course-pgm/pages/LessonTuning')),
      LessonCloudPG:     lazy(() => import('@course-pgm/pages/LessonCloudPG')),
    }
  },
  'observability-engineering': {
    manifest: obeManifest,
    components: {
      LessonPillars:    lazy(() => import('@course-obe/pages/LessonPillars')),
      LessonPrometheus: lazy(() => import('@course-obe/pages/LessonPrometheus')),
      LessonGrafana:    lazy(() => import('@course-obe/pages/LessonGrafana')),
      LessonOTel:       lazy(() => import('@course-obe/pages/LessonOTel')),
      LessonTracing:    lazy(() => import('@course-obe/pages/LessonTracing')),
      LessonAlerting:   lazy(() => import('@course-obe/pages/LessonAlerting')),
      LessonSLO:        lazy(() => import('@course-obe/pages/LessonSLO')),
      LessonProduction: lazy(() => import('@course-obe/pages/LessonProduction')),
    }
  },
  'ai-safety-alignment': {
    manifest: safetyManifest,
    components: {
      LessonHallucination: lazy(() => import('@course-safety/pages/LessonHallucination')),
      LessonRedTeam:       lazy(() => import('@course-safety/pages/LessonRedTeam')),
      LessonXAI:           lazy(() => import('@course-safety/pages/LessonXAI')),
      LessonFairness:      lazy(() => import('@course-safety/pages/LessonFairness')),
      LessonAlignment:     lazy(() => import('@course-safety/pages/LessonAlignment')),
      LessonCompliance:    lazy(() => import('@course-safety/pages/LessonCompliance')),
      LessonWatermark:     lazy(() => import('@course-safety/pages/LessonWatermark')),
      LessonAudit:         lazy(() => import('@course-safety/pages/LessonAudit')),
    }
  },
  'ai-eval-engineering': {
    manifest: evalManifest,
    components: {
      LessonEvalFundamentals: lazy(() => import('@course-eval/pages/LessonEvalFundamentals')),
      LessonBenchmarks:       lazy(() => import('@course-eval/pages/LessonBenchmarks')),
      LessonLLMJudge:         lazy(() => import('@course-eval/pages/LessonLLMJudge')),
      LessonLangSmith:        lazy(() => import('@course-eval/pages/LessonLangSmith')),
      LessonABTesting:        lazy(() => import('@course-eval/pages/LessonABTesting')),
      LessonRAGEval:          lazy(() => import('@course-eval/pages/LessonRAGEval')),
      LessonAgentEval:        lazy(() => import('@course-eval/pages/LessonAgentEval')),
      LessonEvalPipeline:     lazy(() => import('@course-eval/pages/LessonEvalPipeline')),
    }
  },
  'open-model-deploy': {
    manifest: deployManifest,
    components: {
      LessonDeployFundamentals: lazy(() => import('@course-deploy/pages/LessonDeployFundamentals')),
      LessonOllama:             lazy(() => import('@course-deploy/pages/LessonOllama')),
      LessonVLLM:               lazy(() => import('@course-deploy/pages/LessonVLLM')),
      LessonTGITriton:          lazy(() => import('@course-deploy/pages/LessonTGITriton')),
      LessonQuantization:       lazy(() => import('@course-deploy/pages/LessonQuantization')),
      LessonInferenceAPI:       lazy(() => import('@course-deploy/pages/LessonInferenceAPI')),
      LessonContainerDeploy:    lazy(() => import('@course-deploy/pages/LessonContainerDeploy')),
      LessonProductionArch:     lazy(() => import('@course-deploy/pages/LessonProductionArch')),
    }
  },
};

