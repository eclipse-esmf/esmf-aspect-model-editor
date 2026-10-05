# Aspect Model Editor

## Table of Contents

- [Introduction](#introduction)
- [Getting help](#getting-help)
- [Getting started](#getting-started-for-developers)
  - [Setup](#setup)
  - [Install & Run](#install--run-web-only)
  - [Backend for the desktop app](#backend-for-the-desktop-app)
  - [Run As Desktop (Tauri)](#run-as-desktop-tauri)
  - [Build Desktop App](#build-desktop-app)
  - [Release](#release)
  - [Running E2E (Playwright) Tests](#running-e2e-playwright-tests)
- [Documentation](#documentation)
- [License](#license)

## Introduction

This project includes the Aspect Model Editor and its documentation.
As a user, download the Installer from https://github.com/eclipse-esmf/esmf-aspect-model-editor/releases .

## Getting help

Are you having trouble with Aspect Model Editor? We want to help!

- Check the [developer documentation](https://eclipse-esmf.github.io)
- Check the
  SAMM [specification](https://eclipse-esmf.github.io/samm-specification/2.2.0/index.html)
- Having issues with the Aspect Model Editor? Open
  a [GitHub issue](https://github.com/eclipse-esmf/esmf-aspect-model-editor/issues).

### Getting started (for developers)

#### Artifacts to use

You can clone the repositories to run the aspect model editor. Feel free to contribute.
If you want to run the aspect model editor from repositories, please ensure to clone and start the [backend](https://github.com/eclipse-esmf/esmf-aspect-model-editor-backend) first.

#### Setup

Common prerequisites for all platforms:

- [Node.js](https://nodejs.org/en/download/) 22 (LTS) and [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- [Rust & Cargo](https://rustup.rs/) (stable toolchain, required for the Tauri desktop app)
- To generate Aspect Model documentation, the installation of [GraphViz](https://graphviz.org/download) is required.

Platform-specific prerequisites for the Tauri desktop app (see also the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)):

| Platform | Requirements                                                                                                                                                                                                                                  |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| macOS    | Xcode Command Line Tools: `xcode-select --install`                                                                                                                                                                                            |
| Linux    | WebKitGTK and build tools, e.g. on Debian/Ubuntu:<br>`sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev patchelf`                                         |
| Windows  | [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (workload "Desktop development with C++") and [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (preinstalled on Windows 10/11) |

#### First steps into the code: [Code Overview](CODE-OVERVIEW.md)

#### Install & Run (Web only)

```bash
# enter the core directory where package.json is located
cd core

pnpm install
pnpm run start
```

The editor is then available at http://localhost:4200 and expects a running [backend](https://github.com/eclipse-esmf/esmf-aspect-model-editor-backend) on port `9090`.

#### Backend for the desktop app

The desktop app bundles the backend as a [jpackage](https://docs.oracle.com/en/java/javase/21/docs/specs/man/jpackage.html) app image.
Release builds take it from the platform-specific folder in the repository root:

| Platform | Folder             | Expected content (from the backend release)                           |
|----------|--------------------|-----------------------------------------------------------------------|
| macOS    | `backend/macos/`   | `ame-backend-<version>-mac-<arch>.app` (extracted from `*-mac-arm64.zip` on Apple silicon or `*-mac-x64.zip` on Intel) |
| Linux    | `backend/linux/`   | `ame-backend-<version>-linux/bin/...` (extracted from `*-linux.tar.gz`) |
| Windows  | `backend/windows/` | app image containing `ame-backend*.exe` (extracted from `*-win.zip`)  |

The folder is only needed for release builds (`pnpm run build:desktop`), which fail with a hint if it is missing.
They add it as bundle resource via `core/src-tauri/tauri.bundle-backend.<os>.conf.json` (see `core/utils/tauri-build.mjs`) and start the bundled backend automatically.
Use this script instead of `tauri build` directly, otherwise the backend is missing in the app.

In development mode (`pnpm run start:desktop`) the folder is not required and the bundled backend is **not** started; the app expects a backend that you started yourself on port `9090`.

#### Run As Desktop (Tauri)

To run the desktop application in development mode (starts the Angular dev server and the native Tauri window with hot reload).
The command is the same on macOS, Linux and Windows:

```bash
cd core

pnpm install
pnpm run start:desktop
```

Make sure the backend is running on port `9090` before working with models (see above).

#### Build Desktop App

Desktop packages must be built on the target platform (no cross-compilation). The command builds the Angular production bundle and the Tauri app in one step:

```bash
cd core

pnpm run build:desktop
```

The bundles for the current platform are written to `core/src-tauri/target/release/bundle/`:

| Platform | Output                                                                           |
|----------|----------------------------------------------------------------------------------|
| macOS    | `macos/Aspect Model Editor.app` and `dmg/Aspect Model Editor_<version>_<arch>.dmg` |
| Linux    | `appimage/*.AppImage` and `deb/*.deb`                                            |
| Windows  | `nsis/*-setup.exe` (per-user NSIS installer)                                     |

The backend app image contains its own Java runtime and therefore matches the processor architecture: use the `mac-arm64` backend for Apple silicon builds and the `mac-x64` backend for Intel builds.

Unsigned macOS builds may be blocked by Gatekeeper. Remove the quarantine flag with
`xattr -rd com.apple.quarantine "/Applications/Aspect Model Editor.app"`.

#### Release

The workflow `.github/workflows/tagged_release.yml` (manually started with the release version) creates the release.
The backend release with the same version must exist before (repository `esmf-aspect-model-editor-backend` of the same owner, so a fork uses the backend release of the fork).

1. `prepare` sets the documentation version, creates the branch `<major>.<minor>.x`, the tag `v<version>` and a draft release. Release candidates (e.g. `2.3.0-rc1`) become a pre-release.
2. `build` builds the app on every platform with the matching backend and uploads it to the draft release:

   | Runner           | Release assets                                                                                     |
   |------------------|----------------------------------------------------------------------------------------------------|
   | `ubuntu-latest`  | `aspect-model-editor-v<version>-linux-glibc-v<glibc>.AppImage`, `aspect-model-editor-v<version>-linux-amd64.deb` |
   | `macos-15-intel` | `aspect-model-editor-v<version>-mac-x64.dmg`, `aspect-model-editor-v<version>-mac-x64.app.zip`     |
   | `macos-latest`   | `aspect-model-editor-v<version>-mac-arm64.dmg`, `aspect-model-editor-v<version>-mac-arm64.app.zip` |
   | `windows-latest` | `aspect-model-editor-v<version>-win.exe` (workflow artifact only, signed and uploaded by Jenkins)  |

3. `publish` publishes the release and triggers the Jenkins job which signs the Windows installer.
   The Jenkins job is only triggered in the repository `eclipse-esmf`, so the workflow can be tested in a fork.

#### Running E2E (Playwright) Tests

```bash
cd core

# Run all E2E tests headless
pnpm run e2e

# Run with interactive UI
pnpm run e2e:ui

# Run headed
pnpm run e2e:headed
```

## Documentation

The documentation can be found in the root directory under the path documentation.

## License

SPDX-License-Identifier: MPL-2.0

This program and the accompanying materials are made available under the terms of the
[Mozilla Public License, v. 2.0](LICENSE).

The [Notice file](NOTICE.md) details contained third party materials.

## GraalVm native-image

To build a native image we use GraalVm: [GraalVm](https://github.com/oracle/graal/tree/vm-ce-22.1.0)
