import { useState } from 'react';
import './LessonCommon.css';

const PROBLEMS = [
  {
    key: 'anagram', lc: '49', title: '字母异位词分组', difficulty: 'medium', tag: '哈希',
    code: `def groupAnagrams(strs):
    from collections import defaultdict
    
    # 关键：同一组异位词排序后相同 → 用排序结果做哈希key
    groups = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))     # "eat","ate","tea" → ("a","e","t")
        groups[key].append(s)
    return list(groups.values())

# 优化：用字符计数做 key（避免排序 O(k log k) → O(k)）
def groupAnagrams_v2(strs):
    groups = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s: count[ord(c) - ord('a')] += 1
        groups[tuple(count)].append(s)
    return list(groups.values())`,
  },
  {
    key: 'window', lc: '3', title: '无重复字符的最长子串', difficulty: 'medium', tag: '滑动窗口+哈希',
    code: `def lengthOfLongestSubstring(s):
    char_idx = {}      # 字符 → 最近出现的索引
    max_len = 0
    left = 0
    
    for right, c in enumerate(s):
        if c in char_idx and char_idx[c] >= left:
            # 字符已在窗口中，left 跳过它
            left = char_idx[c] + 1
        char_idx[c] = right
        max_len = max(max_len, right - left + 1)
    
    return max_len  # 时间 O(n)  空间 O(min(m,n))

# 通用滑动窗口 + Counter 写法
def lengthOfLongestSubstring_v2(s):
    from collections import Counter
    window = Counter()
    l = max_len = 0
    for r, c in enumerate(s):
        window[c] += 1
        while window[c] > 1:         # 出现重复，收缩左边界
            window[s[l]] -= 1; l += 1
        max_len = max(max_len, r - l + 1)
    return max_len`,
  },
  {
    key: 'palindrome', lc: '5', title: '最长回文子串', difficulty: 'medium', tag: '中心扩散',
    code: `def longestPalindrome(s):
    # 中心扩散法：以每个字符/间隙为中心向两边扩
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1; r += 1
        return s[l+1:r]    # 返回最长回文
    
    res = ""
    for i in range(len(s)):
        odd  = expand(i, i)      # 奇数长度（以字符为中心）
        even = expand(i, i + 1)  # 偶数长度（以间隙为中心）
        if len(odd)  > len(res): res = odd
        if len(even) > len(res): res = even
    return res

# DP 做法（面试也常考）
def longestPalindrome_dp(s):
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    start, max_len = 0, 1
    for i in range(n): dp[i][i] = True
    for l in range(2, n + 1):     # 枚举长度
        for i in range(n - l + 1):
            j = i + l - 1
            if s[i] == s[j]:
                dp[i][j] = (l == 2) or dp[i+1][j-1]
                if dp[i][j] and l > max_len:
                    start, max_len = i, l
    return s[start:start+max_len]`,
  },
  {
    key: 'kmp', lc: '28', title: 'KMP 字符串匹配', difficulty: 'medium', tag: 'KMP',
    code: `def strStr(haystack, needle):
    # KMP 算法：利用部分匹配表避免重复比较
    if not needle: return 0
    
    # 1. 构建 next 数组（最长公共前后缀长度）
    def build_next(pattern):
        next_arr = [0] * len(pattern)
        j = 0  # 当前最长前后缀长度
        for i in range(1, len(pattern)):
            while j > 0 and pattern[i] != pattern[j]:
                j = next_arr[j - 1]    # 回退
            if pattern[i] == pattern[j]: j += 1
            next_arr[i] = j
        return next_arr
    
    next_arr = build_next(needle)
    
    # 2. 匹配
    j = 0  # needle 的指针
    for i in range(len(haystack)):
        while j > 0 and haystack[i] != needle[j]:
            j = next_arr[j - 1]        # 失配时利用next跳回
        if haystack[i] == needle[j]: j += 1
        if j == len(needle):
            return i - j + 1           # 找到了
    return -1  # 时间 O(n+m)  空间 O(m)`,
  },
];

