import { HardDrive, Hash, Calendar } from 'lucide-react';
import { FileNode, DiffLine, CompareStatus } from '../types';

interface FileDetailViewProps {
  file: FileNode | null;
}

function generateDiffLines(left: string, right: string): DiffLine[] {
  const leftLines = left === '' ? [] : left.split('\n');
  const rightLines = right === '' ? [] : right.split('\n');
  const result: DiffLine[] = [];
  let l = 0;
  let r = 0;
  let leftNum = 1;
  let rightNum = 1;

  while (l < leftLines.length || r < rightLines.length) {
    if (l >= leftLines.length) {
      result.push({ type: 'added', rightLineNumber: rightNum++, content: rightLines[r++] });
      continue;
    }
    if (r >= rightLines.length) {
      result.push({ type: 'deleted', leftLineNumber: leftNum++, content: leftLines[l++] });
      continue;
    }
    if (leftLines[l] === rightLines[r]) {
      result.push({ type: 'unchanged', leftLineNumber: leftNum++, rightLineNumber: rightNum++, content: leftLines[l] });
      l++;
      r++;
    } else {
      // 5-line lookahead
      let matchLeft = -1;
      let matchRight = -1;
      outer: for (let dl = 0; dl <= 5; dl++) {
        for (let dr = 0; dr <= 5; dr++) {
          if (dl === 0 && dr === 0) continue;
          if (l + dl < leftLines.length && r + dr < rightLines.length && leftLines[l + dl] === rightLines[r + dr]) {
            matchLeft = dl;
            matchRight = dr;
            break outer;
          }
        }
      }
      if (matchLeft === -1) {
        result.push({ type: 'deleted', leftLineNumber: leftNum++, content: leftLines[l++] });
        result.push({ type: 'added', rightLineNumber: rightNum++, content: rightLines[r++] });
      } else {
        for (let i = 0; i < matchLeft; i++) {
          result.push({ type: 'deleted', leftLineNumber: leftNum++, content: leftLines[l++] });
        }
        for (let i = 0; i < matchRight; i++) {
          result.push({ type: 'added', rightLineNumber: rightNum++, content: rightLines[r++] });
        }
      }
    }
  }
  return result;
}

function statusBadge(status: CompareStatus) {
  const map: Record<CompareStatus, { label: string; className: string } | null> = {
    added: { label: 'Added', className: 'bg-green-100 text-green-700' },
    deleted: { label: 'Deleted', className: 'bg-red-100 text-red-700' },
    modified: { label: 'Modified', className: 'bg-yellow-100 text-yellow-700' },
    identical: null,
  };
  const entry = map[status];
  if (!entry) return null;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${entry.className}`}>
      {entry.label}
    </span>
  );
}

function FileHeader({ file }: { file: FileNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
      <span className="font-semibold text-gray-800 text-sm">{file.name}</span>
      {statusBadge(file.status)}
      <span className="text-xs text-gray-400 font-mono ml-1">{file.path}</span>
    </div>
  );
}

function TextDiffView({ file }: { file: FileNode }) {
  const lines = generateDiffLines(file.leftContent ?? '', file.rightContent ?? '');

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-xs font-semibold text-purple-700">
          左側
        </div>
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 text-xs font-semibold text-pink-700">
          右側
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          {/* Left column */}
          <div>
            {lines.map((line, i) => {
              const isDeleted = line.type === 'deleted';
              const isAdded = line.type === 'added';
              const bg = isDeleted ? 'bg-red-50' : isAdded ? 'bg-gray-50' : 'hover:bg-gray-50';
              return (
                <div key={i} className={`flex font-mono text-xs ${bg}`}>
                  <span className="min-w-[3rem] text-right text-gray-400 select-none pr-3 py-0.5 border-r border-gray-100">
                    {isDeleted || line.type === 'unchanged' ? line.leftLineNumber : ''}
                  </span>
                  <span className="px-3 py-0.5 whitespace-pre text-gray-800">
                    {isDeleted ? line.content : line.type === 'unchanged' ? line.content : ''}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Right column */}
          <div>
            {lines.map((line, i) => {
              const isAdded = line.type === 'added';
              const isDeleted = line.type === 'deleted';
              const bg = isAdded ? 'bg-green-50' : isDeleted ? 'bg-gray-50' : 'hover:bg-gray-50';
              return (
                <div key={i} className={`flex font-mono text-xs ${bg}`}>
                  <span className="min-w-[3rem] text-right text-gray-400 select-none pr-3 py-0.5 border-r border-gray-100">
                    {isAdded || line.type === 'unchanged' ? line.rightLineNumber : ''}
                  </span>
                  <span className="px-3 py-0.5 whitespace-pre text-gray-800">
                    {isAdded ? line.content : line.type === 'unchanged' ? line.content : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BinaryFileView({ file }: { file: FileNode }) {
  const sizeLabel = file.size != null ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A';
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded text-sm text-gray-500">
        バイナリファイルは差分表示できません
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1 items-center bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <HardDrive size={20} className="text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">ファイルサイズ</span>
          <span className="text-sm font-semibold text-gray-700">{sizeLabel}</span>
        </div>
        <div className="flex flex-col gap-1 items-center bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <Hash size={20} className="text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">ハッシュ値</span>
          <span className="text-sm font-mono text-gray-700 truncate w-full text-center">{file.hash ?? 'N/A'}</span>
        </div>
        <div className="flex flex-col gap-1 items-center bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
          <Calendar size={20} className="text-gray-400" />
          <span className="text-xs text-gray-400 mt-1">更新日時</span>
          <span className="text-sm text-gray-700">{file.modifiedDate ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

export function FileDetailView({ file }: FileDetailViewProps) {
  if (!file || file.type === 'directory') {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        ファイルを選択してください
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <FileHeader file={file} />
      {file.isText ? <TextDiffView file={file} /> : <BinaryFileView file={file} />}
    </div>
  );
}
