use std::collections::BTreeMap;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

// ── Constants ─────────────────────────────────────────────────────────────────

const SKIP_NAMES: &[&str] = &[
    ".git", ".DS_Store", "node_modules", "target", ".next", "dist", "__pycache__",
];

const TEXT_EXTENSIONS: &[&str] = &[
    "ts", "tsx", "js", "jsx", "mjs", "cjs", "json", "md", "txt", "css", "scss", "less", "html",
    "htm", "yaml", "yml", "toml", "sh", "bash", "zsh", "py", "rs", "go", "java", "kt", "swift",
    "c", "cpp", "h", "hpp", "vue", "svelte", "xml", "svg", "graphql", "sql", "lock", "env",
];

const MAX_TEXT_BYTES: u64 = 1 * 1024 * 1024; // 1 MB

// ── FileNode ──────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FileNode {
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub node_type: String,
    pub status: String,
    pub children: Option<Vec<FileNode>>,
    pub size: Option<u64>,
    pub modified_date: Option<String>,
    pub hash: Option<String>,
    pub is_text: Option<bool>,
    pub left_content: Option<String>,
    pub right_content: Option<String>,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn unix_to_datetime(secs: u64) -> String {
    // Civil calendar from http://howardhinnant.github.io/date_algorithms.html
    let z = (secs / 86400) as i64 + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = (z - era * 146097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    let tod = secs % 86400;
    let h = tod / 3600;
    let min = (tod % 3600) / 60;
    let s = tod % 60;
    format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", y, m, d, h, min, s)
}

fn is_text_file(name: &str) -> bool {
    let path = Path::new(name);
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        if TEXT_EXTENSIONS.contains(&ext.to_lowercase().as_str()) {
            return true;
        }
    }
    // dotfiles without extension (.gitignore, .env, etc.)
    if name.starts_with('.') && !name[1..].contains('.') {
        return true;
    }
    matches!(name, "Makefile" | "Dockerfile" | "Procfile")
}

fn hash_file(path: &Path) -> Option<String> {
    let mut file = std::fs::File::open(path).ok()?;
    let mut hasher = Sha256::new();
    let mut buf = [0u8; 65536];
    loop {
        let n = file.read(&mut buf).ok()?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }
    Some(hex::encode(hasher.finalize()))
}

fn read_text(path: &Path) -> Option<String> {
    let size = std::fs::metadata(path).ok()?.len();
    if size > MAX_TEXT_BYTES {
        return Some(format!("[File too large: {} bytes]", size));
    }
    std::fs::read_to_string(path).ok()
}

fn mtime(path: &Path) -> Option<String> {
    let secs = std::fs::metadata(path)
        .ok()?
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_secs();
    Some(unix_to_datetime(secs))
}

// ── Comparison ────────────────────────────────────────────────────────────────

fn compare_file(
    name: &str,
    left: Option<&Path>,
    right: Option<&Path>,
    rel: &str,
) -> FileNode {
    let text = is_text_file(name);

    match (left, right) {
        (Some(l), None) => {
            let hash = hash_file(l);
            let size = std::fs::metadata(l).ok().map(|m| m.len());
            FileNode {
                name: name.to_string(),
                path: rel.to_string(),
                node_type: "file".to_string(),
                status: "deleted".to_string(),
                children: None,
                size,
                modified_date: mtime(l),
                hash,
                is_text: Some(text),
                left_content: if text { read_text(l) } else { None },
                right_content: Some(String::new()),
            }
        }
        (None, Some(r)) => {
            let hash = hash_file(r);
            let size = std::fs::metadata(r).ok().map(|m| m.len());
            FileNode {
                name: name.to_string(),
                path: rel.to_string(),
                node_type: "file".to_string(),
                status: "added".to_string(),
                children: None,
                size,
                modified_date: mtime(r),
                hash,
                is_text: Some(text),
                left_content: Some(String::new()),
                right_content: if text { read_text(r) } else { None },
            }
        }
        (Some(l), Some(r)) => {
            let l_size = std::fs::metadata(l).ok().map(|m| m.len()).unwrap_or(0);
            let r_size = std::fs::metadata(r).ok().map(|m| m.len()).unwrap_or(0);
            let r_hash = hash_file(r);
            let status = if l_size != r_size {
                "modified"
            } else {
                let l_hash = hash_file(l);
                if l_hash.is_some() && l_hash == r_hash {
                    "identical"
                } else {
                    "modified"
                }
            };
            FileNode {
                name: name.to_string(),
                path: rel.to_string(),
                node_type: "file".to_string(),
                status: status.to_string(),
                children: None,
                size: Some(r_size),
                modified_date: mtime(r),
                hash: r_hash,
                is_text: Some(text),
                left_content: if text { read_text(l) } else { None },
                right_content: if text { read_text(r) } else { None },
            }
        }
        (None, None) => unreachable!(),
    }
}

