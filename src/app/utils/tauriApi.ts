import { invoke } from '@tauri-apps/api/core';
import { DiffLine, FileNode } from '../types';

export async function compareDirectories(left: string, right: string): Promise<FileNode[]> {
  return invoke<FileNode[]>('compare_directories', { left, right });
}

export async function openFolderDialog(): Promise<string | null> {
  return invoke<string | null>('open_folder_dialog');
}

export async function openFileDialog(): Promise<string | null> {
  return invoke<string | null>('open_file_dialog');
}

export async function compareFiles(left: string, right: string): Promise<FileNode> {
  return invoke<FileNode>('compare_files', { left, right });
}

export async function getPathType(path: string): Promise<'directory' | 'file' | 'not_found'> {
  return invoke<'directory' | 'file' | 'not_found'>('get_path_type', { path });
}

export async function computeDiff(
  leftContent: string,
  rightContent: string,
): Promise<DiffLine[]> {
  return invoke<DiffLine[]>('compute_diff', { leftContent, rightContent });
}

