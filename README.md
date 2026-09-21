# Aspect Model Editor

## Table of Contents

- [Introduction](#introduction)
- [Getting help](#getting-help)
- [Getting started](#getting-started-for-developers)
  - [Setup](#setup)
  - [Install & Run](#install--run)
  - [Run As Desktop (Tauri)](#run-as-desktop-tauri)
  - [Build Desktop App](#build-desktop-app)
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

- Download & Install [Node.js](https://nodejs.org/en/download/) (v20+ recommended)
- Install [Rust & Cargo](https://rustup.rs/) (required for Tauri desktop build):
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```
- To generate Aspect Model documentation, the installation of [GraphViz](https://graphviz.org/download) is required.

#### First steps into the code: [Code Overview](CODE-OVERVIEW.md)

#### Install & Run (Web only)

```bash
# enter the core directory where package.json is located
cd core

pnpm install
pnpm run start
```

#### Run As Desktop (Tauri)

To run the desktop application in development mode (starts both the Angular frontend and the native Tauri window):

```bash
cd core

pnpm run start:desktop
# or
pnpm run tauri:dev
```

#### Build Desktop App

To build production desktop packages:

```bash
cd core

# Current platform
pnpm run build:desktop

# Or platform-specific targets
pnpm run build:mac     # macOS (.app, .dmg)
pnpm run build:win     # Windows (.msi, .exe)
pnpm run build:linux   # Linux (.deb, .AppImage)
```

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
