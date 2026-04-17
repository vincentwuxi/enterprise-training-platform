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
import safetyManifest from '@course-safety/../course.manifest.json';
import evalManifest   from '@course-eval/../course.manifest.json';
import deployManifest from '@course-deploy/../course.manifest.json';
import aifsManifest   from '@course-aifs/../course.manifest.json';
import mmManifest     from '@course-mm/../course.manifest.json';
import mcpManifest    from '@course-mcp/../course.manifest.json';
import searchManifest from '@course-search/../course.manifest.json';
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
import kgManifest    from '@course-kg/../course.manifest.json';
import adeManifest   from '@course-ade/../course.manifest.json';
import ivaManifest   from '@course-iva/../course.manifest.json';
import andManifest   from '@course-and/../course.manifest.json';
import acgManifest   from '@course-acg/../course.manifest.json';
import afsManifest   from '@course-afs/../course.manifest.json';
import dlManifest    from '@course-dl/../course.manifest.json';
import rlManifest    from '@course-rl/../course.manifest.json';
import nlpManifest   from '@course-nlp/../course.manifest.json';
import pflManifest   from '@course-pfl/../course.manifest.json';
import armManifest   from '@course-arm/../course.manifest.json';
import aerManifest   from '@course-aer/../course.manifest.json';
import acdManifest   from '@course-acd/../course.manifest.json';
import asoManifest   from '@course-aso/../course.manifest.json';
import appManifest   from '@course-app/../course.manifest.json';
import cvManifest    from '@course-cv/../course.manifest.json';
import vaeManifest   from '@course-vae/../course.manifest.json';
import adaManifest   from '@course-ada/../course.manifest.json';
import apoManifest   from '@course-apo/../course.manifest.json';
import laManifest    from '@course-la/../course.manifest.json';
import psManifest    from '@course-ps/../course.manifest.json';
import ghManifest    from '@course-gh/../course.manifest.json';
import ivmManifest   from '@course-ivm/../course.manifest.json';
import dmManifest    from '@course-dm/../course.manifest.json';
import itManifest    from '@course-it/../course.manifest.json';
import optManifest   from '@course-opt/../course.manifest.json';
import ncManifest    from '@course-nc/../course.manifest.json';
import gitManifest   from '@course-git/../course.manifest.json';
import goManifest    from '@course-go/../course.manifest.json';
import rustManifest  from '@course-rust/../course.manifest.json';
import osManifest    from '@course-os/../course.manifest.json';
import compManifest  from '@course-comp/../course.manifest.json';
import javaManifest  from '@course-java/../course.manifest.json';
import distManifest  from '@course-dist/../course.manifest.json';
import shellManifest from '@course-shell/../course.manifest.json';

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
  'ai-fullstack-apps': {
    manifest: aifsManifest,
    components: {
      LessonAIArch:       lazy(() => import('@course-aifs/pages/LessonAIArch')),
      LessonChatBot:      lazy(() => import('@course-aifs/pages/LessonChatBot')),
      LessonRAGApp:       lazy(() => import('@course-aifs/pages/LessonRAGApp')),
      LessonTextToSQL:    lazy(() => import('@course-aifs/pages/LessonTextToSQL')),
      LessonAIWorkflow:   lazy(() => import('@course-aifs/pages/LessonAIWorkflow')),
      LessonMultimodal:   lazy(() => import('@course-aifs/pages/LessonMultimodal')),
      LessonAISaaS:       lazy(() => import('@course-aifs/pages/LessonAISaaS')),
      LessonGoLive:       lazy(() => import('@course-aifs/pages/LessonGoLive')),
    }
  },
  'multimodal-ai-engineering': {
    manifest: mmManifest,
    components: {
      LessonMMFoundations: lazy(() => import('@course-mm/pages/LessonMMFoundations')),
      LessonVisionLLM:     lazy(() => import('@course-mm/pages/LessonVisionLLM')),
      LessonSpeechEng:     lazy(() => import('@course-mm/pages/LessonSpeechEng')),
      LessonVideoAI:       lazy(() => import('@course-mm/pages/LessonVideoAI')),
      LessonImageGen:      lazy(() => import('@course-mm/pages/LessonImageGen')),
      LessonDocIntel:      lazy(() => import('@course-mm/pages/LessonDocIntel')),
      LessonMMRAG:         lazy(() => import('@course-mm/pages/LessonMMRAG')),
      LessonMMProduction:  lazy(() => import('@course-mm/pages/LessonMMProduction')),
    }
  },
  'mcp-tool-ecosystem': {
    manifest: mcpManifest,
    components: {
      LessonMCPProtocol:     lazy(() => import('@course-mcp/pages/LessonMCPProtocol')),
      LessonMCPServers:      lazy(() => import('@course-mcp/pages/LessonMCPServers')),
      LessonFunctionCalling: lazy(() => import('@course-mcp/pages/LessonFunctionCalling')),
      LessonBrowserUse:      lazy(() => import('@course-mcp/pages/LessonBrowserUse')),
      LessonComputerUse:     lazy(() => import('@course-mcp/pages/LessonComputerUse')),
      LessonGPTsActions:     lazy(() => import('@course-mcp/pages/LessonGPTsActions')),
      LessonToolSecurity:    lazy(() => import('@course-mcp/pages/LessonToolSecurity')),
      LessonToolPlatform:    lazy(() => import('@course-mcp/pages/LessonToolPlatform')),
    }
  },
  'ai-search-recommend': {
    manifest: searchManifest,
    components: {
      LessonSemanticSearch:   lazy(() => import('@course-search/pages/LessonSemanticSearch')),
      LessonVectorDB:         lazy(() => import('@course-search/pages/LessonVectorDB')),
      LessonHybridSearch:     lazy(() => import('@course-search/pages/LessonHybridSearch')),
      LessonRecSystem:        lazy(() => import('@course-search/pages/LessonRecSystem')),
      LessonLLMSearch:        lazy(() => import('@course-search/pages/LessonLLMSearch')),
      LessonRealtimeRec:      lazy(() => import('@course-search/pages/LessonRealtimeRec')),
      LessonSearchEval:       lazy(() => import('@course-search/pages/LessonSearchEval')),
      LessonEnterpriseSearch: lazy(() => import('@course-search/pages/LessonEnterpriseSearch')),
    }
  },
  'knowledge-graph-rag': {
    manifest: kgManifest,
    components: {
      LessonKGFoundation:      lazy(() => import('@course-kg/pages/LessonKGFoundation')),
      LessonNeo4j:             lazy(() => import('@course-kg/pages/LessonNeo4j')),
      LessonKGExtraction:      lazy(() => import('@course-kg/pages/LessonKGExtraction')),
      LessonGraphRAG:          lazy(() => import('@course-kg/pages/LessonGraphRAG')),
      LessonHybridKGSearch:    lazy(() => import('@course-kg/pages/LessonHybridKGSearch')),
      LessonMultiHopReasoning: lazy(() => import('@course-kg/pages/LessonMultiHopReasoning')),
      LessonIndustryKG:        lazy(() => import('@course-kg/pages/LessonIndustryKG')),
      LessonKGProduction:      lazy(() => import('@course-kg/pages/LessonKGProduction')),
    }
  },
  'ai-data-engineering': {
    manifest: adeManifest,
    components: {
      LessonTrainingDataFundamentals: lazy(() => import('@course-ade/pages/LessonTrainingDataFundamentals')),
      LessonDataLabeling:             lazy(() => import('@course-ade/pages/LessonDataLabeling')),
      LessonSyntheticData:            lazy(() => import('@course-ade/pages/LessonSyntheticData')),
      LessonDataFlywheel:             lazy(() => import('@course-ade/pages/LessonDataFlywheel')),
      LessonDataCuration:             lazy(() => import('@course-ade/pages/LessonDataCuration')),
      LessonEvalData:                 lazy(() => import('@course-ade/pages/LessonEvalData')),
      LessonMultimodalData:           lazy(() => import('@course-ade/pages/LessonMultimodalData')),
      LessonDataGovernance:           lazy(() => import('@course-ade/pages/LessonDataGovernance')),
    }
  },
  'industry-vertical-ai': {
    manifest: ivaManifest,
    components: {
      LessonAILanding:           lazy(() => import('@course-iva/pages/LessonAILanding')),
      LessonFinanceAI:           lazy(() => import('@course-iva/pages/LessonFinanceAI')),
      LessonEcommerceAI:         lazy(() => import('@course-iva/pages/LessonEcommerceAI')),
      LessonMedicalAI:           lazy(() => import('@course-iva/pages/LessonMedicalAI')),
      LessonLegalAI:             lazy(() => import('@course-iva/pages/LessonLegalAI')),
      LessonManufacturingAI:     lazy(() => import('@course-iva/pages/LessonManufacturingAI')),
      LessonEducationAI:         lazy(() => import('@course-iva/pages/LessonEducationAI')),
      LessonIndustryDeployment:  lazy(() => import('@course-iva/pages/LessonIndustryDeployment')),
    }
  },
  'ai-native-dev': {
    manifest: andManifest,
    components: {
      LessonAIIDE:            lazy(() => import('@course-and/pages/LessonAIIDE')),
      LessonAgenticCoding:    lazy(() => import('@course-and/pages/LessonAgenticCoding')),
      LessonAICodeReview:     lazy(() => import('@course-and/pages/LessonAICodeReview')),
      LessonAITesting:        lazy(() => import('@course-and/pages/LessonAITesting')),
      LessonPromptToApp:      lazy(() => import('@course-and/pages/LessonPromptToApp')),
      LessonAIRefactoring:    lazy(() => import('@course-and/pages/LessonAIRefactoring')),
      LessonAIDevOps:         lazy(() => import('@course-and/pages/LessonAIDevOps')),
      LessonTeamAIWorkflow:   lazy(() => import('@course-and/pages/LessonTeamAIWorkflow')),
    }
  },
  'ai-compliance-gov': {
    manifest: acgManifest,
    components: {
      LessonGlobalRegulation:  lazy(() => import('@course-acg/pages/LessonGlobalRegulation')),
      LessonEUAIAct:           lazy(() => import('@course-acg/pages/LessonEUAIAct')),
      LessonChinaCompliance:   lazy(() => import('@course-acg/pages/LessonChinaCompliance')),
      LessonDataPrivacy:       lazy(() => import('@course-acg/pages/LessonDataPrivacy')),
      LessonFairnessXAI:       lazy(() => import('@course-acg/pages/LessonFairnessXAI')),
      LessonRiskManagement:    lazy(() => import('@course-acg/pages/LessonRiskManagement')),
      LessonEnterpriseGov:     lazy(() => import('@course-acg/pages/LessonEnterpriseGov')),
      LessonCopyrightEthics:   lazy(() => import('@course-acg/pages/LessonCopyrightEthics')),
    }
  },
  'ai-for-science': {
    manifest: afsManifest,
    components: {
      LessonScientificParadigm: lazy(() => import('@course-afs/pages/LessonScientificParadigm')),
      LessonAlphaFold:          lazy(() => import('@course-afs/pages/LessonAlphaFold')),
      LessonDrugDiscovery:      lazy(() => import('@course-afs/pages/LessonDrugDiscovery')),
      LessonWeatherClimate:     lazy(() => import('@course-afs/pages/LessonWeatherClimate')),
      LessonMaterialsDesign:    lazy(() => import('@course-afs/pages/LessonMaterialsDesign')),
      LessonMathReasoning:      lazy(() => import('@course-afs/pages/LessonMathReasoning')),
      LessonGenomics:           lazy(() => import('@course-afs/pages/LessonGenomics')),
      LessonScienceEngineering: lazy(() => import('@course-afs/pages/LessonScienceEngineering')),
    }
  },
  'deep-learning': {
    manifest: dlManifest,
    components: {
      LessonNeuralNetworks:  lazy(() => import('@course-dl/pages/LessonNeuralNetworks')),
      LessonCNN:             lazy(() => import('@course-dl/pages/LessonCNN')),
      LessonSequenceModels:  lazy(() => import('@course-dl/pages/LessonSequenceModels')),
      LessonGenerativeModels:lazy(() => import('@course-dl/pages/LessonGenerativeModels')),
      LessonGraphNN:         lazy(() => import('@course-dl/pages/LessonGraphNN')),
      LessonSelfSupervised:  lazy(() => import('@course-dl/pages/LessonSelfSupervised')),
      LessonModelCompression:lazy(() => import('@course-dl/pages/LessonModelCompression')),
      LessonFrontierArch:    lazy(() => import('@course-dl/pages/LessonFrontierArch')),
    }
  },
  'reinforcement-learning': {
    manifest: rlManifest,
    components: {
      LessonMDPFoundations:  lazy(() => import('@course-rl/pages/LessonMDPFoundations')),
      LessonValueBased:      lazy(() => import('@course-rl/pages/LessonValueBased')),
      LessonPolicyGradient:  lazy(() => import('@course-rl/pages/LessonPolicyGradient')),
      LessonPPO:             lazy(() => import('@course-rl/pages/LessonPPO')),
      LessonRLHF:            lazy(() => import('@course-rl/pages/LessonRLHF')),
      LessonDPO:             lazy(() => import('@course-rl/pages/LessonDPO')),
      LessonMultiAgent:      lazy(() => import('@course-rl/pages/LessonMultiAgent')),
      LessonRLApplications:  lazy(() => import('@course-rl/pages/LessonRLApplications')),
    }
  },
  'nlp-text-intelligence': {
    manifest: nlpManifest,
    components: {
      LessonNLPFoundations:  lazy(() => import('@course-nlp/pages/LessonNLPFoundations')),
      LessonPretrainedModels:lazy(() => import('@course-nlp/pages/LessonPretrainedModels')),
      LessonInfoExtraction:  lazy(() => import('@course-nlp/pages/LessonInfoExtraction')),
      LessonTextClassification: lazy(() => import('@course-nlp/pages/LessonTextClassification')),
      LessonTextGeneration:  lazy(() => import('@course-nlp/pages/LessonTextGeneration')),
      LessonSearchQA:        lazy(() => import('@course-nlp/pages/LessonSearchQA')),
      LessonMultilingual:    lazy(() => import('@course-nlp/pages/LessonMultilingual')),
      LessonNLPEngineering:  lazy(() => import('@course-nlp/pages/LessonNLPEngineering')),
    }
  },
  'privacy-federated-learning': {
    manifest: pflManifest,
    components: {
      LessonPrivacyFundamentals:  lazy(() => import('@course-pfl/pages/LessonPrivacyFundamentals')),
      LessonFederatedLearning:   lazy(() => import('@course-pfl/pages/LessonFederatedLearning')),
      LessonDifferentialPrivacy: lazy(() => import('@course-pfl/pages/LessonDifferentialPrivacy')),
      LessonSecureComputation:   lazy(() => import('@course-pfl/pages/LessonSecureComputation')),
      LessonFederatedLLM:        lazy(() => import('@course-pfl/pages/LessonFederatedLLM')),
      LessonTrustedExecution:    lazy(() => import('@course-pfl/pages/LessonTrustedExecution')),
      LessonIndustryApplications:lazy(() => import('@course-pfl/pages/LessonIndustryApplications')),
      LessonOpenSourceFrameworks:lazy(() => import('@course-pfl/pages/LessonOpenSourceFrameworks')),
    }
  },
  'ai-realtime-media': {
    manifest: armManifest,
    components: {
      LessonRealtimeVoice:         lazy(() => import('@course-arm/pages/LessonRealtimeVoice')),
      LessonVoiceAgent:            lazy(() => import('@course-arm/pages/LessonVoiceAgent')),
      LessonDigitalHuman:          lazy(() => import('@course-arm/pages/LessonDigitalHuman')),
      LessonMusicGen:              lazy(() => import('@course-arm/pages/LessonMusicGen')),
      LessonVideoGen:              lazy(() => import('@course-arm/pages/LessonVideoGen')),
      LessonVideoEditing:          lazy(() => import('@course-arm/pages/LessonVideoEditing')),
      Lesson3DSpatial:             lazy(() => import('@course-arm/pages/Lesson3DSpatial')),
      LessonProductionEngineering: lazy(() => import('@course-arm/pages/LessonProductionEngineering')),
    }
  },
  'ai-embodied-robotics': {
    manifest: aerManifest,
    components: {
      LessonEmbodiedOverview:  lazy(() => import('@course-aer/pages/LessonEmbodiedOverview')),
      LessonRobotFoundation:   lazy(() => import('@course-aer/pages/LessonRobotFoundation')),
      LessonSimulationEnv:     lazy(() => import('@course-aer/pages/LessonSimulationEnv')),
      LessonEdgeAIDeploy:      lazy(() => import('@course-aer/pages/LessonEdgeAIDeploy')),
      Lesson3DPerception:      lazy(() => import('@course-aer/pages/Lesson3DPerception')),
      LessonAutonomousDriving: lazy(() => import('@course-aer/pages/LessonAutonomousDriving')),
      LessonHumanoidRobot:     lazy(() => import('@course-aer/pages/LessonHumanoidRobot')),
      LessonSystemIntegration: lazy(() => import('@course-aer/pages/LessonSystemIntegration')),
    }
  },
  'ai-creative-design': {
    manifest: acdManifest,
    components: {
      LessonAIArtFundamentals:   lazy(() => import('@course-acd/pages/LessonAIArtFundamentals')),
      LessonMidjourneyMastery:   lazy(() => import('@course-acd/pages/LessonMidjourneyMastery')),
      LessonComfyUIWorkflow:     lazy(() => import('@course-acd/pages/LessonComfyUIWorkflow')),
      LessonControlNetPrecision: lazy(() => import('@course-acd/pages/LessonControlNetPrecision')),
      LessonLogoBrandDesign:     lazy(() => import('@course-acd/pages/LessonLogoBrandDesign')),
      LessonEcommerceVisual:     lazy(() => import('@course-acd/pages/LessonEcommerceVisual')),
      LessonMotionDesign:        lazy(() => import('@course-acd/pages/LessonMotionDesign')),
      LessonCommercialProduction:lazy(() => import('@course-acd/pages/LessonCommercialProduction')),
    }
  },
  'ai-system-optimization': {
    manifest: asoManifest,
    components: {
      LessonInferenceFoundations:  lazy(() => import('@course-aso/pages/LessonInferenceFoundations')),
      LessonModelCompression:      lazy(() => import('@course-aso/pages/LessonModelCompression')),
      LessonInferenceEngines:      lazy(() => import('@course-aso/pages/LessonInferenceEngines')),
      LessonKVCacheOptimization:   lazy(() => import('@course-aso/pages/LessonKVCacheOptimization')),
      LessonDistributedInference:  lazy(() => import('@course-aso/pages/LessonDistributedInference')),
      LessonEdgeDeployment:        lazy(() => import('@course-aso/pages/LessonEdgeDeployment')),
      LessonCostOptimization:      lazy(() => import('@course-aso/pages/LessonCostOptimization')),
      LessonProductionMonitoring:  lazy(() => import('@course-aso/pages/LessonProductionMonitoring')),
    }
  },
  'ai-personal-productivity': {
    manifest: appManifest,
    components: {
      LessonAIAssistantBasics:    lazy(() => import('@course-app/pages/LessonAIAssistantBasics')),
      LessonAIWritingDocs:        lazy(() => import('@course-app/pages/LessonAIWritingDocs')),
      LessonAIInfoProcessing:     lazy(() => import('@course-app/pages/LessonAIInfoProcessing')),
      LessonAIKnowledgeBase:      lazy(() => import('@course-app/pages/LessonAIKnowledgeBase')),
      LessonAIMeetingCollab:      lazy(() => import('@course-app/pages/LessonAIMeetingCollab')),
      LessonAIDataAnalysis:       lazy(() => import('@course-app/pages/LessonAIDataAnalysis')),
      LessonAIWorkflowAutomation: lazy(() => import('@course-app/pages/LessonAIWorkflowAutomation')),
      LessonAILearningGrowth:     lazy(() => import('@course-app/pages/LessonAILearningGrowth')),
    }
  },
  'computer-vision-engineering': {
    manifest: cvManifest,
    components: {
      LessonCVFundamentals:    lazy(() => import('@course-cv/pages/LessonCVFundamentals')),
      LessonObjectDetection:   lazy(() => import('@course-cv/pages/LessonObjectDetection')),
      LessonImageSegmentation: lazy(() => import('@course-cv/pages/LessonImageSegmentation')),
      LessonOCRDocument:       lazy(() => import('@course-cv/pages/LessonOCRDocument')),
      LessonVideoAnalysis:     lazy(() => import('@course-cv/pages/LessonVideoAnalysis')),
      LessonFaceBody:          lazy(() => import('@course-cv/pages/LessonFaceBody')),
      LessonIndustrialVision:  lazy(() => import('@course-cv/pages/LessonIndustrialVision')),
      LessonCVProduction:      lazy(() => import('@course-cv/pages/LessonCVProduction')),
    }
  },
  'ai-voice-audio-engineering': {
    manifest: vaeManifest,
    components: {
      LessonAudioFundamentals:  lazy(() => import('@course-vae/pages/LessonAudioFundamentals')),
      LessonSpeechRecognition:  lazy(() => import('@course-vae/pages/LessonSpeechRecognition')),
      LessonSpeechSynthesis:    lazy(() => import('@course-vae/pages/LessonSpeechSynthesis')),
      LessonSpeechLLM:          lazy(() => import('@course-vae/pages/LessonSpeechLLM')),
      LessonVoiceAgent:         lazy(() => import('@course-vae/pages/LessonVoiceAgent')),
      LessonMusicGeneration:    lazy(() => import('@course-vae/pages/LessonMusicGeneration')),
      LessonAudioProcessing:    lazy(() => import('@course-vae/pages/LessonAudioProcessing')),
      LessonVoiceDeployment:    lazy(() => import('@course-vae/pages/LessonVoiceDeployment')),
    }
  },
  'ai-data-analytics-bi': {
    manifest: adaManifest,
    components: {
      LessonModernAnalytics:      lazy(() => import('@course-ada/pages/LessonModernAnalytics')),
      LessonText2SQL:             lazy(() => import('@course-ada/pages/LessonText2SQL')),
      LessonAutoML:               lazy(() => import('@course-ada/pages/LessonAutoML')),
      LessonAIExploration:        lazy(() => import('@course-ada/pages/LessonAIExploration')),
      LessonSmartVisualization:   lazy(() => import('@course-ada/pages/LessonSmartVisualization')),
      LessonDataAgent:            lazy(() => import('@course-ada/pages/LessonDataAgent')),
      LessonRealtimeBI:           lazy(() => import('@course-ada/pages/LessonRealtimeBI')),
      LessonAnalyticsEngineering: lazy(() => import('@course-ada/pages/LessonAnalyticsEngineering')),
    }
  },
  'agent-productionization-ops': {
    manifest: apoManifest,
    components: {
      LessonAgentEvaluation:    lazy(() => import('@course-apo/pages/LessonAgentEvaluation')),
      LessonAgentObservability: lazy(() => import('@course-apo/pages/LessonAgentObservability')),
      LessonAgentGuardrails:    lazy(() => import('@course-apo/pages/LessonAgentGuardrails')),
      LessonHumanAgentCollab:   lazy(() => import('@course-apo/pages/LessonHumanAgentCollab')),
      LessonAgentDebugging:     lazy(() => import('@course-apo/pages/LessonAgentDebugging')),
      LessonAgentCost:          lazy(() => import('@course-apo/pages/LessonAgentCost')),
      LessonAgentCompliance:    lazy(() => import('@course-apo/pages/LessonAgentCompliance')),
      LessonAgentPlatform:      lazy(() => import('@course-apo/pages/LessonAgentPlatform')),
    }
  },
  'linear-algebra': {
    manifest: laManifest,
    components: {
      LessonVectors:       lazy(() => import('@course-la/pages/LessonVectors')),
      LessonTransforms:    lazy(() => import('@course-la/pages/LessonTransforms')),
      LessonMatrixOps:     lazy(() => import('@course-la/pages/LessonMatrixOps')),
      LessonLinearSystems: lazy(() => import('@course-la/pages/LessonLinearSystems')),
      LessonEigenvalues:   lazy(() => import('@course-la/pages/LessonEigenvalues')),
      LessonSVD:           lazy(() => import('@course-la/pages/LessonSVD')),
      LessonPCA:           lazy(() => import('@course-la/pages/LessonPCA')),
      LessonAdvanced:      lazy(() => import('@course-la/pages/LessonAdvanced')),
    }
  },
  'probability-statistics': {
    manifest: psManifest,
    components: {
      LessonProbFoundations: lazy(() => import('@course-ps/pages/LessonProbFoundations')),
      LessonRandomVariables: lazy(() => import('@course-ps/pages/LessonRandomVariables')),
      LessonDistributions:   lazy(() => import('@course-ps/pages/LessonDistributions')),
      LessonJointLimit:      lazy(() => import('@course-ps/pages/LessonJointLimit')),
      LessonEstimation:      lazy(() => import('@course-ps/pages/LessonEstimation')),
      LessonBayesian:        lazy(() => import('@course-ps/pages/LessonBayesian')),
      LessonHypothesisInfo:  lazy(() => import('@course-ps/pages/LessonHypothesisInfo')),
      LessonStochastic:      lazy(() => import('@course-ps/pages/LessonStochastic')),
    }
  },
  'growth-hacking': {
    manifest: ghManifest,
    components: {
      LessonGrowthFoundation: lazy(() => import('@course-gh/pages/LessonGrowthFoundation')),
      LessonAcquisition:      lazy(() => import('@course-gh/pages/LessonAcquisition')),
      LessonActivation:       lazy(() => import('@course-gh/pages/LessonActivation')),
      LessonRetention:        lazy(() => import('@course-gh/pages/LessonRetention')),
      LessonFunnelAB:         lazy(() => import('@course-gh/pages/LessonFunnelAB')),
      LessonViral:            lazy(() => import('@course-gh/pages/LessonViral')),
      LessonDataOps:          lazy(() => import('@course-gh/pages/LessonDataOps')),
      LessonGrowthCase:       lazy(() => import('@course-gh/pages/LessonGrowthCase')),
    }
  },
  'interview-mastery': {
    manifest: ivmManifest,
    components: {
      LessonAlgorithm:      lazy(() => import('@course-ivm/pages/LessonAlgorithm')),
      LessonComplexity:     lazy(() => import('@course-ivm/pages/LessonComplexity')),
      LessonDataStructure:  lazy(() => import('@course-ivm/pages/LessonDataStructure')),
      LessonDP:             lazy(() => import('@course-ivm/pages/LessonDP')),
      LessonSystemDesign:   lazy(() => import('@course-ivm/pages/LessonSystemDesign')),
      LessonBehavioral:     lazy(() => import('@course-ivm/pages/LessonBehavioral')),
      LessonMock:           lazy(() => import('@course-ivm/pages/LessonMock')),
      LessonOffer:          lazy(() => import('@course-ivm/pages/LessonOffer')),
    }
  },
  'discrete-math': {
    manifest: dmManifest,
    components: {
      LessonPropLogic:     lazy(() => import('@course-dm/pages/LessonPropLogic')),
      LessonSetsRelations: lazy(() => import('@course-dm/pages/LessonSetsRelations')),
      LessonFunctionsSeq:  lazy(() => import('@course-dm/pages/LessonFunctionsSeq')),
      LessonCounting:      lazy(() => import('@course-dm/pages/LessonCounting')),
      LessonGraphBasics:   lazy(() => import('@course-dm/pages/LessonGraphBasics')),
      LessonGraphAlgos:    lazy(() => import('@course-dm/pages/LessonGraphAlgos')),
      LessonTreesNetworks: lazy(() => import('@course-dm/pages/LessonTreesNetworks')),
      LessonBooleanCrypto: lazy(() => import('@course-dm/pages/LessonBooleanCrypto')),
    }
  },
  'information-theory': {
    manifest: itManifest,
    components: {
      LessonEntropy:        lazy(() => import('@course-it/pages/LessonEntropy')),
      LessonMutualInfo:     lazy(() => import('@course-it/pages/LessonMutualInfo')),
      LessonSourceCoding:   lazy(() => import('@course-it/pages/LessonSourceCoding')),
      LessonChannelCapacity:lazy(() => import('@course-it/pages/LessonChannelCapacity')),
      LessonErrorCorrection:lazy(() => import('@course-it/pages/LessonErrorCorrection')),
      LessonRateDistortion: lazy(() => import('@course-it/pages/LessonRateDistortion')),
      LessonInfoML:         lazy(() => import('@course-it/pages/LessonInfoML')),
      LessonInfoProject:    lazy(() => import('@course-it/pages/LessonInfoProject')),
    }
  },
  'optimization-methods': {
    manifest: optManifest,
    components: {
      LessonUnconstrained: lazy(() => import('@course-opt/pages/LessonUnconstrained')),
      LessonConvex:        lazy(() => import('@course-opt/pages/LessonConvex')),
      LessonConstrained:   lazy(() => import('@course-opt/pages/LessonConstrained')),
      LessonLinearProg:    lazy(() => import('@course-opt/pages/LessonLinearProg')),
      LessonStochasticOpt: lazy(() => import('@course-opt/pages/LessonStochasticOpt')),
      LessonIntegerComb:   lazy(() => import('@course-opt/pages/LessonIntegerComb')),
      LessonEvolutionary:  lazy(() => import('@course-opt/pages/LessonEvolutionary')),
      LessonAutodiff:      lazy(() => import('@course-opt/pages/LessonAutodiff')),
    }
  },
  'numerical-computing': {
    manifest: ncManifest,
    components: {
      LessonFloatingPoint: lazy(() => import('@course-nc/pages/LessonFloatingPoint')),
      LessonLinearSystems: lazy(() => import('@course-nc/pages/LessonLinearSystems')),
      LessonInterpolation: lazy(() => import('@course-nc/pages/LessonInterpolation')),
      LessonIntegration:   lazy(() => import('@course-nc/pages/LessonIntegration')),
      LessonODESolvers:    lazy(() => import('@course-nc/pages/LessonODESolvers')),
      LessonFFTSpectral:   lazy(() => import('@course-nc/pages/LessonFFTSpectral')),
      LessonSparseEigen:   lazy(() => import('@course-nc/pages/LessonSparseEigen')),
      LessonParallelSim:   lazy(() => import('@course-nc/pages/LessonParallelSim')),
    }
  },
  'git-mastery': {
    manifest: gitManifest,
    components: {
      LessonGitBasics:   lazy(() => import('@course-git/pages/LessonGitBasics')),
      LessonBranching:   lazy(() => import('@course-git/pages/LessonBranching')),
      LessonRemoteCollab:lazy(() => import('@course-git/pages/LessonRemoteCollab')),
      LessonAdvancedOps: lazy(() => import('@course-git/pages/LessonAdvancedOps')),
      LessonGitFlow:     lazy(() => import('@course-git/pages/LessonGitFlow')),
      LessonHooksCI:     lazy(() => import('@course-git/pages/LessonHooksCI')),
      LessonMonorepo:    lazy(() => import('@course-git/pages/LessonMonorepo')),
      LessonGitInternals:lazy(() => import('@course-git/pages/LessonGitInternals')),
    }
  },
  'golang-engineering': {
    manifest: goManifest,
    components: {
      LessonGoBasics:     lazy(() => import('@course-go/pages/LessonGoBasics')),
      LessonGoStruct:     lazy(() => import('@course-go/pages/LessonGoStruct')),
      LessonGoConcurrency:lazy(() => import('@course-go/pages/LessonGoConcurrency')),
      LessonGoStdlib:     lazy(() => import('@course-go/pages/LessonGoStdlib')),
      LessonGoTesting:    lazy(() => import('@course-go/pages/LessonGoTesting')),
      LessonGoGRPC:       lazy(() => import('@course-go/pages/LessonGoGRPC')),
      LessonGoDatabase:   lazy(() => import('@course-go/pages/LessonGoDatabase')),
      LessonGoDeploy:     lazy(() => import('@course-go/pages/LessonGoDeploy')),
    }
  },
  'rust-programming': {
    manifest: rustManifest,
    components: {
      LessonRustBasics:      lazy(() => import('@course-rust/pages/LessonRustBasics')),
      LessonRustTypes:       lazy(() => import('@course-rust/pages/LessonRustTypes')),
      LessonRustErrors:      lazy(() => import('@course-rust/pages/LessonRustErrors')),
      LessonRustConcurrency: lazy(() => import('@course-rust/pages/LessonRustConcurrency')),
      LessonRustAsync:       lazy(() => import('@course-rust/pages/LessonRustAsync')),
      LessonRustUnsafe:      lazy(() => import('@course-rust/pages/LessonRustUnsafe')),
      LessonRustWasm:        lazy(() => import('@course-rust/pages/LessonRustWasm')),
      LessonRustProject:     lazy(() => import('@course-rust/pages/LessonRustProject')),
    }
  },
  'operating-systems': {
    manifest: osManifest,
    components: {
      LessonOSIntro:       lazy(() => import('@course-os/pages/LessonOSIntro')),
      LessonProcessThread: lazy(() => import('@course-os/pages/LessonProcessThread')),
      LessonScheduling:    lazy(() => import('@course-os/pages/LessonScheduling')),
      LessonSyncDeadlock:  lazy(() => import('@course-os/pages/LessonSyncDeadlock')),
      LessonMemoryMgmt:    lazy(() => import('@course-os/pages/LessonMemoryMgmt')),
      LessonFilesystem:    lazy(() => import('@course-os/pages/LessonFilesystem')),
      LessonIODevices:     lazy(() => import('@course-os/pages/LessonIODevices')),
      LessonVirtualization:lazy(() => import('@course-os/pages/LessonVirtualization')),
    }
  },
  'compiler-design': {
    manifest: compManifest,
    components: {
      LessonLexical:         lazy(() => import('@course-comp/pages/LessonLexical')),
      LessonParsing:         lazy(() => import('@course-comp/pages/LessonParsing')),
      LessonASTSemantic:     lazy(() => import('@course-comp/pages/LessonASTSemantic')),
      LessonIRGeneration:    lazy(() => import('@course-comp/pages/LessonIRGeneration')),
      LessonOptimization:    lazy(() => import('@course-comp/pages/LessonOptimization')),
      LessonCodegen:         lazy(() => import('@course-comp/pages/LessonCodegen')),
      LessonLLVM:            lazy(() => import('@course-comp/pages/LessonLLVM')),
      LessonCompilerProject: lazy(() => import('@course-comp/pages/LessonCompilerProject')),
    }
  },
  'java-spring-boot': {
    manifest: javaManifest,
    components: {
      LessonJavaModern:    lazy(() => import('@course-java/pages/LessonJavaModern')),
      LessonSpringCore:    lazy(() => import('@course-java/pages/LessonSpringCore')),
      LessonSpringWeb:     lazy(() => import('@course-java/pages/LessonSpringWeb')),
      LessonSpringData:    lazy(() => import('@course-java/pages/LessonSpringData')),
      LessonSpringSecurity:lazy(() => import('@course-java/pages/LessonSpringSecurity')),
      LessonSpringCloud:   lazy(() => import('@course-java/pages/LessonSpringCloud')),
      LessonSpringMQ:      lazy(() => import('@course-java/pages/LessonSpringMQ')),
      LessonSpringDeploy:  lazy(() => import('@course-java/pages/LessonSpringDeploy')),
    }
  },
  'distributed-systems': {
    manifest: distManifest,
    components: {
      LessonDistFundamentals:lazy(() => import('@course-dist/pages/LessonDistFundamentals')),
      LessonConsensus:       lazy(() => import('@course-dist/pages/LessonConsensus')),
      LessonConsistency:     lazy(() => import('@course-dist/pages/LessonConsistency')),
      LessonDistTxn:         lazy(() => import('@course-dist/pages/LessonDistTxn')),
      LessonDistStorage:     lazy(() => import('@course-dist/pages/LessonDistStorage')),
      LessonDistComputing:   lazy(() => import('@course-dist/pages/LessonDistComputing')),
      LessonMicroserviceGov: lazy(() => import('@course-dist/pages/LessonMicroserviceGov')),
      LessonChaosEng:        lazy(() => import('@course-dist/pages/LessonChaosEng')),
    }
  },
  'shell-automation': {
    manifest: shellManifest,
    components: {
      LessonBashBasics:      lazy(() => import('@course-shell/pages/LessonBashBasics')),
      LessonTextProcessing:  lazy(() => import('@course-shell/pages/LessonTextProcessing')),
      LessonRegex:           lazy(() => import('@course-shell/pages/LessonRegex')),
      LessonFunctionsModules:lazy(() => import('@course-shell/pages/LessonFunctionsModules')),
      LessonProcessSignals:  lazy(() => import('@course-shell/pages/LessonProcessSignals')),
      LessonSystemScripts:   lazy(() => import('@course-shell/pages/LessonSystemScripts')),
      LessonAnsibleAuto:     lazy(() => import('@course-shell/pages/LessonAnsibleAuto')),
      LessonShellProject:    lazy(() => import('@course-shell/pages/LessonShellProject')),
    }
  },
};
