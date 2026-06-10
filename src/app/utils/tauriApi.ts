import { invoke } from '@tauri-apps/api/core';
import { FileNode } from '../types';

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

