use serde::Serialize;
use std::path::PathBuf;

#[derive(Clone, Serialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    pub default: bool,
}

fn executable(name: &str) -> Option<PathBuf> {
    std::env::split_paths(&std::env::var_os("PATH")?)
        .map(|p| p.join(name))
        .find(|p| p.is_file())
}

fn add(result: &mut Vec<Profile>, id: &str, name: &str, path: Option<PathBuf>) {
    if let Some(path) = path.filter(|p| p.is_file()) {
        let path = path.components().collect::<PathBuf>();
        result.push(Profile {
            id: id.into(),
            name: name.into(),
            path,
            default: false,
        });
    }
}

pub fn detect() -> Vec<Profile> {
    let mut result = Vec::new();
    #[cfg(windows)]
    {
        let program_files = std::env::var_os("ProgramFiles").map(PathBuf::from);
        // Prefer PowerShell 7; Windows PowerShell 5.1 remains a separate explicit choice.
        let pwsh = executable("pwsh.exe").or_else(|| {
            program_files
                .as_ref()
                .map(|p| p.join("PowerShell/7/pwsh.exe"))
        });
        add(&mut result, "pwsh", "PowerShell", pwsh);
        let windows =
            PathBuf::from(std::env::var_os("SystemRoot").unwrap_or_else(|| "C:\\Windows".into()));
        add(
            &mut result,
            "powershell",
            "Windows PowerShell",
            Some(windows.join("System32/WindowsPowerShell/v1.0/powershell.exe")),
        );
        add(
            &mut result,
            "cmd",
            "Command Prompt",
            Some(windows.join("System32/cmd.exe")),
        );
        let git = executable("git.exe")
            .and_then(|p| p.parent()?.parent().map(|p| p.join("bin/bash.exe")))
            .filter(|p| p.is_file())
            .or_else(|| program_files.as_ref().map(|p| p.join("Git/bin/bash.exe")));
        add(&mut result, "git-bash", "Git Bash", git);
        // WSL's launcher may exist without a distribution. Only offer configured WSL.
        use winreg::{enums::HKEY_CURRENT_USER, RegKey};
        let configured = RegKey::predef(HKEY_CURRENT_USER)
            .open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Lxss")
            .map(|key| key.enum_keys().any(|entry| entry.is_ok()))
            .unwrap_or(false);
        if configured {
            add(
                &mut result,
                "wsl",
                "WSL",
                Some(windows.join("System32/wsl.exe")),
            );
        }
    }
    #[cfg(not(windows))]
    {
        for (id, name) in [
            ("zsh", "Zsh"),
            ("bash", "Bash"),
            ("fish", "Fish"),
            ("sh", "Shell"),
        ] {
            add(&mut result, id, name, executable(id));
        }
        if let Ok(shell) = std::env::var("SHELL") {
            if let Some(profile) = result.iter_mut().find(|p| p.path == PathBuf::from(&shell)) {
                profile.default = true;
            }
        }
    }
    if !result.iter().any(|p| p.default) {
        if let Some(first) = result.first_mut() {
            first.default = true;
        }
    }
    result
}
