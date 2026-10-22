use portable_pty::{Child, ChildKiller};

#[cfg(not(windows))]
pub fn clone_killer(child: &dyn Child) -> std::io::Result<Box<dyn ChildKiller + Send + Sync>> {
    Ok(child.clone_killer())
}

#[cfg(windows)]
pub fn clone_killer(child: &dyn Child) -> std::io::Result<Box<dyn ChildKiller + Send + Sync>> {
    use std::os::windows::io::BorrowedHandle;
    let handle = child
        .as_raw_handle()
        .ok_or_else(|| std::io::Error::other("Missing shell process handle"))?;
    // Duplicate while the Child owns the original handle; this prevents PID reuse races.
    let process = unsafe { BorrowedHandle::borrow_raw(handle) }.try_clone_to_owned()?;
    Ok(Box::new(WindowsKiller { process }))
}

#[cfg(windows)]
#[derive(Debug)]
struct WindowsKiller {
    process: std::os::windows::io::OwnedHandle,
}

#[cfg(windows)]
impl ChildKiller for WindowsKiller {
    fn kill(&mut self) -> std::io::Result<()> {
        use std::os::windows::io::AsRawHandle;
        use windows_sys::Win32::System::Threading::{GetExitCodeProcess, TerminateProcess};
        let handle = self.process.as_raw_handle();
        if unsafe { TerminateProcess(handle, 1) } != 0 {
            return Ok(());
        }
        let error = std::io::Error::last_os_error();
        let mut code = 259;
        if unsafe { GetExitCodeProcess(handle, &mut code) } != 0 && code != 259 {
            return Ok(());
        }
        Err(error)
    }
    fn clone_killer(&self) -> Box<dyn ChildKiller + Send + Sync> {
        Box::new(Self {
            process: self
                .process
                .try_clone()
                .expect("duplicate terminal process handle"),
        })
    }
}
