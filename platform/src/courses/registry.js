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
};
