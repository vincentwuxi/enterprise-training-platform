/**
 * AiAssistant — Floating AI Chat Widget
 * ──────────────────────────────────────
 * Fixed-position FAB in bottom-right corner.
 * Opens a chat window for term explanations during learning.
 * Supports Gemini & OpenAI-compatible endpoints.
 *
 * Features:
 * - Copy AI responses to clipboard
 * - Save/bookmark AI responses as notes
 * - Notebook tab to review saved notes
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, RotateCcw, Copy, Check, Bookmark, BookOpen, Trash2, Search, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import './AiAssistant.css';

// ── Saved notes storage key ──
const NOTES_STORAGE_KEY = 'aivolearn_saved_notes';

function loadSavedNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || '[]');
  } catch { return []; }
}

function persistNotes(notes) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

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

// ── Extract a short title from the user's question ──
function extractTitle(question) {
  // Remove question marks, take first 30 chars
  const clean = question.replace(/[？?]/g, '').trim();
  return clean.length > 30 ? clean.slice(0, 30) + '…' : clean;
}

const QUICK_PROMPTS = [
  '什么是 Transformer？',
  '解释一下 RAG',
  'Docker 和虚拟机的区别',
  '什么是梯度下降？',
  'K8s Pod 是什么概念？',
  'Prompt Engineering 入门',
];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('chat'); // 'chat' | 'notebook'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [savedIdx, setSavedIdx] = useState(null);
  const [savedNotes, setSavedNotes] = useState(loadSavedNotes);
  const [noteSearch, setNoteSearch] = useState('');
  const [copiedNoteId, setCopiedNoteId] = useState(null);
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
    if (open && tab === 'chat' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, tab]);

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

  // ── Copy message to clipboard ──
  const handleCopy = useCallback(async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      // Fallback: textarea copy
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  }, []);

  // ── Save message as note ──
  const handleSave = useCallback((assistantMsg, idx) => {
    // Find the user question that preceded this response
    const userQuestion = messages.slice(0, idx).reverse().find(m => m.role === 'user')?.content || '未知问题';

    const newNote = {
      id: Date.now().toString(),
      question: userQuestion,
      title: extractTitle(userQuestion),
      answer: assistantMsg.content,
      savedAt: new Date().toISOString(),
    };

    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    persistNotes(updated);
    setSavedIdx(idx);
    setTimeout(() => setSavedIdx(null), 2000);
  }, [messages, savedNotes]);

  // ── Delete a saved note ──
  const handleDeleteNote = useCallback((noteId) => {
    const updated = savedNotes.filter(n => n.id !== noteId);
    setSavedNotes(updated);
    persistNotes(updated);
  }, [savedNotes]);

  // ── Copy a saved note ──
  const handleCopyNote = useCallback(async (text, noteId) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedNoteId(noteId);
    setTimeout(() => setCopiedNoteId(null), 2000);
  }, []);

  // ── Filtered notes for search ──
  const filteredNotes = noteSearch.trim()
    ? savedNotes.filter(n =>
        n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
        n.answer.toLowerCase().includes(noteSearch.toLowerCase()) ||
        n.question.toLowerCase().includes(noteSearch.toLowerCase())
      )
    : savedNotes;

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
                <p>{tab === 'chat' ? '名词解释 · 概念答疑 · 学习引导' : `📓 我的笔记本 (${savedNotes.length})`}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {/* Tab toggle */}
              <button
                className={`ai-chat-close ${tab === 'notebook' ? 'active-tab' : ''}`}
                onClick={() => setTab(tab === 'chat' ? 'notebook' : 'chat')}
                title={tab === 'chat' ? '我的笔记本' : '返回对话'}
              >
                {tab === 'chat' ? <BookOpen size={16} /> : <ArrowLeft size={16} />}
                {tab === 'chat' && savedNotes.length > 0 && (
                  <span className="note-count-badge">{savedNotes.length}</span>
                )}
              </button>
              {tab === 'chat' && messages.length > 0 && (
                <button className="ai-chat-close" onClick={clearChat} title="清空对话">
                  <RotateCcw size={16} />
                </button>
              )}
              <button className="ai-chat-close" onClick={() => setOpen(false)} title="关闭">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ════════ Chat Tab ════════ */}
          {tab === 'chat' && (
            <>
              <div className="ai-chat-messages">
                {messages.length === 0 && !loading && (
                  <div className="ai-welcome">
                    <div className="ai-welcome-icon">
                      <Sparkles size={24} />
                    </div>
                    <h5>嗨，同学！我是你的 AI 学长 👋</h5>
                    <p>学习中遇到不懂的概念？问我就对了！<br />我会用「定义→原理→例子」帮你快速理解 ✨</p>
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
                      <>
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                        {/* Action buttons for assistant messages */}
                        <div className="ai-msg-actions">
                          <button
                            className={`ai-action-btn ${copiedIdx === i ? 'success' : ''}`}
                            onClick={() => handleCopy(msg.content, i)}
                            title="复制内容"
                          >
                            {copiedIdx === i ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制</>}
                          </button>
                          <button
                            className={`ai-action-btn save ${savedIdx === i ? 'success' : ''}`}
                            onClick={() => handleSave(msg, i)}
                            title="保存到笔记本"
                          >
                            {savedIdx === i ? <><Check size={12} /> 已保存</> : <><Bookmark size={12} /> 保存</>}
                          </button>
                        </div>
                      </>
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
            </>
          )}

          {/* ════════ Notebook Tab ════════ */}
          {tab === 'notebook' && (
            <div className="ai-notebook">
              {savedNotes.length === 0 ? (
                <div className="ai-notebook-empty">
                  <BookOpen size={32} className="ai-notebook-empty-icon" />
                  <h5>笔记本是空的</h5>
                  <p>在对话中点击「保存」按钮，<br />即可将 AI 解释的内容收藏到这里 📌</p>
                  <button className="ai-welcome-chip" onClick={() => setTab('chat')}>去提问</button>
                </div>
              ) : (
                <>
                  {/* Search bar */}
                  <div className="ai-notebook-search">
                    <Search size={14} className="ai-notebook-search-icon" />
                    <input
                      value={noteSearch}
                      onChange={e => setNoteSearch(e.target.value)}
                      placeholder="搜索已保存的笔记..."
                    />
                    {noteSearch && (
                      <button className="ai-notebook-search-clear" onClick={() => setNoteSearch('')}>
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Notes list */}
                  <div className="ai-notebook-list">
                    {filteredNotes.length === 0 ? (
                      <div className="ai-notebook-no-match">未找到匹配的笔记</div>
                    ) : (
                      filteredNotes.map(note => (
                        <div key={note.id} className="ai-note-card">
                          <div className="ai-note-header">
                            <span className="ai-note-question">💬 {note.title}</span>
                            <span className="ai-note-date">
                              {new Date(note.savedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div
                            className="ai-note-content"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(note.answer) }}
                          />
                          <div className="ai-note-actions">
                            <button
                              className={`ai-action-btn ${copiedNoteId === note.id ? 'success' : ''}`}
                              onClick={() => handleCopyNote(note.answer, note.id)}
                            >
                              {copiedNoteId === note.id ? <><Check size={12} /> 已复制</> : <><Copy size={12} /> 复制</>}
                            </button>
                            <button
                              className="ai-action-btn delete"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 size={12} /> 删除
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button className={`ai-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} title="AI 学习助手">
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </>
  );
}
