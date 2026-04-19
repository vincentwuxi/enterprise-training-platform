/**
 * AiAssistant — Floating AI Chat Widget
 * ──────────────────────────────────────
 * Fixed-position FAB in bottom-right corner.
 * Opens a chat window for term explanations during learning.
 * Supports Gemini & OpenAI-compatible endpoints.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import './AiAssistant.css';

// ── Simple Markdown renderer (no deps) ──
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Headings (only h4-h6 for chat context)
    .replace(/^#### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    // Unordered lists
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newline → <br>
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');
  return `<p>${html}</p>`;
}

const QUICK_PROMPTS = [
  '什么是 Transformer？',
  '解释一下 RAG',
  'LLM 和 SLM 的区别',
  'Fine-tuning 是什么？',
];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const sendMessage = useCallback(async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    setInput('');
    setError('');

    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send only last 10 messages for context window efficiency
      const contextMessages = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const data = await api.post('/api/ai/chat', { messages: contextMessages });
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      const errMsg = err.data?.error || err.message || 'AI 服务暂不可用';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-chat-header-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <h4>AI 学习助手</h4>
                <p>名词解释 · 概念答疑</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {messages.length > 0 && (
                <button className="ai-chat-close" onClick={clearChat} title="清空对话">
                  <RotateCcw size={16} />
                </button>
              )}
              <button className="ai-chat-close" onClick={() => setOpen(false)} title="关闭">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 && !loading && (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">
                  <Sparkles size={24} />
                </div>
                <h5>你好！我是 AI 学习助手 👋</h5>
                <p>在学习过程中遇到不理解的概念？<br />输入名词即可获取解释</p>
                <div className="ai-welcome-chips">
                  {QUICK_PROMPTS.map((q, i) => (
                    <button key={i} className="ai-welcome-chip" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  msg.content
                )}
              </div>
            ))}

            {loading && (
              <div className="ai-typing">
                <span /><span /><span />
              </div>
            )}

            {error && <div className="ai-error">⚠️ {error}</div>}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入概念名词或问题..."
              disabled={loading}
            />
            <button
              className="ai-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className={`ai-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} title="AI 学习助手">
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </>
  );
}
