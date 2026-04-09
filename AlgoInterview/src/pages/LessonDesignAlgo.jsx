import { useState } from 'react';
import './LessonCommon.css';

const DESIGN_PROBLEMS = [
  {
    key: 'lru', lc: '146', title: 'LRU Cache', difficulty: 'medium',
    desc: '设计一个满足 LRU 缓存约束的数据结构（get/put 均为 O(1)）。',
    system: '对应系统设计：Redis LRU 淘汰策略、CDN 缓存、浏览器历史',
    code: `# 双向链表 + 哈希表（手写版，面试推荐）
class Node:
    def __init__(self, k=0, v=0):
        self.key, self.val = k, v
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}                      # key → Node
        self.head = Node()                   # 虚拟头（最旧）
        self.tail = Node()                   # 虚拟尾（最新）
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_tail(self, node):           # 最近使用 → 靠近尾部
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key: int) -> int:
        if key not in self.cache: return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_tail(node)             # 移到最新位置
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self._add_to_tail(node)
        self.cache[key] = node
        if len(self.cache) > self.cap:      # 超容量，删最旧
            lru = self.head.next
            self._remove(lru)
            del self.cache[lru.key]`,
  },
  {
    key: 'twitter', lc: '355', title: '设计推特', difficulty: 'medium',
    desc: '实现 postTweet、getNewsFeed（前10条）、follow、unfollow。',
    system: '对应系统设计：Twitter/微博 Feed 流、新闻推荐系统',
    code: `import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.tweet_ts = 0                       # 全局时间戳
        self.tweets = defaultdict(list)          # userId → [(ts, tweetId)]
        self.following = defaultdict(set)        # userId → {followeeId}

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.tweet_ts += 1
        self.tweets[userId].append((-self.tweet_ts, tweetId))  # 负号→最大堆

    def getNewsFeed(self, userId: int) -> list[int]:
        # 合并 userId + 所有 following 的推文，取最新10条
        heap = []
        # 把自己的推文也加进来
        candidates = self.following[userId] | {userId}
        for uid in candidates:
            user_tweets = self.tweets[uid]
            if user_tweets:
                # 只把每人最新的推文入堆（懒加载）
                ts, tid = user_tweets[-1]
                idx = len(user_tweets) - 1
                heapq.heappush(heap, (ts, tid, uid, idx))
        
        result = []
        while heap and len(result) < 10:
            ts, tid, uid, idx = heapq.heappop(heap)
            result.append(tid)
            if idx > 0:
                ts2, tid2 = self.tweets[uid][idx - 1]
                heapq.heappush(heap, (ts2, tid2, uid, idx - 1))
        return result

    def follow(self, followerId, followeeId):
        self.following[followerId].add(followeeId)

    def unfollow(self, followerId, followeeId):
        self.following[followerId].discard(followeeId)`,
  },
  {
    key: 'autocomplete', lc: '642', title: '搜索自动补全（Trie）', difficulty: 'hard',
    desc: '实现搜索词输入时的自动补全，返回热度最高的3个建议。',
    system: '对应系统设计：Google/百度搜索框、电商商品搜索',
    code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.suggestions = []  # 该节点对应的前缀的热门词列表

class SearchAutocomplete:
    def __init__(self, products: list[str], searchWord: str):
        self.root = TrieNode()
        products.sort()              # 排序后插入，方便维护字典序
        for p in products:
            self._insert(p)
        self.result = []
        node = self.root
        for c in searchWord:
            if c not in node.children:
                # 前缀不存在，后续所有输入无结果
                self.result += [[]] * (len(searchWord) - len(self.result))
                break
            node = node.children[c]
            self.result.append(node.suggestions[:3])   # 最多3个

    def _insert(self, word):
        node = self.root
        for c in word:
            if c not in node.children:
                node.children[c] = TrieNode()
            node = node.children[c]
            # 每个前缀节点维护最多3个建议（已排序，只存前3）
            if len(node.suggestions) < 3:
                node.suggestions.append(word)`,
  },
  {
    key: 'skiplist', lc: '1206', title: '设计跳表', difficulty: 'hard',
    desc: '实现跳表（skiplist）的 search/add/erase，支持 O(log n) 操作。',
    system: '对应系统设计：Redis Sorted Set 底层实现原理',
    code: `import random

class SkiplistNode:
    def __init__(self, val, level):
        self.val = val
        self.next = [None] * level    # 每层的下一个节点

class Skiplist:
    MAX_LEVEL = 16
    
    def __init__(self):
        self.head = SkiplistNode(-float('inf'), self.MAX_LEVEL)
        self.level = 1               # 当前最高层数
    
    def _random_level(self):
        level = 1
        while random.random() < 0.5 and level < self.MAX_LEVEL:
            level += 1
        return level
    
    def search(self, target: int) -> bool:
        node = self.head
        for i in range(self.level - 1, -1, -1):  # 从高层开始
            while node.next[i] and node.next[i].val < target:
                node = node.next[i]
        node = node.next[0]
        return node is not None and node.val == target
    
    def add(self, num: int) -> None:
        update = [self.head] * self.MAX_LEVEL   # 每层需要更新的前驱
        node = self.head
        for i in range(self.level - 1, -1, -1):
            while node.next[i] and node.next[i].val < num:
                node = node.next[i]
            update[i] = node
        
        new_level = self._random_level()
        if new_level > self.level:
            for i in range(self.level, new_level):
                update[i] = self.head
            self.level = new_level
        
        new_node = SkiplistNode(num, new_level)
        for i in range(new_level):
            new_node.next[i] = update[i].next[i]
            update[i].next[i] = new_node`,
  },
];

const CROSSREF = [
  { algo: 'LRU Cache', sys: 'Redis 内存淘汰策略', tech: '双向链表 + 哈希，O(1) 读写' },
  { algo: 'Trie 前缀树', sys: '搜索自动补全、IP 路由', tech: '每节点最多26个子节点，O(m) 查找' },
  { algo: '跳表', sys: 'Redis Sorted Set', tech: '多层有序链表，期望 O(log n)' },
  { algo: '布隆过滤器', sys: '去重/缓存穿透防护', tech: '多哈希函数 + BitArray，有假阳性' },
  { algo: '一致性哈希', sys: '分布式缓存分片', tech: '虚拟节点，节点增删只影响相邻' },
  { algo: '最小堆 Top-K', sys: '实时排行榜', tech: '维护大小 K 的最小堆' },
];

export default function LessonDesignAlgo() {
  const [prob, setProb] = useState('lru');
  const p = DESIGN_PROBLEMS.find(x => x.key === prob);

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块八 · Design Algorithm</div>
          <h1>设计题专训 — 算法 × 系统设计</h1>
          <p>设计题是算法与系统设计的交汇点。LRU Cache、Trie 前缀树、跳表——你写的算法代码，就是 Redis、搜索引擎的核心数据结构实现。</p>
        </div>

        <div className="al-metrics">
          {[{ v: 'LRU', l: 'Redis 缓存机制' }, { v: 'Trie', l: '搜索自动补全' }, { v: '跳表', l: 'Sorted Set' }, { v: '布隆', l: '缓存穿透防护' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Problem Library */}
        <div className="al-section">
          <h2>💡 设计题精讲</h2>
          <div className="al-tabs">
            {DESIGN_PROBLEMS.map(d => (
              <button key={d.key} className={`al-tab${prob === d.key ? ' active' : ''}`} onClick={() => setProb(d.key)}>
                #{d.lc} {d.title.slice(0, 8)}
              </button>
            ))}
          </div>
          {p && (
            <div className="al-problem">
              <div className="al-problem-header">
                <span className="al-problem-id">#{p.lc}</span>
                <span className="al-problem-title">{p.title}</span>
                <span className={`al-difficulty ${p.difficulty}`}>{p.difficulty === 'medium' ? '中等' : '困难'}</span>
              </div>
              <div className="al-problem-body">
                <p style={{ color: 'var(--al-muted)', fontSize: '.9rem', marginBottom: '.75rem' }}>{p.desc}</p>
                <div className="al-info">🏗️ <span><strong>系统设计关联：</strong>{p.system}</span></div>
                <div className="al-code">{p.code}</div>
              </div>
            </div>
          )}
        </div>

        {/* Bloom Filter */}
        <div className="al-section">
          <h2>🌸 布隆过滤器 — 缓存穿透防护</h2>
          <div className="al-code">{`# 布隆过滤器：用 k 个哈希函数 + BitArray 实现海量数据去重
# 优势：空间极小（1亿数据 ~120MB），查询 O(1)
# 缺点：有假阳性（说"存在"可能错，说"不存在"一定对）

class BloomFilter:
    def __init__(self, size: int, hash_count: int):
        self.size = size
        self.hash_count = hash_count
        self.bit_array = bytearray(size)
    
    def _hashes(self, item: str):
        import hashlib
        return [
            int(hashlib.md5(f"{item}_{i}".encode()).hexdigest(), 16) % self.size
            for i in range(self.hash_count)
        ]
    
    def add(self, item: str) -> None:
        for pos in self._hashes(item):
            self.bit_array[pos] = 1
    
    def might_contain(self, item: str) -> bool:
        """返回 True = 可能存在; False = 一定不存在"""
        return all(self.bit_array[pos] for pos in self._hashes(item))

# 实际工程：pybloom_live 库（推荐生产使用）
# Redis 4.0+ 内置 BF.ADD / BF.EXISTS 命令
# 防缓存穿透：请求到 DB 前先过布隆过滤器`}</div>
          <div className="al-tip">🛡️ <span>布隆过滤器是"防缓存穿透"的标准答案。面试问到系统设计中如何防止大量不存在的 key 打穿缓存，直接答布隆过滤器。</span></div>
        </div>

        {/* Cross Reference Table */}
        <div className="al-section">
          <h2>🔗 算法 ↔ 系统设计 对应关系</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>算法/数据结构</th><th>系统设计应用</th><th>核心技术点</th></tr></thead>
              <tbody>
                {CROSSREF.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--al-primary)' }}>{r.algo}</td>
                    <td style={{ fontSize: '.85rem' }}>{r.sys}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>{r.tech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="al-good">✅ <span>面试小技巧：遇到系统设计题，主动提"底层用 X 数据结构实现"会加分。比如"排行榜用 Redis Sorted Set，底层是跳表"。</span></div>
        </div>

        {/* Final Checklist */}
        <div className="al-section">
          <h2>📋 面试算法准备清单</h2>
          <div className="al-grid-2">
            {[
              { t: '✅ 必背模板', d: '双指针、滑动窗口、BFS/DFS、二分、基础DP——这 5 类模板吃透，覆盖 60% 的题' },
              { t: '✅ 复杂度分析', d: '每道题必须说出时间/空间复杂度，并解释为什么，这是高级工程师的基本功' },
              { t: '✅ Edge Case', d: '空数组、单元素、负数、重复元素——面试前必须主动说出考虑了哪些边界' },
              { t: '✅ 先暴力后优化', d: '不要一上来就想最优解，先说清楚暴力 O(n²) 的思路，再优化到 O(n log n)' },
              { t: '✅ 配合系统设计', d: 'LRU/Trie/跳表/布隆过滤器——能与系统设计题联动，体现架构思维' },
              { t: '✅ LeetCode 刷题计划', d: '按专题刷：数组→链表→树→图→DP，每个专题 15-20 题后再做综合模拟' },
            ].map((c, i) => (
              <div key={i} className="al-card">
                <div className="al-card-title">{c.t}</div>
                <div className="al-card-body">{c.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
