
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

const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [graphCards, setGraphCards] = useState<GraphCardData[]>([
    { id: '1', title: "阿尔法项目", subtitle: "128 个条目", icon: "deployed_code" },
    { id: '2', title: "2025 财务数据", subtitle: "实时分片", icon: "monitoring" },
    { id: '3', title: "AI 伦理矩阵", subtitle: "交互式分析", icon: "gavel" },
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
          { id: newId, title: "新导入文档", subtitle: "正在向量化", icon: "note_add" }
        ]);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 max-w-xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".pdf,.txt,.docx,.csv" />
      
      <header className="sticky top-0 z-50 glass-panel border-b-0 border-x-0 border-t-0 rounded-b-[32px] px-6 pt-14 pb-5 mb-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-primary/70 mb-1.5">
              <span className="material-symbols-outlined text-[18px] font-bold animate-pulse">shield_lock</span>
              <span className="text-[10px] font-black tracking-widest uppercase">物理隔离：安全环境</span>
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

      <div className="px-6 mb-8">
        <div className="glass-panel rounded-[28px] p-6 flex items-center justify-between border-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
              <span className="material-symbols-outlined text-3xl">database</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">存储占用</p>
              <p className="text-xl font-black text-current">12.4 GB <span className="text-sm font-bold text-slate-300">/ 50 GB</span></p>
            </div>
          </div>
          <div className="w-24 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(180,83,9,0.4)]" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-5">
        {graphCards.map(card => (
          <GraphCard 
            key={card.id}
            title={card.title} 
            subtitle={card.subtitle} 
            icon={card.icon} 
            metrics={card.metrics}
            onDelete={() => setGraphCards(prev => prev.filter(c => c.id !== card.id))}
            onClick={() => card.id === '3' ? setActiveOverlay({ type: 'ethics', id: card.id }) : null}
          />
        ))}
      </div>

      {activeOverlay?.type === 'ethics' && (
        <KnowledgeGraphOverlay onClose={() => setActiveOverlay(null)} />
      )}
    </div>
  );
};

const KnowledgeGraphOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical'>('default');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const rawNodes: NodeDetail[] = [
    { id: '1', label: 'AI 监管体系', description: '全球政策动态与法律约束框架。', color: '#00d9e6', category: '法律', suggestedQueries: ['2025AI监管趋势'] },
    { id: '2', label: '隐私加密分层', description: '端到端数据保护与物理隔离技术。', color: '#3B82F6', category: '隐私', suggestedQueries: ['大模型隐私保护'] },
    { id: '3', label: '算法中立性', description: '解决数据源中的不公平偏见。', color: '#F87171', category: '伦理', suggestedQueries: ['减少算法偏见'] }
  ];

  const edges: Edge[] = [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '1' }
  ];

  const displayNodes = useMemo(() => {
    let result = [...rawNodes];
    if (filterCategory !== 'all') result = result.filter(n => n.category === filterCategory);
    if (sortBy === 'alphabetical') result.sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
    return result;
  }, [filterCategory, sortBy]);

  const nodePositions = useMemo(() => {
    const radius = 130;
    const centerX = 200;
    const centerY = 200;
    return displayNodes.reduce((acc, node, i) => {
      const angle = (i * 2 * Math.PI) / displayNodes.length - Math.PI / 2;
      acc[node.id] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
      return acc;
    }, {} as Record<string, { x: number; y: number }>);
  }, [displayNodes]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSelectedNode(null); return; }
    const match = displayNodes.find(n => n.label.includes(searchQuery));
    if (match) setSelectedNode(match);
  }, [searchQuery, displayNodes]);

  return (
    <div className="fixed inset-0 z-[100] bg-background-base/95 backdrop-blur-3xl animate-in fade-in duration-500 flex flex-col">
      <div className="max-w-xl mx-auto w-full flex flex-col h-full">
        <header className="p-8 flex items-center justify-between border-b border-primary/5">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl">gavel</span>
            <h2 className="text-xl font-black">AI 伦理矩阵</h2>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
        </header>

        <div className="p-6 bg-primary/5 space-y-4">
          <input 
            type="text" 
            placeholder="搜索节点..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="glass-panel w-full py-4 px-6 rounded-2xl font-bold bg-white/5 border-primary/10"
          />
          <div className="flex gap-2">
            <button onClick={() => setSortBy(s => s === 'default' ? 'alphabetical' : 'default')} className="px-4 py-2 rounded-xl glass-panel text-[10px] font-black uppercase">
              排序: {sortBy === 'alphabetical' ? 'A-Z' : '默认'}
            </button>
            {['all', '法律', '隐私', '伦理'].map(c => (
              <button key={c} onClick={() => setFilterCategory(c)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterCategory === c ? 'bg-primary text-white' : 'glass-panel'}`}>
                {c === 'all' ? '全部' : c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          <svg className="w-full h-full max-w-xl max-h-xl p-12 overflow-visible" viewBox="0 0 400 400">
            {edges.map((edge, i) => {
              const start = nodePositions[edge.from];
              const end = nodePositions[edge.to];
              if (!start || !end) return null;
              const isH = hoveredNodeId === edge.from || hoveredNodeId === edge.to || selectedNode?.id === edge.from || selectedNode?.id === edge.to;
              return (
                <path 
                  key={i} d={`M ${start.x} ${start.y} Q 200 200 ${end.x} ${end.y}`} 
                  fill="none" stroke={isH ? '#00d9e6' : '#ccc'} 
                  strokeWidth={isH ? 3 : 1} strokeOpacity={isH ? 0.8 : 0.2}
                  className="transition-all duration-500"
                />
              );
            })}
            {displayNodes.map(node => {
              const pos = nodePositions[node.id];
              const isMatch = selectedNode?.id === node.id;
              const isH = hoveredNodeId === node.id;
              return (
                <g key={node.id} className="cursor-pointer" 
                   onMouseEnter={() => setHoveredNodeId(node.id)} onMouseLeave={() => setHoveredNodeId(null)}
                   onClick={() => setSelectedNode(node)}>
                  <circle cx={pos.x} cy={pos.y} r="28" fill={isMatch || isH ? node.color : 'rgba(255,255,255,0.05)'} stroke={node.color} strokeWidth="3" className="transition-all duration-500" />
                  <text x={pos.x} y={pos.y + 45} textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">{node.label}</text>
                  {isMatch && <circle cx={pos.x} cy={pos.y} r="35" fill="none" stroke={node.color} strokeWidth="1" className="animate-ping" />}
                </g>
              );
            })}
          </svg>
          {selectedNode && (
            <div className="absolute bottom-8 left-6 right-6 p-6 glass-panel rounded-3xl border-primary/20 bg-white/90 dark:bg-black/90">
              <h3 className="text-xl font-black mb-2">{selectedNode.label}</h3>
              <p className="text-sm opacity-70 mb-4">{selectedNode.description}</p>
              <button onClick={() => navigate('/search-results', { state: { query: selectedNode.label } })} className="w-full py-3 bg-primary text-white font-black rounded-xl">深入探索</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GraphCard: React.FC<{ title: string; subtitle: string; icon: string; metrics?: any; onDelete: () => void; onClick: () => void }> = ({ title, subtitle, icon, metrics, onDelete, onClick }) => (
  <div onClick={onClick} className="glass-panel aspect-square rounded-[32px] p-6 flex flex-col items-center justify-center relative hover:scale-105 transition-all cursor-pointer group">
    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-red-500">close</span></button>
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3"><span className="material-symbols-outlined text-4xl">{icon}</span></div>
    <h3 className="font-black text-center">{title}</h3>
    <p className="text-[10px] uppercase font-bold text-slate-400">{subtitle}</p>
  </div>
);

export default KnowledgeBase;
