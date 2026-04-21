import React, { useState, useCallback } from 'react';
import './LessonCommon.css';

/* ── Mini Language Compiler (Tiny-Calc: expression → stack VM) ── */
function compile(src) {
  const log = [];
  // 1. Tokenize
  const tokens = []; let p = 0;
  while (p < src.length) {
    if (/\s/.test(src[p])) { p++; continue; }
    if (/\d/.test(src[p])) { let n=''; while(p<src.length&&/[\d.]/.test(src[p])) n+=src[p++]; tokens.push({t:'NUM',v:n}); }
    else if (/[a-zA-Z_]/.test(src[p])) { let id=''; while(p<src.length&&/\w/.test(src[p])) id+=src[p++]; tokens.push({t:'ID',v:id}); }
    else tokens.push({t:'OP',v:src[p++]});
  }
  tokens.push({t:'EOF',v:''});
  log.push(`[Lexer] ${tokens.filter(t=>t.t!=='EOF').length} tokens: ${tokens.filter(t=>t.t!=='EOF').map(t=>`${t.t}(${t.v})`).join(' ')}`);

  // 2. Parse (Pratt)
  let ti=0;
  const pk=()=>tokens[ti]||{t:'EOF',v:''}, adv=()=>tokens[ti++];
  const PREC={'+':1,'-':1,'*':2,'/':2,'%':2};
  function ex(mbp=0){
    let tok=adv(),l;
    if(tok.t==='NUM')l={t:'Num',v:Number(tok.v)};
    else if(tok.t==='ID')l={t:'Var',v:tok.v};
    else if(tok.v==='('){l=ex(0);adv();}
    else if(tok.v==='-')l={t:'Neg',c:[ex(3)]};
    else return{t:'Err',v:tok.v};
    while(pk().t==='OP'&&PREC[pk().v]!==undefined){
      const op=pk(),bp=PREC[op.v]; if(bp<=mbp)break; adv();
      l={t:'BinOp',v:op.v,c:[l,ex(bp)]};
    }
    return l;
  }
  let ast;
  try { ast=ex(); } catch { ast={t:'Err',v:'parse error'}; }

  function astStr(n,pre='',last=true){
    if(!n)return'';
    const c=last?'└─ ':'├─ ',e=last?'   ':'│  ';
    let r=pre+c;
    if(n.t==='BinOp'){r+=`${n.v}\n`;n.c.forEach((ch,i)=>{r+=astStr(ch,pre+e,i===n.c.length-1);})}
    else if(n.t==='Neg'){r+=`neg\n`;r+=astStr(n.c[0],pre+e,true)}
    else r+=`${n.v}\n`;
    return r;
  }
  log.push(`[Parser] AST:\n${astStr(ast,'',true)}`);

  // 3. Codegen (stack VM bytecode)
  const code = [];
  function emit(n) {
    if(!n) return;
    if(n.t==='Num') code.push(`PUSH ${n.v}`);
    else if(n.t==='Var') code.push(`LOAD ${n.v}`);
    else if(n.t==='Neg') { emit(n.c[0]); code.push('NEG'); }
    else if(n.t==='BinOp') {
      emit(n.c[0]); emit(n.c[1]);
      const ops = {'+':'ADD','-':'SUB','*':'MUL','/':'DIV','%':'MOD'};
      code.push(ops[n.v]||'NOP');
    }
  }
  emit(ast);
  log.push(`[Codegen] Bytecode:\n  ${code.join('\n  ')}`);

  // 4. Execute on stack VM
  const stack = [];
  const vars = { x: 10, y: 5, z: 3, pi: 3.14159 };
  const trace = [];
  for (const instr of code) {
    const parts = instr.split(' ');
    const op = parts[0], arg = parts.slice(1).join(' ');
    if (op === 'PUSH') stack.push(Number(arg));
    else if (op === 'LOAD') stack.push(vars[arg] !== undefined ? vars[arg] : 0);
    else if (op === 'NEG') stack.push(-stack.pop());
    else if (op === 'ADD') { const b=stack.pop(),a=stack.pop(); stack.push(a+b); }
    else if (op === 'SUB') { const b=stack.pop(),a=stack.pop(); stack.push(a-b); }
    else if (op === 'MUL') { const b=stack.pop(),a=stack.pop(); stack.push(a*b); }
    else if (op === 'DIV') { const b=stack.pop(),a=stack.pop(); stack.push(b!==0?a/b:NaN); }
    else if (op === 'MOD') { const b=stack.pop(),a=stack.pop(); stack.push(a%b); }
    trace.push(`  ${instr.padEnd(12)} → stack: [${stack.join(', ')}]`);
  }
  const result = stack.length > 0 ? stack[stack.length-1] : 'empty';
  log.push(`[VM] Execution trace:\n${trace.join('\n')}\n\n  Result: ${result}`);

  return { log, result, tokens: tokens.filter(t=>t.t!=='EOF'), code };
}

const tabs = ['🏗️ 项目架构', '📐 语言设计', '🛠️ 实现路径', '🎮 编译器 REPL'];

const DEMO = '(x + y) * 2 - z';

