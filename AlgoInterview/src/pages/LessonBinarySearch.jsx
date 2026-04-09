import { useState } from 'react';
import './LessonCommon.css';

const BS_TEMPLATES = [
  {
    key: 'basic', label: '基础二分',
    desc: '在有序数组中查找目标值，返回索引',
    code: `# 模板一：闭区间 [l, r]（推荐，最不容易出错）
def binary_search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:                    # 注意 <=
        mid = l + (r - l) // 2      # 防溢出写法
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            l = mid + 1              # 目标在右半
        else:
            r = mid - 1              # 目标在左半
    return -1  # 未找到

# 模板二：左闭右开 [l, r)（特定场景用）
def binary_search_v2(nums, target):
    l, r = 0, len(nums)              # r 是长度
    while l < r:                     # 注意 <
        mid = l + (r - l) // 2
        if nums[mid] < target: l = mid + 1
        else:                  r = mid    # r 不是 mid-1
    return l  # 返回 target 应在的位置（等于 bisect_left）`,
  },
  {
    key: 'boundary', label: '边界查找',
    desc: '查找第一个/最后一个满足条件的元素',
    code: `# 查找左边界（第一个 >= target 的位置）
def lower_bound(nums, target):
    l, r = 0, len(nums)
    while l < r:
        mid = l + (r - l) // 2
        if nums[mid] < target: l = mid + 1  # 太小，右移
        else:                  r = mid       # 可能是答案，缩小到此
    return l  # l == r，即第一个 >= target 的位置

# 查找右边界（最后一个 <= target 的位置）
def upper_bound(nums, target):
    l, r = 0, len(nums)
    while l < r:
        mid = l + (r - l) // 2
        if nums[mid] <= target: l = mid + 1  # 可能还有更右的
        else:                   r = mid
    return l - 1  # 最后一个 <= target 的位置

# 配合 Python bisect（面试可直接用）
from bisect import bisect_left, bisect_right
idx_l = bisect_left(nums, target)   # 第一个 >= target
idx_r = bisect_right(nums, target)  # 第一个 > target
# target 出现次数 = idx_r - idx_l`,
  },
  {
    key: 'rotate', label: '旋转数组',
    desc: '在旋转后的有序数组中查找目标（LC33/81）',
    code: `# LC33: 搜索旋转排序数组（无重复元素）
def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if nums[mid] == target: return mid
        
        # 判断 mid 落在哪段有序区间（至少一段有序）
        if nums[l] <= nums[mid]:     # 左段有序
            if nums[l] <= target < nums[mid]:
                r = mid - 1          # target 在左段
            else:
                l = mid + 1          # target 在右段
        else:                        # 右段有序
            if nums[mid] < target <= nums[r]:
                l = mid + 1          # target 在右段
            else:
                r = mid - 1          # target 在左段
    return -1`,
  },
  {
    key: 'answer', label: '答案二分',
    desc: '最优化问题：最大化最小值 / 最小化最大值',
    code: `# 模板：在答案空间上二分（最小/最大化某个值）
# 问："最小的最大值是多少？" → 二分答案

# LC875: 爱吃香蕉的珂珂（求最小速度）
def minEatingSpeed(piles, h):
    def can_finish(speed):
        # 以 speed 吃，能在 h 小时内吃完吗？
        return sum((p + speed - 1) // speed for p in piles) <= h
    
    l, r = 1, max(piles)
    while l < r:
        mid = l + (r - l) // 2
        if can_finish(mid):
            r = mid        # mid 可行，尝试更小
        else:
            l = mid + 1    # mid 不行，速度得更大
    return l

# LC1011: 传送包裹（求最小载重）
# 套路完全相同！只需修改 can_finish 的判断逻辑
# 答案二分题型识别：能否在某个值下完成任务？
#   → 二分"某个值"，check 函数判断能否完成`,
  },
];