fn compare_entries(left_dir: Option<&Path>, right_dir: Option<&Path>, rel: &str) -> Vec<FileNode> {
    // Collect all names from both sides, sorted
    let mut all: BTreeMap<String, (Option<PathBuf>, Option<PathBuf>)> = BTreeMap::new();

    if let Some(l) = left_dir {
        if let Ok(rd) = std::fs::read_dir(l) {
            for entry in rd.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if SKIP_NAMES.contains(&name.as_str()) { continue; }
                all.entry(name).or_default().0 = Some(entry.path());
            }
        }
    }
    if let Some(r) = right_dir {
        if let Ok(rd) = std::fs::read_dir(r) {
            for entry in rd.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if SKIP_NAMES.contains(&name.as_str()) { continue; }
                all.entry(name).or_default().1 = Some(entry.path());
            }
        }
    }

    all.into_iter()
        .map(|(name, (lp, rp))| {
            let child_rel = format!("{}/{}", rel, name);
            let is_dir = lp.as_deref().map(|p| p.is_dir())
                .or_else(|| rp.as_deref().map(|p| p.is_dir()))
                .unwrap_or(false);
            if is_dir {
                compare_directory(
                    &name,
                    lp.as_deref(),
                    rp.as_deref(),
                    &child_rel,
                )
            } else {
                compare_file(&name, lp.as_deref(), rp.as_deref(), &child_rel)
            }
        })
        .collect()
}

fn compare_directory(
    name: &str,
    left: Option<&Path>,
    right: Option<&Path>,
    rel: &str,
) -> FileNode {
    let children = compare_entries(left, right, rel);
    let status = match (left, right) {
        (None, _) => "added",
        (_, None) => "deleted",
        _ => {
            if children.iter().all(|c| c.status == "identical") {
                "identical"
            } else {
                "modified"
            }
        }
    };
    FileNode {
        name: name.to_string(),
        path: rel.to_string(),
        node_type: "directory".to_string(),
        status: status.to_string(),
        children: Some(children),
        size: None,
        modified_date: None,
        hash: None,
        is_text: None,
        left_content: None,
        right_content: None,
    }
}

fn compare_dirs_impl(left: &Path, right: &Path) -> Result<Vec<FileNode>, String> {
    if !left.is_dir() {
        return Err(format!("Left path is not a directory: {}", left.display()));
    }
    if !right.is_dir() {
        return Err(format!("Right path is not a directory: {}", right.display()));
    }
    Ok(compare_entries(Some(left), Some(right), ""))
}

// ── Tauri Commands ────────────────────────────────────────────────────────────

#[tauri::command]
async fn compare_directories(left: String, right: String) -> Result<Vec<FileNode>, String> {
    let left_path = PathBuf::from(left);
    let right_path = PathBuf::from(right);
    tauri::async_runtime::spawn_blocking(move || {
        compare_dirs_impl(&left_path, &right_path)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn open_folder_dialog(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog().file().pick_folder(move |f| {
        let _ = tx.send(f);
    });

    tauri::async_runtime::spawn_blocking(move || rx.recv())
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
        .map(|f| {
            f.and_then(|p| {
                p.into_path()
                    .ok()
                    .map(|path| path.to_string_lossy().to_string())
            })
        })
}

#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        std::fs::read_to_string(&path).map_err(|e| e.to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn open_file_dialog(app: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog().file().pick_file(move |f| {
        let _ = tx.send(f);
    });

    tauri::async_runtime::spawn_blocking(move || rx.recv())
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())
        .map(|f| {
            f.and_then(|p| {
                p.into_path()
                    .ok()
                    .map(|path| path.to_string_lossy().to_string())
            })
        })
}

#[tauri::command]
async fn compare_files(left: String, right: String) -> Result<FileNode, String> {
    let left_path = PathBuf::from(&left);
    let right_path = PathBuf::from(&right);

    if !left_path.is_file() {
        return Err(format!("Left path is not a file: {}", left_path.display()));
    }
    if !right_path.is_file() {
        return Err(format!("Right path is not a file: {}", right_path.display()));
    }

    tauri::async_runtime::spawn_blocking(move || {
        let name = left_path
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_else(|| "file".to_string());
        Ok(compare_file(&name, Some(&left_path), Some(&right_path), &name))
    })
    .await
    .map_err(|e| e.to_string())?
}

// ── Entry ─────────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            use tauri::Manager;
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_min_size(Some(tauri::LogicalSize::new(640.0_f64, 500.0_f64)));
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            compare_directories,
            open_folder_dialog,
            read_file_content,
            open_file_dialog,
            compare_files,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
