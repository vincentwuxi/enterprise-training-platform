#!/usr/bin/env python3
"""Batch update course categories across all manifest files."""
import json
import os
import glob

BASE = "/Users/wenyun/code/training"

# Mapping: directory name -> new category
CATEGORY_MAP = {
    # 1. AI 基础与理论
    "微积分": "AI 基础与理论",
    "QuantumMechanics": "AI 基础与理论",
    "DeepLearning": "AI 基础与理论",
    "ReinforcementLearning": "AI 基础与理论",
    "NLPTextIntelligence": "AI 基础与理论",
    "CompArch": "AI 基础与理论",

    # 2. 大模型与 LLM
    "LLMMastery": "大模型与 LLM",
    "AIAPIMastery": "大模型与 LLM",
    "PromptEngineering": "大模型与 LLM",
    "RAGEngineering": "大模型与 LLM",
    "KnowledgeGraphRAG": "大模型与 LLM",
    "LLMFineTuning": "大模型与 LLM",
    "LLMFinetunePro": "大模型与 LLM",
    "OpenModelFinetune": "大模型与 LLM",
    "AISkillEngineering": "大模型与 LLM",
    "AISkillsMastery": "大模型与 LLM",

    # 3. AI Agent 工程
    "AIAgentEngineering": "AI Agent 工程",
    "AgentOps": "AI Agent 工程",
    "MCPToolEcosystem": "AI Agent 工程",
    "AINativeDev": "AI Agent 工程",
    "AIFullStackApps": "AI Agent 工程",
    "AI技能入门": "AI Agent 工程",

    # 4. AI 行业应用
    "AISearchRecommend": "AI 行业应用",
    "MultimodalAI": "AI 行业应用",
    "IndustryVerticalAI": "AI 行业应用",
    "ComputerVision": "AI 行业应用",
    "AIVoiceAudio": "AI 行业应用",
    "AIDataAnalytics": "AI 行业应用",
    "AIRealtimeMedia": "AI 行业应用",
    "AIEmbodiedRobotics": "AI 行业应用",
    "AIForScience": "AI 行业应用",
    "AIDataEngineering": "AI 行业应用",
    "PrivacyFederatedLearning": "AI 行业应用",

    # 5. AI 平台与安全
    "AIInfra": "AI 平台与安全",
    "OpenModelDeploy": "AI 平台与安全",
    "AIEvalEngineering": "AI 平台与安全",
    "AISafetyAlignment": "AI 平台与安全",
    "AIComplianceGov": "AI 平台与安全",
    "MLEngineering": "AI 平台与安全",
    "AISystemOptimization": "AI 平台与安全",
    "AIStrategyExecutive": "AI 平台与安全",

    # 6. AI 创意与效率
    "AICreativeDesign": "AI 创意与效率",
    "AIPersonalProductivity": "AI 创意与效率",
    "LLMProductDesign": "AI 创意与效率",
    "PMAIMastery": "AI 创意与效率",

    # 7. 编程与开发
    "PythonMastery": "编程与开发",
    "PythonAdvanced": "编程与开发",
    "ReactTypescript": "编程与开发",
    "DesignSystem": "编程与开发",
    "NodeNestJS": "编程与开发",
    "AlgoInterview": "编程与开发",
    "WasmEdge": "编程与开发",
    "TestingEngineering": "编程与开发",
    "OpenSourceContrib": "编程与开发",
    "PostgreSQLMastery": "编程与开发",

    # 8. 基础设施与运维
    "LinuxMastery": "基础设施与运维",
    "DockerK8sMastery": "基础设施与运维",
    "KubernetesOps": "基础设施与运维",
    "CICDMastery": "基础设施与运维",
    "NginxMastery": "基础设施与运维",
    "ObservabilityEngineering": "基础设施与运维",
    "CloudNative": "基础设施与运维",
    "CloudflareMastery": "基础设施与运维",
    "SecurityMastery": "基础设施与运维",
    "BlueTeam": "基础设施与运维",
    "SystemDesign": "基础设施与运维",

    # 9. 数据与存储
    "DatabaseMastery": "数据与存储",
    "DataEngineering": "数据与存储",
    "DataAnalysis": "数据与存储",
    "TCPIPMastery": "数据与存储",
    "PerfOptimization": "数据与存储",

    # 10. 产品与职业
    "GrowthHacking": "产品与职业",
    "InterviewMastery": "产品与职业",
    "SEOMastery": "产品与职业",
    "BlockchainWeb3": "产品与职业",
}

updated = 0
skipped = 0

for dir_name, new_category in CATEGORY_MAP.items():
    manifest_path = os.path.join(BASE, dir_name, "course.manifest.json")
    if not os.path.exists(manifest_path):
        print(f"  SKIP (not found): {dir_name}")
        skipped += 1
        continue

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    old_category = data.get("category", "NONE")
    if old_category == new_category:
        print(f"  OK (already correct): {dir_name} -> {new_category}")
        continue

    data["category"] = new_category
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"  UPDATED: {dir_name}: '{old_category}' -> '{new_category}'")
    updated += 1

print(f"\nDone: {updated} updated, {skipped} skipped")
