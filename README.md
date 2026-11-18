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
  - [Reproducible Linux build with Docker](#reproducible-linux-build-with-docker)
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
| macOS    | `backend/macos/`   | `ame-backend-<version>-mac-<arch>.app` (extracted from `*-mac-arm64.tar.gz` on Apple silicon or `*-mac-x64.tar.gz` on Intel) |
| Linux    | `backend/linux/`   | `ame-backend-<version>-linux/bin/...` (extracted from `*-linux.tar.gz`) |
| Windows  | `backend/windows/` | app image containing `ame-backend*.exe` (extracted from `*-win.zip`)  |

The folder is only needed for release builds (`pnpm run build:tauri`), which fail with a hint if it is missing.
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

pnpm run build:tauri
```

On Linux the script sets `NO_STRIP=true`, because the `strip` bundled with the AppImage tooling fails on libraries of current distributions.

The bundles for the current platform are written to `core/src-tauri/target/release/bundle/`:

| Platform | Output                                                                           |
|----------|----------------------------------------------------------------------------------|
| macOS    | `macos/Aspect Model Editor.app` and `dmg/Aspect Model Editor_<version>_<arch>.dmg` |
| Linux    | `appimage/*.AppImage` and `deb/*.deb`                                            |
| Windows  | `nsis/*-setup.exe` (per-user NSIS installer)                                     |

The program file is named per platform via `mainBinaryName` in `core/src-tauri/tauri.<os>.conf.json`: `aspect-model-editor` on Linux (the `.deb` installs `/usr/bin/aspect-model-editor`), `Aspect Model Editor` inside the macOS app bundle and `Aspect-Model-Editor.exe` on Windows.
The backend app image contains its own Java runtime and therefore matches the processor architecture: use the `mac-arm64` backend for Apple silicon builds and the `mac-x64` backend for Intel builds.

Unsigned macOS builds may be blocked by Gatekeeper. Remove the quarantine flag with
`xattr -rd com.apple.quarantine "/Applications/Aspect Model Editor.app"`.

On Linux (AppImage and `.deb`) the app sets `WEBKIT_DISABLE_DMABUF_RENDERER=1` at startup, because the DMA-BUF renderer of WebKitGTK shows a blank window with several GPU drivers (e.g. NVIDIA, virtual machines). An explicitly set value is kept.
If the window still stays blank or flickers, start the app with `WEBKIT_DISABLE_COMPOSITING_MODE=1` (slower rendering), e.g. `WEBKIT_DISABLE_COMPOSITING_MODE=1 ./Aspect-Model-Editor.AppImage`.

#### Reproducible Linux build with Docker

`Dockerfile.tauri` builds the complete Linux desktop app, including the bundled backend, in a defined environment.
Use it to check a change of the frontend, the Tauri shell or the backend the way the release builds it, without installing Java, Rust and the Linux libraries yourself.
It is run manually and is not part of the pull request check.

**What it checks.** A successful `docker build` means that all of the following worked:

1. **Backend:** it is built from source. The backend lives in its own repository, [esmf-aspect-model-editor-backend](https://github.com/eclipse-esmf/esmf-aspect-model-editor-backend); the release workflow downloads it as a finished backend release instead.
   - `mvn clean install` runs with the backend tests, as in the backend pull request check.
   - `jlink` and `jpackage` then create the Linux app image with the options of the backend release (`.github/actions/package-app-image`).
   - The app image is placed in `backend/linux/`, the folder `pnpm run build:tauri` expects (see [Backend for the desktop app](#backend-for-the-desktop-app)).
2. **Frontend and Tauri:** `pnpm install --frozen-lockfile` and `pnpm run build:tauri` build the Angular production bundle, the Rust/Tauri shell, the AppImage and the `.deb`.
3. **Bundles:**
   - the AppImage and the `.deb` contain the backend, and the `.deb` contains the example models;
   - the backend from the `.deb` is started with its own Java runtime and must answer HTTP requests.

The build fails as soon as one of these steps fails.

**Versions.** They follow the project and the release workflows:

| Tool | Version |
|------|---------|
| Base image | Ubuntu 22.04, the release runner; it decides the glibc version of the AppImage |
| Java | Temurin 25.0.3 |
| Maven | 3.9.16 |
| Node.js | 22.23.3 |
| pnpm | 11.24.0 |
| Rust | 1.98.1 |

Dependencies come from `core/pnpm-lock.yaml`, `core/src-tauri/Cargo.lock` and the backend `pom.xml`.
The versions are build arguments (e.g. `--build-arg RUST_VERSION=...`).

**Requirements.** Only [Docker](https://docs.docker.com/get-docker/) is needed:

- Docker Desktop (macOS, Windows) or Docker Engine (Linux), version 23 or newer (BuildKit is the default builder there).
- About 8 GB of memory for Docker. On Windows, WSL2 gets half of the RAM by default; set more in `.wslconfig` if needed.
- About 25 GB of free disk space (image and build cache).
- Internet access.
- On Windows, Docker Desktop must use **Linux containers** (the default).

Java, Maven, Node.js, pnpm, Rust and the Linux libraries are installed inside the image in the versions above.
Nothing installed on your machine is used, and no local build output is copied into the build: the build context contains only the sources of `core/`, see `Dockerfile.tauri.dockerignore`.
The only exception is a local backend checkout that you pass explicitly with `--build-context` (see below).

**Run it** from the repository root. The platform `linux/amd64` is required, also on Apple silicon (emulated, much slower):

```bash
docker build --platform linux/amd64 -f Dockerfile.tauri -t ame-tauri-build .
```

**Choose the backend:**

- By default the backend is cloned from the `main` branch of `eclipse-esmf/esmf-aspect-model-editor-backend`.
- Use a fork, branch or release tag:

  ```bash
  docker build --platform linux/amd64 -f Dockerfile.tauri -t ame-tauri-build \
    --build-arg BACKEND_REPOSITORY=<owner>/esmf-aspect-model-editor-backend --build-arg BACKEND_REF=v<version> .
  ```

  For a reproducible build, use a tag or commit instead of a branch.
- Use a local checkout of the backend instead:

  ```bash
  docker build --platform linux/amd64 -f Dockerfile.tauri -t ame-tauri-build \
    --build-context backend-source=../esmf-aspect-model-editor-backend .
  ```

- Skip the backend tests with `--build-arg BACKEND_SKIP_TESTS=true`, like the release does.

**Get the AppImage and the `.deb`** into the folder `docker-build/` (ignored by git). Remove the folder of a previous run first, so that no outdated bundles remain:

```bash
rm -rf docker-build
docker build --platform linux/amd64 -f Dockerfile.tauri --target artifacts --output type=local,dest=docker-build .
```

The folder is only created when the build and all checks succeed.
In PowerShell, remove the folder with `Remove-Item -Recurse -Force docker-build`.
The multi-line commands above use `\`; in PowerShell use `` ` `` instead or write them on one line.

Both commands run the same build and the same checks; only the result differs:

| Command | Builds and checks everything | Result | Starts the app window |
|---------|------------------------------|--------|-----------------------|
| `-t ame-tauri-build` | yes | image `ame-tauri-build`, the bundles stay inside it | no |
| `--target artifacts --output ...` | yes | AppImage and `.deb` in `docker-build/`, no image | no |

Use the first command to check that everything builds.
Use the second one to try the app afterwards on a Linux x86_64 machine or VM (on a Mac e.g. an x86_64 Ubuntu VM; an ARM VM does not run the bundles):

```bash
chmod +x ./*.AppImage && ./*.AppImage
# or
sudo apt install ./*.deb
```

**Try the Linux bundles on Windows (WSL).**
Windows 11 shows Linux apps with a window directly on the Windows desktop via WSL2 with WSLg; no VM or Docker is needed.
On Windows 10, WSLg requires build 19044 or newer and WSL from the Microsoft Store.
This tests the **Linux** app, not the Windows installer.

```powershell
# once, in PowerShell as administrator
wsl --install -d Ubuntu-22.04
```

Then, in the Ubuntu shell:

```bash
# copy the bundles from the Windows drive first, starting them from /mnt/c is slow
cp /mnt/c/<path-to-repository>/docker-build/*.deb /mnt/c/<path-to-repository>/docker-build/*.AppImage ~/

# either install the .deb (it usually also appears in the Windows start menu)
sudo apt install ~/*.deb
aspect-model-editor

# or run the AppImage (without FUSE in WSL, hence --appimage-extract-and-run)
chmod +x ~/*.AppImage && ~/*.AppImage --appimage-extract-and-run
```

If the window stays blank, start the app with `LIBGL_ALWAYS_SOFTWARE=1`, e.g. `LIBGL_ALWAYS_SOFTWARE=1 aspect-model-editor`.

**What it does not cover.**
- It validates the **Linux** build (x86_64) only. macOS and Windows packages need native builds on these platforms, see [Build Desktop App](#build-desktop-app).
- The app window is not started in the container: the container has no display, and the bundles are Linux programs that do not run on macOS or Windows directly. Only the bundled backend is started there as a check.
- The app version stays `0.0.1`; the release workflow sets the release version.

#### Release

The workflow `.github/workflows/tagged_release.yml` (manually started with the release version) creates the release.
The backend release with the same version must exist before (repository `esmf-aspect-model-editor-backend` of the same owner, so a fork uses the backend release of the fork).

1. `prepare` sets the documentation version, creates the branch `<major>.<minor>.x`, the tag `v<version>` and a draft release. Release candidates (e.g. `2.3.0-rc1`) become a pre-release.
2. `build` builds the app on every platform with the matching backend and uploads it to the draft release:

   | Runner           | Release assets                                                                                     |
   |------------------|----------------------------------------------------------------------------------------------------|
   | `ubuntu-22.04`   | `aspect-model-editor-v<version>-linux-glibc-v<glibc>.AppImage`, `aspect-model-editor-v<version>-linux-amd64.deb` |
   | `macos-15-intel` | `aspect-model-editor-v<version>-mac-x64.dmg`                                                       |
   | `macos-latest`   | `aspect-model-editor-v<version>-mac-arm64.dmg`                                                     |
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