export default function LessonCompilerProject() {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState(DEMO);
  const [output, setOutput] = useState(() => compile(DEMO));
  const [showPhase, setShowPhase] = useState(-1); // -1 = all

  const handleCompile = useCallback(() => {
    setOutput(compile(input));
  }, [input]);

  return (
    <div className="lesson-fullstack">
      <div className="fs-badge amber">⚙️ module_08 — 实战项目</div>
      <div className="fs-hero">
        <h1>实战项目：设计并实现一门小型语言</h1>
        <p>
          将前七个模块的知识融会贯通——设计一门小型语言，实现完整的编译器：
          <strong>Lexer → Parser → AST → 语义检查 → Codegen → VM 执行</strong>。
          下面的交互式 REPL 展示了整条编译流水线的每个阶段。
        </p>
      </div>

      <section className="fs-section">
        <h2 className="fs-section-title">⚙️ 编译器实战</h2>
        <div className="fs-pills">
          {tabs.map((t, i) => (
            <button key={i} className={`fs-btn ${active === i ? 'primary' : ''}`} onClick={() => setActive(i)}>{t}</button>
          ))}
        </div>

        {active === 0 && (
          <div className="fs-card">
            <h3>🏗️ 项目架构 — TinyLang 编译器</h3>
            <div className="concept-card">
              <h4>编译器开发的经典架构</h4>
              <p>遵循 UNIX 哲学：每个阶段是独立模块，输入上一阶段的输出，产生下一阶段的输入。</p>
            </div>

            <div className="pipeline" style={{marginTop:'1rem'}}>
              <div className="pipeline-stage" style={{background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.3)', color:'#c4b5fd'}}>
                <span>📝 Source</span><small>.tiny 文件</small>
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-stage" style={{background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.3)', color:'#93c5fd'}}>
                <span>🔤 Lexer</span><small>Token 流</small>
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-stage" style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9'}}>
                <span>🌳 Parser</span><small>AST</small>
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-stage" style={{background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', color:'#fbbf24'}}>
                <span>🔍 Semantic</span><small>类型检查</small>
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-stage" style={{background:'rgba(251,113,133,0.1)', border:'1px solid rgba(251,113,133,0.3)', color:'#fda4af'}}>
                <span>⚡ Codegen</span><small>字节码</small>
              </div>
              <span className="pipeline-arrow">→</span>
              <div className="pipeline-stage" style={{background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac'}}>
                <span>🖥️ VM</span><small>执行结果</small>
              </div>
            </div>

            <div className="fs-code-wrap" style={{marginTop:'1rem'}}>
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> project_structure.txt</div>
              <pre className="fs-code">{`tinylang/
├── src/
│   ├── lexer.py        # Token 定义 + Lexer
│   ├── parser.py       # Pratt Parser → AST
│   ├── ast_nodes.py    # AST 节点类
│   ├── type_checker.py # 语义分析 + 类型检查
│   ├── codegen.py      # AST → 栈虚拟机字节码
│   ├── vm.py           # 栈虚拟机 (执行字节码)
│   └── repl.py         # 交互式 REPL
├── tests/
│   ├── test_lexer.py
│   ├── test_parser.py
│   └── test_e2e.py     # 端到端测试
├── examples/
│   ├── fibonacci.tiny
│   └── factorial.tiny
└── Makefile`}</pre>
            </div>
          </div>
        )}

        {active === 1 && (
          <div className="fs-card">
            <h3>📐 语言设计 — TinyLang 规范</h3>
            <div className="fs-code-wrap">
              <div className="fs-code-head"><span className="fs-code-dot" style={{background:'#7c3aed'}}></span> tinylang_spec.tiny</div>
              <pre className="fs-code">{`// ═══ TinyLang 语言规范 ═══

// 变量声明 (类型推断 + 可选标注)
let x = 42;
let name: string = "hello";
let pi: float = 3.14;

// 函数定义
fn fibonacci(n: int) -> int {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 控制流
fn fizzbuzz(n: int) {
  let i = 1;
  while (i <= n) {
    if (i % 15 == 0) {
      print("FizzBuzz");
    } else if (i % 3 == 0) {
      print("Fizz");
    } else if (i % 5 == 0) {
      print("Buzz");
    } else {
      print(i);
    }
    i = i + 1;
  }
}

// ═══ TinyLang 文法 (EBNF) ═══
//
// program   = { statement }
// statement = letStmt | fnDecl | exprStmt | ifStmt | whileStmt | returnStmt
// letStmt   = "let" IDENT [ ":" type ] "=" expr ";"
// fnDecl    = "fn" IDENT "(" params ")" [ "->" type ] block
// ifStmt    = "if" "(" expr ")" block [ "else" (ifStmt | block) ]
// whileStmt = "while" "(" expr ")" block
// returnStmt= "return" [ expr ] ";"
// block     = "{" { statement } "}"
// expr      = assignment
// assignment= IDENT "=" expr | logicOr
// logicOr   = logicAnd { "||" logicAnd }
// logicAnd  = equality { "&&" equality }
// equality  = comparison { ("==" | "!=") comparison }
// comparison= addition { ("<" | ">" | "<=" | ">=") addition }
// addition  = multiply { ("+" | "-") multiply }
// multiply  = unary { ("*" | "/" | "%") unary }
// unary     = ("-" | "!") unary | call
// call      = primary [ "(" args ")" ]
// primary   = NUMBER | STRING | IDENT | "(" expr ")" | "true" | "false"`}</pre>
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="fs-card">
            <h3>🛠️ 实现路径 — 分步攻克</h3>
            <div className="concept-card">
              <h4>推荐实现顺序（渐进式，每步都可运行！）</h4>
            </div>

            <div className="fs-grid-2" style={{marginTop:'1rem'}}>
              {[
                { step: '1', title: '整数计算器', desc: 'Lexer + Pratt Parser + 直接求值', color: '#7c3aed', tag: '2小时' },
                { step: '2', title: '变量 & 赋值', desc: '加入 let, 环境/符号表', color: '#2563eb', tag: '3小时' },
                { step: '3', title: '控制流', desc: 'if/else/while, 布尔表达式', color: '#06b6d4', tag: '4小时' },
                { step: '4', title: '函数', desc: '函数声明/调用, 调用栈, 递归', color: '#f59e0b', tag: '5小时' },
                { step: '5', title: '类型检查', desc: '静态类型, 类型推断, 错误报告', color: '#fb7185', tag: '4小时' },
                { step: '6', title: '字节码 & VM', desc: '编译到栈虚拟机, 替代解释执行', color: '#22c55e', tag: '6小时' },
              ].map(({ step, title, desc, color, tag }) => (
                <div key={step} className="fs-card" style={{borderColor: `${color}33`}}>
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem'}}>
                    <span style={{background: color, color:'#fff', borderRadius:'50%', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:800, flexShrink:0}}>{step}</span>
                    <h4 style={{margin:0, color}}>{title}</h4>
                    <span className="fs-tag" style={{background:`${color}18`, color, marginLeft:'auto'}}>{tag}</span>
                  </div>
                  <p style={{fontSize:'0.82rem', color:'#94a3b8', margin:0}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 3 && (
          <div className="fs-card">
            <div className="sandbox">
              <div className="sandbox-header">
                <h4>🎮 TinyCalc 编译器 — 端到端 REPL</h4>
                <button className="fs-btn primary" onClick={handleCompile} style={{padding:'0.35rem 0.8rem', fontSize:'0.78rem'}}>▶ 编译 & 执行</button>
              </div>
              <div className="sandbox-body">
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.75rem'}}>
                  <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleCompile()} spellCheck={false} placeholder="输入表达式, 如: (x + y) * 2 - z" style={{flex:1}} />
                  <span style={{fontSize:'0.72rem', color:'#64748b', whiteSpace:'nowrap'}}>x=10 y=5 z=3 pi=3.14</span>
                </div>

                <div className="fs-pills" style={{marginBottom:'0.75rem'}}>
                  <button className={`fs-btn ${showPhase===-1?'primary':''}`} onClick={()=>setShowPhase(-1)} style={{fontSize:'0.72rem', padding:'0.3rem 0.6rem'}}>全部阶段</button>
                  {['Lexer','Parser','Codegen','VM'].map((name,i)=>(
                    <button key={i} className={`fs-btn ${showPhase===i?'primary':''}`} onClick={()=>setShowPhase(i)} style={{fontSize:'0.72rem', padding:'0.3rem 0.6rem'}}>{name}</button>
                  ))}
                </div>

                {output && (
                  <>
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem'}}>
                      <span style={{fontSize:'1.1rem', fontWeight:800, color:'#4ade80'}}>= {output.result}</span>
                      <span style={{fontSize:'0.72rem', color:'#64748b'}}>{output.tokens.length} tokens → {output.code.length} instructions</span>
                    </div>

                    {/* Token chips */}
                    {(showPhase === -1 || showPhase === 0) && (
                      <div style={{marginBottom:'1rem'}}>
                        <div style={{fontSize:'0.78rem', color:'#a78bfa', fontWeight:700, marginBottom:'0.4rem'}}>🔤 Token 流</div>
                        <div className="token-list">
                          {output.tokens.map((t, i) => (
                            <span key={i} className={`token-chip ${t.t==='ID'?'ident':t.t==='NUM'?'number':'operator'}`}>
                              <span style={{opacity:.5, fontSize:'0.6rem'}}>{t.t}</span> {t.v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full compiler log */}
                    {output.log.map((phase, i) => {
                      if (showPhase !== -1 && showPhase !== i) return null;
                      return (
                        <div key={i} className="sandbox-output" style={{marginBottom:'0.5rem'}}>
                          {phase}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            <div className="tip-box" style={{marginTop:'1rem'}}>
              💡 <strong>试试这些表达式</strong>：
              <br/><code>x * 2 + y * 3</code> — 变量运算
              <br/><code>(pi * 2) * 10</code> — 浮点运算
              <br/><code>-x + y</code> — 前缀运算符
              <br/><code>100 % 7</code> — 取模运算
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