export default function LessonHashString() {
  const [prob, setProb] = useState('anagram');
  const p = PROBLEMS.find(x => x.key === prob);

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块四 · Hash & String</div>
          <h1>哈希表 & 字符串 — 映射与匹配</h1>
          <p>哈希表用 O(1) 查询换取空间，是"空间换时间"的最典型代表。字符串题则以滑动窗口 + 哈希为核心，KMP 是高频考点。</p>
        </div>

        <div className="al-metrics">
          {[{ v: 'O(1)', l: '哈希查询' }, { v: '滑动窗口', l: '字符串核心' }, { v: 'KMP', l: 'O(n+m)匹配' }, { v: '计数', l: '异位词技巧' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        <div className="al-section">
          <h2>📚 高频题精讲</h2>
          <div className="al-tabs">
            {PROBLEMS.map(d => <button key={d.key} className={`al-tab${prob === d.key ? ' active' : ''}`} onClick={() => setProb(d.key)}>#{d.lc} {d.title.slice(0, 6)}</button>)}
          </div>
          {p && (
            <div className="al-problem">
              <div className="al-problem-header">
                <span className="al-problem-id">#{p.lc}</span>
                <span className="al-problem-title">{p.title}</span>
                <span className={`al-difficulty ${p.difficulty}`}>中等</span>
                <span className="al-tag">{p.tag}</span>
              </div>
              <div className="al-problem-body"><div className="al-code">{p.code}</div></div>
            </div>
          )}
        </div>

        <div className="al-section">
          <h2>🗂️ 哈希表常用技巧速查</h2>
          <div className="al-code">{`# 1. 计数器（Counter）
from collections import Counter
c = Counter("abracadabra")    # {'a':5,'b':2,'r':2,'c':1,'d':1}
c.most_common(2)              # [('a',5),('b',2)] 最高频

# 2. 前缀和 + 哈希（子数组和）
seen = {0: 1}; prefix = 0
for num in nums:
    prefix += num
    count += seen.get(prefix - k, 0)
    seen[prefix] = seen.get(prefix, 0) + 1

# 3. 双向映射（判断双射 isomorphic LC205）
def isIsomorphic(s, t):
    s2t, t2s = {}, {}
    for a, b in zip(s, t):
        if s2t.get(a, b) != b or t2s.get(b, a) != a:
            return False
        s2t[a] = b; t2s[b] = a
    return True

# 4. 哈希集合（查重/去重）
seen = set()
for num in nums:
    if num in seen: return True   # O(1) 查询
    seen.add(num)

# 5. LRU Cache 用 OrderedDict 实现
from collections import OrderedDict
class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.cache = OrderedDict()
    def get(self, key):
        if key not in self.cache: return -1
        self.cache.move_to_end(key)    # 移到末尾=最近使用
        return self.cache[key]
    def put(self, key, value):
        if key in self.cache: self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)  # 删最旧（头部）`}</div>
        </div>

        <div className="al-section">
          <h2>📊 字符串高频题速查</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>题目</th><th>核心技巧</th><th>时间</th><th>难度</th></tr></thead>
              <tbody>
                {[
                  ['#3 最长无重复子串', '滑动窗口+哈希', 'O(n)', 'medium'],
                  ['#5 最长回文子串', '中心扩散/DP', 'O(n²)', 'medium'],
                  ['#76 最小覆盖子串', '滑动窗口+Counter', 'O(n)', 'hard'],
                  ['#28 KMP字串匹配', 'next数组预处理', 'O(n+m)', 'medium'],
                  ['#49 字母异位词分组', '排序做key/计数做key', 'O(nk log k)', 'medium'],
                  ['#438 找所有异位词', '滑动窗口+Counter', 'O(n)', 'medium'],
                  ['#647 回文子串数量', '中心扩散计数', 'O(n²)', 'medium'],
                ].map(([t, tech, time, d], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>{tech}</td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-accent)', fontSize: '.82rem' }}>{time}</td>
                    <td><span className={`al-difficulty ${d}`}>{d === 'hard' ? '困难' : '中等'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
