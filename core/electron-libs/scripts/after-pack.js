#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const child_process = require('child_process');

const rootDir = path.join(__dirname, '..', '..', '..');
const signCommand = path.join(__dirname, 'sign.sh');
const notarizeCommand = path.join(__dirname, 'notarize.sh');
const entitlements = path.resolve(rootDir, 'entitlements.plist');

async function walkAsync(dir) {
  let files = await fs.readdir(dir);
  files = await Promise.all(
    files.map(async file => {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        return walkAsync(filePath);
      } else {
        return filePath;
      }
    }),
  );

  return files.flat();
}

const signFile = file => {
  console.log(`Signing ${file}...`);
  child_process.spawnSync(signCommand, [path.basename(file), entitlements, rootDir], {
    cwd: path.dirname(file),
    maxBuffer: 1024 * 10000,
    env: process.env,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
};

async function defaultFunction() {
  const appOutDir = path.join(__dirname, '..', '..', '..', 'unpack_dir');

  const branch = process.env.BRANCH_NAME;

  // if (!((branch === 'main' || releaseDryRun) && running_ci)) {
  //   console.log('Not a release or dry-run requiring signing/notarizing - skipping');
  //   return;
  // }

  let childPaths = await walkAsync(appOutDir);

  childPaths.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length).forEach(file => signFile(file));

  const singedDir = path.join(rootDir, 'signed');
  const singedAppPath = path.resolve(singedDir, 'Aspect-Model-Editor.app');

  console.log('Notarizing the application...');
  child_process.spawnSync(notarizeCommand, [path.basename(singedAppPath), 'org.eclipse.esmf.ame', rootDir], {
    cwd: path.dirname(singedDir),
    maxBuffer: 1024 * 10000,
    env: process.env,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
}

defaultFunction().catch(console.error);