export default function LessonBinarySearch() {
  const [tab, setTab] = useState('basic');
  const [target, setTarget] = useState(7);
  const arr = [1, 3, 5, 7, 9, 11, 13, 15, 17];
  const [step, setStep] = useState(0);

  // Simulate binary search steps
  const steps = (() => {
    let l = 0, r = arr.length - 1, s = [];
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      s.push({ l, r, mid, val: arr[mid] });
      if (arr[mid] === target) break;
      else if (arr[mid] < target) l = mid + 1;
      else r = mid - 1;
    }
    return s;
  })();

  const cur = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="al-lesson">
      <div className="al-container">

        <div className="al-hero">
          <div className="al-badge">模块五 · Binary Search</div>
          <h1>二分搜索 — 边界定义与变体大全</h1>
          <p>一个模板在手，所有变体都是"换个 check 函数"。掌握边界统一处理、旋转数组、答案二分三大变体，面试中二分题不再失分。</p>
        </div>

        <div className="al-metrics">
          {[{ v: 'O(log n)', l: '时间复杂度' }, { v: '4类', l: '变体类型' }, { v: '统一', l: '边界处理' }, { v: '答案二分', l: '最优化问题' }].map(m => (
            <div key={m.l} className="al-metric-card"><div className="al-metric-value">{m.v}</div><div className="al-metric-label">{m.l}</div></div>
          ))}
        </div>

        {/* Interactive Binary Search */}
        <div className="al-section">
          <h2>🎮 交互演示：在有序数组中查找目标</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '.82rem', color: 'var(--al-muted)' }}>目标值 target = {target}</label>
              <input type="range" style={{ display: 'block', marginTop: '.4rem', width: 200 }}
                min={1} max={17} step={2} value={target}
                onChange={e => { setTarget(+e.target.value); setStep(0); }} />
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="al-tab" onClick={() => setStep(Math.max(0, step - 1))}>← 上一步</button>
              <button className="al-tab" onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>下一步 →</button>
              <button className="al-tab" onClick={() => setStep(0)}>重置</button>
            </div>
            <span className="al-tag">步骤 {step + 1}/{steps.length}</span>
          </div>
          <div className="al-array" style={{ marginBottom: '1.5rem' }}>
            {arr.map((v, i) => {
              const isL = i === cur.l, isR = i === cur.r, isMid = i === cur.mid;
              const outOfRange = i < cur.l || i > cur.r;
              return (
                <div key={i} className={`al-cell${isMid ? ' match' : isL ? ' left' : isR ? ' right' : ''}`}
                  style={{ opacity: outOfRange ? 0.25 : 1 }}>
                  {v}
                  {isL && <span className="al-ptr-label" style={{ color: 'var(--al-accent2)' }}>L</span>}
                  {isR && !isMid && <span className="al-ptr-label" style={{ color: 'var(--al-blue)' }}>R</span>}
                  {isMid && <span className="al-ptr-label" style={{ color: 'var(--al-primary)' }}>mid</span>}
                </div>
              );
            })}
          </div>
          <div style={{ background: 'var(--al-surface2)', border: `1px solid ${arr[cur.mid] === target ? 'var(--al-accent2)' : 'var(--al-border)'}`, borderRadius: 10, padding: '1rem 1.5rem', fontSize: '.9rem' }}>
            <strong>当前状态：</strong> l={cur.l}, r={cur.r}, mid={cur.mid}, arr[mid]={arr[cur.mid]}
            {arr[cur.mid] === target
              ? <span style={{ color: 'var(--al-accent2)', marginLeft: '1rem' }}>✅ 找到目标 {target}，返回索引 {cur.mid}</span>
              : arr[cur.mid] < target
                ? <span style={{ color: 'var(--al-accent)', marginLeft: '1rem' }}>→ arr[mid]({arr[cur.mid]}) &lt; target({target})，l = mid + 1</span>
                : <span style={{ color: 'var(--al-red)', marginLeft: '1rem' }}>→ arr[mid]({arr[cur.mid]}) &gt; target({target})，r = mid - 1</span>}
          </div>
        </div>

        {/* Templates */}
        <div className="al-section">
          <h2>📋 四类模板详解</h2>
          <div className="al-tabs">
            {BS_TEMPLATES.map(t => <button key={t.key} className={`al-tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
          </div>
          <div className="al-info">ℹ️ <span>{BS_TEMPLATES.find(t => t.key === tab)?.desc}</span></div>
          <div className="al-code">{BS_TEMPLATES.find(t => t.key === tab)?.code}</div>
        </div>

        {/* Common Mistakes */}
        <div className="al-section">
          <h2>⚠️ 二分常见错误与规避</h2>
          <div className="al-grid-2">
            {[
              { wrong: 'mid = (l + r) / 2', right: 'mid = l + (r - l) // 2', reason: 'l+r 可能溢出 int（Java/C++ 需注意）' },
              { wrong: 'while l < r', right: 'while l <= r（闭区间）', reason: '闭区间最后一轮 l==r 时还需要检查 mid' },
              { wrong: 'l = mid, r = mid', right: 'l = mid+1, r = mid-1', reason: '当 l==r==mid 时无限循环' },
              { wrong: '直接 return mid', right: '先存 ans，继续搜索', reason: '找边界时需要找到后继续缩范围' },
            ].map((e, i) => (
              <div key={i} className="al-card">
                <div style={{ color: 'var(--al-red)', fontFamily: 'JetBrains Mono,monospace', fontSize: '.82rem', marginBottom: '.5rem' }}>❌ {e.wrong}</div>
                <div style={{ color: 'var(--al-accent2)', fontFamily: 'JetBrains Mono,monospace', fontSize: '.82rem', marginBottom: '.5rem' }}>✅ {e.right}</div>
                <div className="al-card-body">{e.reason}</div>
              </div>
            ))}
          </div>
          <div className="al-good">✅ <span><strong>记忆口诀</strong>：闭区间用 <code>&lt;=</code>，开区间用 <code>&lt;</code>；向右收缩 l=mid+1，向左收缩 r=mid-1（闭区间）或 r=mid（开区间）。</span></div>
        </div>

        {/* High Freq */}
        <div className="al-section">
          <h2>🔥 高频二分题目</h2>
          <div className="al-table-wrap">
            <table className="al-table">
              <thead><tr><th>题目</th><th>类型</th><th>复杂度</th><th>难度</th></tr></thead>
              <tbody>
                {[
                  ['#704 二分查找', '基础二分', 'O(log n)', 'easy'],
                  ['#34 在排序数组中查找元素范围', '左右边界', 'O(log n)', 'medium'],
                  ['#33 搜索旋转排序数组', '旋转数组', 'O(log n)', 'medium'],
                  ['#153 寻找旋转排序数组中的最小值', '旋转数组', 'O(log n)', 'medium'],
                  ['#875 爱吃香蕉的珂珂', '答案二分', 'O(n log m)', 'medium'],
                  ['#1011 在D天内送达包裹', '答案二分', 'O(n log m)', 'medium'],
                  ['#74 搜索二维矩阵', '矩阵二分', 'O(log mn)', 'medium'],
                ].map(([t, type, c, d], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t}</td>
                    <td><span className="al-tag">{type}</span></td>
                    <td style={{ fontFamily: 'JetBrains Mono,monospace', color: 'var(--al-accent)', fontSize: '.82rem' }}>{c}</td>
                    <td><span className={`al-difficulty ${d}`}>{d === 'easy' ? '简单' : '中等'}</span></td>
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
