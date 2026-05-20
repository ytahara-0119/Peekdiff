export type CompareStatus = 'added' | 'deleted' | 'modified' | 'identical';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  status: CompareStatus;
  children?: FileNode[];
  size?: number;
  modifiedDate?: string;
  hash?: string;
  isText?: boolean;
  leftContent?: string;
  rightContent?: string;
}

export interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged';
  leftLineNumber?: number;
  rightLineNumber?: number;
  content: string;
}
