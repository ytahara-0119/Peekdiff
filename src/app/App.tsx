import { useState, useEffect, useRef } from 'react';
import { Search, FolderOpen, GitCompare, Filter, Moon, Star } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { FileNode, CompareStatus } from './types';
import { DirectoryTree } from './components/DirectoryTree';
import { FileDetailView } from './components/FileDetailView';
import { compareDirectories, openFolderDialog } from './utils/tauriApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getComparisonStats(nodes: FileNode[]): Record<CompareStatus, number> {
  const stats: Record<CompareStatus, number> = { added: 0, deleted: 0, modified: 0, identical: 0 };
  function walk(n: FileNode) {
    if (n.type === 'file') stats[n.status]++;
    n.children?.forEach(walk);
  }
  nodes.forEach(walk);
  return stats;
}

function filterFileTree(
  nodes: FileNode[],
  status: CompareStatus | 'all',
  query: string,
): FileNode[] {
  const q = query.toLowerCase();
  function filterNode(n: FileNode): FileNode | null {
    if (n.type === 'file') {
      if (status !== 'all' && n.status !== status) return null;
      if (q && !n.name.toLowerCase().includes(q)) return null;
      return n;
    }
    const filtered = n.children?.map(filterNode).filter(Boolean) as FileNode[] | undefined;
    if (!filtered?.length) return null;
    return { ...n, children: filtered };
  }
  return nodes.map(filterNode).filter(Boolean) as FileNode[];
}

