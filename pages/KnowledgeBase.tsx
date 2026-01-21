
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface GraphCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  metrics?: { label: string; value: number }[];
}

interface NodeDetail {
  id: string;
  label: string;
  description: string;
  color: string;
  category: string;
  suggestedQueries: string[];
}

interface Edge {
  from: string;
  to: string;
}

interface ModelMetric {
  name: string;
  accuracy: number;
  f1: number;
  latency: number;
  status: 'available' | 'downloading' | 'verifying' | 'installed' | 'error';
  progress?: number;
  size: string;
  checksum?: string;
  isSigned?: boolean;
}

const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [graphCards, setGraphCards] = useState<GraphCardData[]>([
    { id: '1', title: "阿尔法项目", subtitle: "128 个条目", icon: "deployed_code" },
    { id: '2', title: "2025 财务数据", subtitle: "实时分片", icon: "monitoring" },
    { 
      id: '3', 
      title: "AI 伦理矩阵", 
      subtitle: "12 个活跃节点", 
      icon: "gavel" 
    },
    { 
      id: '4', 
      title: "自进化模型", 
      subtitle: "34 个优化变体", 
      icon: "auto_awesome_motion",
      metrics: [
        { label: '准确率', value: 94 },
        { label: 'F1分数', value: 91 }
      ]
    },
  ]);

  const [activeOverlay, setActiveOverlay] = useState<{ type: 'ethics' | 'performance', id: string } | null>(null);

  const handleAddKnowledge = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsImporting(true);
      setTimeout(() => {
        setIsImporting(false);
        const newId = (graphCards.length + 1).toString();
        setGraphCards(prev => [
          ...prev, 
          { id: newId, title: "新导入文档", subtitle: "正在进行向量索引", icon: "note_add" }
        ]);
        alert("文件导入成功！正在本地执行 RAG 向量化处理。");
      }, 2000);
    }
  };

  const handleDeleteGraph = (id: string) => {
    setGraphCards(prev => prev.filter(card => card.id !== id));
  };

  const handleOpenGraph = (id: string) => {
    if (id === '3') setActiveOverlay({ type: 'ethics', id });
    if (id === '4') setActiveOverlay({ type: 'performance', id });
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 max-w-xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".pdf,.txt,.docx,.csv" />
      
      <header className="sticky top-0 z-50 glass-panel border-b-0 border-x-0 border-t-0 rounded-b-[32px] px-6 pt-14 pb-5 mb-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-primary/70 mb-1.5">
              <span className="material-symbols-outlined text-[18px] font-bold animate-pulse">shield_lock</span>
              <span className="text-[10px] font-black tracking-widest uppercase">物理隔离：100% 本地环境</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-current">本地知识库</h1>
          </div>
          <button 
            onClick={handleAddKnowledge}
            disabled={isImporting}
            className={`w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/20 ${isImporting ? 'animate-spin' : ''}`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">{isImporting ? 'sync' : 'add'}</span>
          </button>
        </div>
      </header>

      {/* 存储概览 */}
      <div className="px-6 mb-8">
        <div className="glass-panel rounded-[28px] p-6 flex items-center justify-between border-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <span className="material-symbols-outlined text-3xl">database</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">本地存储占用</p>
              <p className="text-xl font-black text-current leading-none">12.4 GB <span className="text-sm font-bold text-slate-300">/ 50 GB</span></p>
            </div>
          </div>
          <div className="w-24 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(180,83,9,0.4)]" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-primary/60">
            <span className="material-symbols-outlined text-2xl">manage_search</span>
          </div>
          <input className="glass-input w-full py-5 pl-14 pr-6 rounded-[24px] text-base font-bold text-current placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-lg border-primary/5" placeholder="检索本地知识分片..." type="text"/>
        </div>
      </div>

      <div className="px-6 mb-10">
        <div className="glass-panel rounded-[32px] p-6 relative overflow-hidden group border-primary/5">
          <div className="flex items-center justify-between mb-5">
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">向量化实时索引</h3>
             <span className="material-symbols-outlined text-primary text-xl animate-spin-slow">refresh</span>
          </div>
          <div className="space-y-5">
            <IndexingItem label="阿尔法私有文档归档" progress={100} icon="folder_zip" />
            <IndexingItem label="生物医学研究笔记" progress={45} icon="science" />
          </div>
        </div>
      </div>

      <div className="px-6 mb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black tracking-tight">知识多维图谱</h2>
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] text-primary font-black uppercase tracking-widest">{graphCards.length} 个聚类</div>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          {graphCards.map(card => (
            <GraphCard 
              key={card.id}
              title={card.title} 
              subtitle={card.subtitle} 
              icon={card.icon} 
              metrics={card.metrics}
              onDelete={() => handleDeleteGraph(card.id)}
              onClick={() => handleOpenGraph(card.id)}
            />
          ))}
        </div>
      </div>

      {activeOverlay?.type === 'ethics' && (
        <KnowledgeGraphOverlay onClose={() => setActiveOverlay(null)} />
      )}
      {activeOverlay?.type === 'performance' && (
        <ModelPerformanceOverlay onClose={() => setActiveOverlay(null)} />
      )}
    </div>
  );
};

const ModelPerformanceOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [sortKey, setSortKey] = useState<'accuracy' | 'f1' | 'latency'>('accuracy');
  const [filterQuery, setFilterQuery] = useState('');
  const [models, setModels] = useState<ModelMetric[]>([
    { name: 'Nebula-Flash v1', accuracy: 92, f1: 89, latency: 120, status: 'installed', size: '1.2GB', checksum: 'sha256:7d8a...f2e1', isSigned: true },
    { name: 'Nebula-Pro v2.1', accuracy: 96, f1: 94, latency: 450, status: 'available', size: '4.5GB' },
    { name: 'Nebula-Lite Q4', accuracy: 88, f1: 85, latency: 45, status: 'available', size: '450MB' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setModels(prev => prev.map(m => {
        if (m.status === 'downloading') {
          const nextProgress = (m.progress || 0) + 10;
          if (nextProgress >= 100) return { ...m, status: 'verifying', progress: 0 };
          return { ...m, progress: nextProgress };
        }
        if (m.status === 'verifying') {
          const nextProgress = (m.progress || 0) + 20;
          if (nextProgress >= 100) return { ...m, status: 'installed', progress: 100 };
          return { ...m, progress: nextProgress };
        }
        return m;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = (name: string) => {
    setModels(prev => prev.map(m => m.name === name ? { ...m, status: 'downloading', progress: 0 } : m));
  };

  const filteredModels = models.filter(m => m.name.toLowerCase().includes(filterQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] bg-background-base/95 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col">
      <div className="max-w-xl mx-auto w-full flex flex-col h-full">
        <header className="p-8 flex items-center justify-between border-b border-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <span className="material-symbols-outlined text-2xl">auto_awesome_motion</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-current tracking-tight">星核安全校验控制台</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">本地内核管理界面</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        
        <main className="flex-1 p-8 space-y-6 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-4">
            <input 
              className="glass-input p-4 rounded-2xl text-sm font-bold" 
              placeholder="搜索模型内核..." 
              value={filterQuery} 
              onChange={e => setFilterQuery(e.target.value)} 
            />
            <div className="flex gap-2">
              <button onClick={() => setSortKey('accuracy')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${sortKey === 'accuracy' ? 'bg-primary text-white' : 'glass-panel text-slate-400'}`}>准确率</button>
              <button onClick={() => setSortKey('latency')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${sortKey === 'latency' ? 'bg-primary text-white' : 'glass-panel text-slate-400'}`}>推理延迟</button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredModels.map((model, idx) => (
              <div key={idx} className="glass-panel rounded-[32px] p-6 border-primary/5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-black">{model.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{model.size} • 延迟 {model.latency}ms</span>
                  </div>
                  {model.status === 'available' && <button onClick={() => handleDownload(model.name)} className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase">安装</button>}
                  {model.status === 'installed' && <span className="text-emerald-500 material-symbols-outlined">verified_user</span>}
                  {(model.status === 'downloading' || model.status === 'verifying') && <span className="text-primary animate-pulse text-[10px] font-black uppercase">{model.status === 'verifying' ? '校验中' : '同步中'}</span>}
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${model.status === 'verifying' ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${model.status === 'installed' ? 100 : (model.progress || 0)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const KnowledgeGraphOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // 新增排序与筛选状态
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical'>('default');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const rawNodes: NodeDetail[] = [
    { 
      id: '1', 
      label: 'AI 监管体系', 
      description: '探讨政府与组织对人工智能发展的法律约束与指导准则。涵盖了 2025 年最新的全球政策动态。', 
      color: 'var(--primary-color)',
      category: '法律合规',
      suggestedQueries: ['2025全球AI监管趋势', '本地化AI的法律边界']
    },
    { 
      id: '2', 
      label: '物理隐私分层', 
      description: '关注大模型训练过程中的个人信息保护与物理隔离合规性。重点在于端到端硬件加密技术。', 
      color: '#3B82F6',
      category: '数据隐私',
      suggestedQueries: ['大模型隐私保护技术', '全量同态加密应用']
    },
    { 
      id: '3', 
      label: '算法公平性', 
      description: '分析数据源中的不公平性如何导致AI决策的歧视性偏见。研究自动化决策的透明度。', 
      color: '#F87171',
      category: '伦理偏见',
      suggestedQueries: ['如何减少AI算法偏见', '算法审计工具推荐']
    }
  ];

  const edges: Edge[] = [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '1' }
  ];

  // 计算筛选与排序后的节点
  const displayNodes = useMemo(() => {
    let result = [...rawNodes];
    
    // 类别筛选
    if (filterCategory !== 'all') {
      result = result.filter(n => n.category === filterCategory);
    }
    
    // 排序
    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
    }
    
    return result;
  }, [rawNodes, filterCategory, sortBy]);

  // 根据当前显示的节点重新计算位置
  const nodePositions = useMemo(() => {
    const radius = 130;
    const centerX = 200;
    const centerY = 200;
    return displayNodes.reduce((acc, node, i) => {
      const angle = (i * 2 * Math.PI) / displayNodes.length - Math.PI / 2;
      acc[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, [displayNodes]);

  // 搜索逻辑：自动选择第一个匹配项
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSelectedNode(null);
      return;
    }
    const firstMatch = displayNodes.find(n => 
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (firstMatch) {
      setSelectedNode(firstMatch);
    }
  }, [searchQuery, displayNodes]);

  const handleDeepSearch = (customQuery?: string) => {
    const finalQuery = customQuery || `深度分析：${selectedNode?.label} 在 AI 伦理体系中的挑战`;
    navigate('/search-results', { state: { query: finalQuery } });
  };

  const categories = ['all', '法律合规', '数据隐私', '伦理偏见'];

  return (
    <div className="fixed inset-0 z-[100] bg-background-base/95 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col">
      <div className="max-w-xl mx-auto w-full flex flex-col h-full relative">
        <header className="p-8 flex items-center justify-between border-b border-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <span className="material-symbols-outlined text-2xl">gavel</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-current tracking-tight">AI 伦理矩阵图谱</h2>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">交互式核心分析面板</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* 增强型搜索与控制栏 */}
        <div className="px-8 py-5 bg-primary/5 border-b border-primary/5 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none text-primary/60 transition-transform group-focus-within:scale-110">
              <span className="material-symbols-outlined text-2xl">search</span>
            </div>
            <input 
              type="text" 
              placeholder="搜索伦理节点..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full py-4 pl-14 pr-6 rounded-[24px] text-sm font-bold text-current placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-lg border-primary/10"
            />
          </div>

          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar pb-1">
             <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setSortBy(sortBy === 'default' ? 'alphabetical' : 'default')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${sortBy === 'alphabetical' ? 'bg-primary text-white border-primary shadow-lg' : 'glass-panel text-slate-500 border-primary/5'}`}
                >
                   <span className="material-symbols-outlined text-sm">sort_by_alpha</span>
                   排序 {sortBy === 'alphabetical' ? 'A-Z' : '默认'}
                </button>
             </div>
             <div className="flex items-center gap-1.5 shrink-0">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${filterCategory === cat ? 'bg-primary/20 text-primary border-primary/40' : 'glass-panel text-slate-500 border-primary/5'}`}
                  >
                    {cat === 'all' ? '全部' : cat}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <div className="absolute w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>

          <svg className="w-full h-full max-w-xl max-h-xl relative z-10 p-12 overflow-visible" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="35" fill="var(--primary-color)" className="animate-pulse opacity-20" />
            <text x="200" y="200" textAnchor="middle" dy=".3em" fill="var(--primary-color)" fontSize="11" fontWeight="900" className="tracking-[0.2em]">内核</text>

            <g className="edges-layer">
              {edges.map((edge, i) => {
                const start = nodePositions[edge.from];
                const end = nodePositions[edge.to];
                if (!start || !end) return null; // 如果节点被筛选掉，不渲染连线

                const isEdgeHighlighted = hoveredNodeId === edge.from || hoveredNodeId === edge.to || selectedNode?.id === edge.from || selectedNode?.id === edge.to;
                const edgeColor = rawNodes.find(n => n.id === edge.from)?.color || 'var(--primary-color)';
                const midX = (start.x + end.x) / 2 + (200 - (start.x + end.x) / 2) * 0.1;
                const midY = (start.y + end.y) / 2 + (200 - (start.y + end.y) / 2) * 0.1;

                return (
                  <path
                    key={`edge-${i}`}
                    d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
                    fill="none"
                    stroke={edgeColor}
                    strokeWidth={isEdgeHighlighted ? "3" : "1"}
                    strokeDasharray={isEdgeHighlighted ? "none" : "4 4"}
                    className={`transition-all duration-700 ${isEdgeHighlighted ? 'opacity-80' : 'opacity-10'}`}
                    style={{ filter: isEdgeHighlighted ? `drop-shadow(0 0 8px ${edgeColor})` : 'none' }}
                  />
                );
              })}
            </g>

            {displayNodes.map((node) => {
              const pos = nodePositions[node.id];
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isMatch = searchQuery !== '' && (
                node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                node.description.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              const opacityClass = searchQuery !== '' && !isMatch ? 'opacity-20' : 'opacity-100';
              
              return (
                <g 
                  key={node.id} 
                  className={`cursor-pointer group transition-all duration-700 ${opacityClass}`} 
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {(isSelected || isHovered || isMatch) && (
                    <circle 
                      cx={pos.x} cy={pos.y} r="38" 
                      fill="none" 
                      stroke={node.color} 
                      strokeWidth="1.5" 
                      className={`${isMatch ? 'animate-ping' : 'animate-pulse'} opacity-30`} 
                    />
                  )}
                  
                  <circle 
                    cx={pos.x} cy={pos.y} r="28" 
                    fill={isSelected || isHovered || isMatch ? node.color : 'var(--input-bg)'} 
                    stroke={node.color} 
                    strokeWidth={isMatch || isHovered || isSelected ? "5" : "3"} 
                    className={`transition-all duration-500 group-hover:scale-110 shadow-2xl`} 
                    style={{ filter: (isMatch || isSelected) ? `drop-shadow(0 0-12px ${node.color})` : 'none' }}
                  />
                  
                  <text 
                    x={pos.x} y={pos.y + 48} 
                    textAnchor="middle" 
                    fill={(isSelected || isMatch || isHovered) ? 'var(--primary-color)' : 'var(--text-dim)'} 
                    fontSize="12" 
                    fontWeight={(isMatch || isSelected) ? "900" : "700"}
                    className="transition-colors pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {selectedNode && (
            <div className="absolute bottom-8 left-6 right-6 z-20 animate-in slide-in-from-bottom-8 duration-500">
              <div className="glass-panel rounded-[40px] p-8 border-primary/10 shadow-2xl bg-white/95 dark:bg-[#1a1d23]/95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: selectedNode.color }}></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{selectedNode.category}</span>
                    <h3 className="text-2xl font-black tracking-tight">{selectedNode.label}</h3>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">{selectedNode.description}</p>
                <div className="flex gap-4">
                  <button onClick={() => handleDeepSearch()} className="flex-1 py-4 rounded-2xl bg-primary text-white text-xs font-black shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    开启深度分析
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const IndexingItem: React.FC<{ label: string; progress: number; icon: string }> = ({ label, progress, icon }) => (
  <div className="flex items-center gap-5">
    <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary shrink-0 flex items-center justify-center border border-primary/5">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[15px] font-black text-current truncate">{label}</span>
        {progress === 100 ? (
          <span className="material-symbols-outlined text-emerald-500 text-xl font-bold">verified</span>
        ) : (
          <span className="text-xs text-primary font-black uppercase tracking-widest">{progress}% 同步</span>
        )}
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-700 ease-out rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);

const GraphCard: React.FC<{ title: string; subtitle: string; icon: string; metrics?: { label: string; value: number }[]; onDelete: () => void; onClick: () => void }> = ({ title, subtitle, icon, metrics, onDelete, onClick }) => (
  <div onClick={onClick} className="aspect-square glass-panel rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 group cursor-pointer border-primary/5 w-full bg-white/40 dark:bg-white/[0.02]">
    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md">
      <span className="material-symbols-outlined text-lg">close</span>
    </button>
    <div className="relative z-10 flex flex-col items-center justify-center flex-1">
      <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center border border-primary/10 mb-3 group-hover:shadow-[0_15px_30px_rgba(180,83,9,0.2)] transition-all duration-500 group-hover:scale-110">
        <span className="material-symbols-outlined text-primary text-3xl font-bold">{icon}</span>
      </div>
      <p className="text-current font-black text-base leading-tight text-center tracking-tight mb-1">{title}</p>
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
      {metrics && (
        <div className="mt-5 flex flex-col w-full gap-2 px-1">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[8px] font-black text-slate-500 uppercase shrink-0 w-8">{m.label}</span>
              <div className="flex-1 h-1 bg-primary/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary/60" style={{ width: `${m.value}%` }}></div>
              </div>
              <span className="text-[9px] font-black text-current/70">{m.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ActivityItem: React.FC<{ title: string; context: string; time: string; icon: string }> = ({ title, context, time, icon }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl glass-panel border-primary/5 hover:bg-primary/5 transition-all cursor-pointer group bg-white/40 dark:bg-white/[0.01]">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-all border border-primary/5 group-hover:bg-primary group-hover:text-white group-hover:scale-105">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[15px] font-black text-current leading-tight">{title}</span>
        <span className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">{context}</span>
      </div>
    </div>
    <div className="flex flex-col items-end">
       <span className={`text-[11px] font-black uppercase tracking-widest ${time === '刚刚' ? 'text-primary' : 'text-slate-500'}`}>{time}</span>
       {time === '刚刚' && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 animate-pulse"></div>}
    </div>
  </div>
);

export default KnowledgeBase;
