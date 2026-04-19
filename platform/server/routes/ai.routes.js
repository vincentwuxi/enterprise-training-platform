/**
 * AI Routes — /api/ai/*
 * ─────────────────────
 * POST /api/ai/chat              — Proxy chat to configured AI endpoint
 * GET  /api/admin/ai-config      — Get AI config (admin)
 * PUT  /api/admin/ai-config      — Update AI config (admin)
 * GET  /api/admin/ai-models      — List models from endpoint (admin)
 */
import { Router } from 'express';
import prisma from '../config/database.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ── Defaults ──
const DEFAULTS = {
  'ai.endpoint': 'https://generativelanguage.googleapis.com/v1beta',
  'ai.apiKey': '',
  'ai.model': 'gemini-2.0-flash',
};

const SYSTEM_PROMPT = `你是 AivoloLearn 平台的 AI 学习助手。你的职责：
1. 为学习者解释技术名词和概念
2. 用简洁清晰的中文回答问题
3. 回答聚焦于 AI、机器学习、深度学习、编程、基础设施等技术领域
4. 如果用户提问超出技术学习范畴，礼貌地引导回学习话题
5. 回答应当准确、简练，适合快速查阅
请用 Markdown 格式输出。`;

// ── Helper: read settings ──
async function getAiConfig() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.keys(DEFAULTS) } },
  });
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    endpoint: map['ai.endpoint'] || DEFAULTS['ai.endpoint'],
    apiKey: map['ai.apiKey'] || DEFAULTS['ai.apiKey'],
    model: map['ai.model'] || DEFAULTS['ai.model'],
  };
}

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC (requires login): POST /api/ai/chat
// ══════════════════════════════════════════════════════════════════════════
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '请提供对话消息' });
    }

    const config = await getAiConfig();
    if (!config.apiKey) {
      return res.status(503).json({ error: 'AI 助手尚未配置，请联系管理员设置 API Key' });
    }

    // Build request based on endpoint type
    const isGemini = config.endpoint.includes('googleapis.com');
    const isOpenAI = !isGemini;

    let aiResponse;

    if (isGemini) {
      // ── Gemini API ──
      const url = `${config.endpoint}/models/${config.model}:generateContent?key=${config.apiKey}`;
      const contents = [];

      // Add system instruction as first user turn context
      contents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }],
      });
      contents.push({
        role: 'model',
        parts: [{ text: '好的，我是 AivoloLearn 的 AI 学习助手，请问有什么技术问题需要我帮您解释？' }],
      });

      // Map messages
      for (const m of messages) {
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.error('[AI] Gemini error:', JSON.stringify(data).slice(0, 300));
        return res.status(502).json({ error: data.error?.message || 'AI 服务响应异常' });
      }

      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '抱歉，AI 未返回有效内容。';
    } else {
      // ── OpenAI-compatible API ──
      const url = `${config.endpoint.replace(/\/$/, '')}/chat/completions`;
      const body = {
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.error('[AI] OpenAI error:', JSON.stringify(data).slice(0, 300));
        return res.status(502).json({ error: data.error?.message || 'AI 服务响应异常' });
      }

      aiResponse = data.choices?.[0]?.message?.content || '抱歉，AI 未返回有效内容。';
    }

    res.json({ success: true, content: aiResponse });
  } catch (err) {
    console.error('[AI] Chat error:', err.message);
    res.status(500).json({ error: '与 AI 服务通信失败：' + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/admin/ai-config
// ══════════════════════════════════════════════════════════════════════════
router.get('/admin/config', requireAuth, requireAdmin, async (req, res) => {
  try {
    const config = await getAiConfig();
    // Mask API key for frontend display
    const maskedKey = config.apiKey
      ? config.apiKey.slice(0, 6) + '****' + config.apiKey.slice(-4)
      : '';
    res.json({
      success: true,
      config: { endpoint: config.endpoint, apiKey: maskedKey, model: config.model },
      hasKey: !!config.apiKey,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN: PUT /api/admin/ai-config
// ══════════════════════════════════════════════════════════════════════════
router.put('/admin/config', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { endpoint, apiKey, model } = req.body;
    const updates = [];

    if (endpoint !== undefined) {
      updates.push(prisma.setting.upsert({
        where: { key: 'ai.endpoint' },
        update: { value: endpoint, updatedAt: new Date() },
        create: { key: 'ai.endpoint', value: endpoint },
      }));
    }
    if (apiKey !== undefined && !apiKey.includes('****')) {
      // Only update if not masked
      updates.push(prisma.setting.upsert({
        where: { key: 'ai.apiKey' },
        update: { value: apiKey, updatedAt: new Date() },
        create: { key: 'ai.apiKey', value: apiKey },
      }));
    }
    if (model !== undefined) {
      updates.push(prisma.setting.upsert({
        where: { key: 'ai.model' },
        update: { value: model, updatedAt: new Date() },
        create: { key: 'ai.model', value: model },
      }));
    }

    await prisma.$transaction(updates);
    res.json({ success: true, message: 'AI 配置已更新' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ADMIN: GET /api/admin/ai-models — Fetch available models
// ══════════════════════════════════════════════════════════════════════════
router.get('/admin/models', requireAuth, requireAdmin, async (req, res) => {
  try {
    const config = await getAiConfig();
    if (!config.apiKey) {
      return res.status(400).json({ error: '请先配置 API Key' });
    }

    const isGemini = config.endpoint.includes('googleapis.com');
    let models = [];

    if (isGemini) {
      const url = `${config.endpoint}/models?key=${config.apiKey}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (!resp.ok) {
        return res.status(502).json({ error: data.error?.message || '获取模型列表失败' });
      }
      models = (data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => ({
          id: m.name.replace('models/', ''),
          name: m.displayName || m.name,
          description: m.description?.slice(0, 80) || '',
        }));
    } else {
      // OpenAI-compatible
      const url = `${config.endpoint.replace(/\/$/, '')}/models`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      const data = await resp.json();
      if (!resp.ok) {
        return res.status(502).json({ error: data.error?.message || '获取模型列表失败' });
      }
      models = (data.data || []).map(m => ({
        id: m.id,
        name: m.id,
        description: m.owned_by || '',
      }));
    }

    res.json({ success: true, models, current: config.model });
  } catch (err) {
    res.status(500).json({ error: '获取模型列表失败：' + err.message });
  }
});

export default router;
