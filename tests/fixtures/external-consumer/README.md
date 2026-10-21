# External consumer fixture

This is test input, not another workspace application. The validation script copies it to a fresh operating-system temporary directory, installs a packed Frame archive there, and builds it without source aliases, workspace dependencies, or a TypeScript configuration inherited from Frame.

From the repository root:

```powershell
./scripts/validate-external-consumer.ps1
```

Add `-Browser` for Chromium interactions and `-Native` for the Windows Tauri/WebView smoke test. The browser check requires Python with Playwright and its Chromium browser installed. To keep these dependencies local:

```powershell
python -m venv .tmp/consumer-test-python
.tmp/consumer-test-python/Scripts/python.exe -m pip install playwright
.tmp/consumer-test-python/Scripts/python.exe -m playwright install chromium
./scripts/validate-external-consumer.ps1 -Browser -Native -Python .tmp/consumer-test-python/Scripts/python.exe
```

The script requires PowerShell 7, Bun, and npm. Native testing also requires Rust and the Windows Tauri build prerequisites. Dependency installation may access package registries. Nothing is published.

Each consumer is retained in a separate temporary directory for inspection; its path is printed and saved in `.tmp/external-consumer-path.txt`. Browser reports and screenshots, native results, and the archive are stored under `.tmp/` and ignored by Git.

The native fixture runs hidden, calls its own Rust command, exercises window operations, writes its result, and exits. It is an automated smoke test, not an interactive application or a desktop visual acceptance test. Its extra `allow-unminimize` permission is only used to restore the window during the test.
