import { useState } from 'react';
import { motion } from 'motion/react';
import { File, Folder, FolderOpen, ChevronRight } from 'lucide-react';
import { FileNode, CompareStatus } from '../types';

interface DirectoryTreeProps {
  nodes: FileNode[];
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
}

function statusStyle(status: CompareStatus): string {
  switch (status) {
    case 'added':
      return 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500';
    case 'deleted':
      return 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500';
    case 'modified':
      return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500';
    case 'identical':
      return 'hover:bg-purple-50';
  }
}

function StatusBadge({ status }: { status: CompareStatus }) {
  if (status === 'identical') return null;
  const map: Record<Exclude<CompareStatus, 'identical'>, { label: string; className: string }> = {
    added: { label: 'A', className: 'bg-green-100 text-green-700' },
    deleted: { label: 'D', className: 'bg-red-100 text-red-700' },
    modified: { label: 'M', className: 'bg-yellow-100 text-yellow-700' },
  };
  const { label, className } = map[status as Exclude<CompareStatus, 'identical'>];
  return (
    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
}

function TreeNode({ node, depth, onSelectFile, selectedFile }: TreeNodeProps) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedFile?.path === node.path;
  const isDir = node.type === 'directory';

  const baseStyle = 'flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer select-none text-sm transition-colors';
  const selectedStyle = 'bg-gradient-to-r from-purple-200 to-pink-200 border-l-4 border-purple-600';
  const rowStyle = isSelected ? selectedStyle : statusStyle(node.status);

  return (
    <div>
      <div
        className={`${baseStyle} ${rowStyle}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (isDir) {
            setOpen((v) => !v);
          } else {
            onSelectFile(node);
          }
        }}
      >
        {isDir && (
          <motion.span
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0 text-gray-400"
          >
            <ChevronRight size={14} />
          </motion.span>
        )}
        {!isDir && <span className="w-3.5 flex-shrink-0" />}

        <span className="flex-shrink-0 text-gray-500">
          {isDir ? (
            open ? <FolderOpen size={15} /> : <Folder size={15} />
          ) : (
            <File size={15} />
          )}
        </span>

        <span className="truncate flex-1 text-gray-800">{node.name}</span>
        <StatusBadge status={node.status} />
      </div>

      {isDir && open && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DirectoryTree({ nodes, onSelectFile, selectedFile }: DirectoryTreeProps) {
  return (
    <div className="py-1">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
}