function triggerCelebration() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#9333EA', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'], shapes: ['circle', 'square'], scalar: rand(0.8, 1.2) });
    confetti({ ...defaults, particleCount, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#9333EA', '#EC4899', '#3B82F6', '#F59E0B', '#10B981'], shapes: ['circle', 'square'], scalar: rand(0.8, 1.2) });
    confetti({ ...defaults, particleCount: particleCount / 2, origin: { x: 0.5, y: 0.5 }, colors: ['#FFD700', '#FF69B4', '#87CEEB', '#FFB6C1'], shapes: ['star' as const], scalar: 1.5, gravity: 0.5 });
  }, 250);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatBadge({ label, count, gradient }: { label: string; count: number; gradient: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r shadow-md ${gradient}`}
    >
      {label}{count}
    </motion.span>
  );
}

interface FolderInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  gradient: string;
  iconColor: string;
  borderColor: string;
  isDragOver?: boolean;
}

function FolderInput({ label, value, onChange, gradient, iconColor, borderColor, isDragOver }: FolderInputProps) {
  async function browse() {
    const path = await openFolderDialog();
    if (path) onChange(path);
  }
  return (
    <div
      className={`flex-1 flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${gradient} rounded-xl border shadow-sm transition-all ${isDragOver ? 'border-purple-400 ring-2 ring-purple-400/40 scale-[1.01]' : borderColor}`}
    >
      <FolderOpen size={18} className={`${isDragOver ? 'text-purple-500' : iconColor} flex-shrink-0 transition-colors`} />
      <input
        className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 min-w-0"
        placeholder={isDragOver ? 'ここにドロップ' : label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={browse}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 px-2 py-0.5 rounded hover:bg-white/50"
        title="フォルダを選択"
      >
        選択
      </button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [filterStatus, setFilterStatus] = useState<CompareStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leftPath, setLeftPath] = useState('');
  const [rightPath, setRightPath] = useState('');
  const [tree, setTree] = useState<FileNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOverSide, setDragOverSide] = useState<'left' | 'right' | null>(null);
  const dragSideRef = useRef<'left' | 'right' | null>(null);

  // Tauri file-drop: position.x で左右を判定してフォルダパスを入力欄に反映
  // HTML drag イベントは Finder → Tauri WebView では発火しないため Tauri イベントのみ使用
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    import('@tauri-apps/api/webview').then(({ getCurrentWebview }) => {
      getCurrentWebview().onDragDropEvent((event) => {
        const { type } = event.payload;
        if (type === 'enter' || type === 'over') {
          const midX = (window.innerWidth / 2) * window.devicePixelRatio;
          const side: 'left' | 'right' = event.payload.position.x < midX ? 'left' : 'right';
          dragSideRef.current = side;
          setDragOverSide(side);
        } else if (type === 'drop') {
          if (event.payload.paths.length > 0) {
            const path = event.payload.paths[0];
            // position.x を直接使用: leave が drop より先に発火して ref がクリアされる
            // macOS 固有の問題を回避するため dragSideRef には依存しない
            const midX = (window.innerWidth / 2) * window.devicePixelRatio;
            const side: 'left' | 'right' = event.payload.position.x < midX ? 'left' : 'right';
            if (side === 'left') setLeftPath(path);
            else setRightPath(path);
          }
          setDragOverSide(null);
          dragSideRef.current = null;
        } else if (type === 'leave') {
          setDragOverSide(null);
          dragSideRef.current = null;
        }
      }).then(fn => { unlisten = fn; });
    });
    return () => { unlisten?.(); };
  }, []);

  const stats = getComparisonStats(tree);
  const visibleTree = filterFileTree(tree, filterStatus, searchQuery);

  // Confetti on comparison complete
  useEffect(() => {
    if (progress === 100 && !isComparing && tree.length > 0) {
      triggerCelebration();
    }
  }, [progress, isComparing, tree.length]);

  async function handleCompare() {
    if (isComparing || !leftPath || !rightPath) return;
    setIsComparing(true);
    setProgress(0);
    setError(null);
    setSelectedFile(null);

    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, 9);
      setProgress(step * 10);
    }, 100);

    try {
      const result = await compareDirectories(leftPath, rightPath);
      setTree(result);
      setProgress(100);
      clearInterval(interval);
      // isComparing=false を先に更新し、progress=100 のまま confetti を発火させる
      setTimeout(() => setIsComparing(false), 300);
      setTimeout(() => setProgress(0), 800);
    } catch (e) {
      clearInterval(interval);
      setError(String(e));
      setIsComparing(false);
      setProgress(0);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-purple-200/50 bg-white/80 backdrop-blur-lg px-6 py-4 flex flex-col gap-3">
        {/* Title + icon widget */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Moon className="w-5 h-5 text-yellow-200 absolute" />
            <Star className="w-3 h-3 text-yellow-300 absolute top-1 right-1 animate-pulse" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Peekdiff
          </span>
        </div>

        {/* Folder inputs + compare button */}
        <div className="flex items-center gap-3">
          <FolderInput
            label="左側のフォルダパス"
            value={leftPath}
            onChange={setLeftPath}
            gradient="from-purple-50 to-pink-50"
            iconColor="text-purple-500"
            borderColor="border-purple-200"
            isDragOver={dragOverSide === 'left'}
          />
          <FolderInput
            label="右側のフォルダパス"
            value={rightPath}
            onChange={setRightPath}
            gradient="from-blue-50 to-cyan-50"
            iconColor="text-blue-500"
            borderColor="border-blue-200"
            isDragOver={dragOverSide === 'right'}
          />
          <motion.button
            onClick={handleCompare}
            disabled={isComparing || !leftPath || !rightPath}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
          >
            <GitCompare size={16} />
            {isComparing ? `比較中... ${progress}%` : '比較'}
          </motion.button>
        </div>

        {/* Progress bar */}
        {isComparing && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: progress / 100 }}
            className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full origin-left"
          />
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-500 px-1">{error}</div>
        )}

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-white/60 rounded-xl border border-purple-200/50 shadow-sm backdrop-blur-sm">
            <Search size={16} className="text-purple-500 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
              placeholder="ファイル名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/60 rounded-xl border border-purple-200/50 shadow-sm backdrop-blur-sm">
            <Filter size={16} className="text-purple-500 flex-shrink-0" />
            <select
              className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CompareStatus | 'all')}
            >
              <option value="all">すべて</option>
              <option value="added">追加</option>
              <option value="deleted">削除</option>
              <option value="modified">変更</option>
              <option value="identical">同一</option>
            </select>
          </div>
        </div>

        {/* Stats badges */}
        {tree.length > 0 && (
          <div className="flex items-center gap-3">
            <StatBadge label="+" count={stats.added} gradient="from-green-500 to-emerald-500" />
            <StatBadge label="-" count={stats.deleted} gradient="from-red-500 to-rose-500" />
            <StatBadge label="~" count={stats.modified} gradient="from-yellow-500 to-amber-500" />
            <StatBadge label="=" count={stats.identical} gradient="from-gray-400 to-gray-500" />
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 flex gap-1 overflow-hidden p-1">
        {/* Left pane */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-96 flex-shrink-0 bg-white/70 backdrop-blur-lg rounded-tr-2xl overflow-y-auto shadow-xl border-r border-purple-200/50"
        >
          {tree.length === 0 && !isComparing ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm p-8 text-center">
              左右のフォルダを選択して「比較」を押してください
            </div>
          ) : (
            <DirectoryTree
              nodes={visibleTree}
              onSelectFile={setSelectedFile}
              selectedFile={selectedFile}
            />
          )}
        </motion.div>

        {/* Right pane */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 bg-white/50 backdrop-blur-lg rounded-tl-2xl overflow-hidden shadow-xl flex flex-col"
        >
          <FileDetailView file={selectedFile} />
        </motion.div>
      </div>
    </div>
  );
}
