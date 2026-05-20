import { useState } from 'react';
import { Search, FolderOpen, GitCompare } from 'lucide-react';
import { FileNode, CompareStatus } from './types';
import { DirectoryTree } from './components/DirectoryTree';
import { FileDetailView } from './components/FileDetailView';
import { AppIcon } from './components/AppIcon';
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

// ── Sub-components ────────────────────────────────────────────────────────────

function StatBadge({ label, count, gradient }: { label: string; count: number; gradient: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${gradient}`}>
      {label}{count}
    </span>
  );
}

interface FolderInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  gradient: string;
  iconColor: string;
}

function FolderInput({ label, value, onChange, gradient, iconColor }: FolderInputProps) {
  async function browse() {
    const path = await openFolderDialog();
    if (path) onChange(path);
  }
  return (
    <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${gradient} border border-purple-100`}>
      <FolderOpen size={15} className={`${iconColor} flex-shrink-0`} />
      <input
        className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400 min-w-0"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={browse}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
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

  const stats = getComparisonStats(tree);
  const visibleTree = filterFileTree(tree, filterStatus, searchQuery);

  async function handleCompare() {
    if (isComparing || !leftPath || !rightPath) return;
    setIsComparing(true);
    setProgress(0);
    setError(null);
    setSelectedFile(null);

    // Progress animation while comparing
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, 9);
      setProgress(step * 10);
    }, 100);

    try {
      const result = await compareDirectories(leftPath, rightPath);
      setTree(result);
      setProgress(100);
    } catch (e) {
      setError(String(e));
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setIsComparing(false);
        setProgress(0);
      }, 300);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg px-4 py-3 flex flex-col gap-2">
        {/* Title */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 flex-shrink-0">
            <AppIcon size={40} />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Peekdiff
          </span>
        </div>

        {/* Folder inputs + compare button */}
        <div className="flex items-center gap-3">
          <FolderInput
            label="左フォルダ"
            value={leftPath}
            onChange={setLeftPath}
            gradient="from-purple-50 to-pink-50"
            iconColor="text-purple-400"
          />
          <FolderInput
            label="右フォルダ"
            value={rightPath}
            onChange={setRightPath}
            gradient="from-blue-50 to-cyan-50"
            iconColor="text-blue-400"
          />
          <button
            onClick={handleCompare}
            disabled={isComparing || !leftPath || !rightPath}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow hover:opacity-90 disabled:opacity-40 transition-opacity flex-shrink-0"
          >
            <GitCompare size={15} />
            比較
          </button>
        </div>

        {/* Progress bar */}
        {isComparing && (
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-500 px-1">{error}</div>
        )}

        {/* Search + filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
              placeholder="ファイル名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none"
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

        {/* Stats badges */}
        {tree.length > 0 && (
          <div className="flex items-center gap-2">
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
        <div className="w-96 flex-shrink-0 bg-white/70 backdrop-blur-lg rounded-xl overflow-y-auto shadow-sm border border-white/60">
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
        </div>

        {/* Right pane */}
        <div className="flex-1 bg-white/50 backdrop-blur-lg rounded-xl overflow-hidden shadow-sm border border-white/60 flex flex-col">
          <FileDetailView file={selectedFile} />
        </div>
      </div>
    </div>
  );
}
