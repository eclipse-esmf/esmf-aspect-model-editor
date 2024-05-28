#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const child_process = require('child_process');

const signCommand = path.join(__dirname, 'sign.sh');
const notarizeCommand = path.join(__dirname, 'notarize.sh');
const entitlements = path.resolve(__dirname, '..', '..', '..', 'entitlements.plist');

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
  child_process.spawnSync(signCommand, [path.basename(file), entitlements], {
    cwd: path.dirname(file),
    maxBuffer: 1024 * 10000,
    env: process.env,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
};

async function defaultFunction() {
  const appOutDir = path.join(__dirname, '..', '..', '..', 'unpack_dir');
  const appPath = path.resolve(appOutDir, 'Aspect-Model-Editor.app');

  const releaseDryRun = process.env.ESMF_JENKINS_RELEASE_DRYRUN === 'true';
  const branch = process.env.BRANCH_NAME;
  const running_ci = process.env.ESMF_JENKINS_CI === 'true';

  // if (!((branch === 'main' || releaseDryRun) && running_ci)) {
  //   console.log('Not a release or dry-run requiring signing/notarizing - skipping');
  //   return;
  // }

  console.log('Detected ESMF Release on Mac ' + (releaseDryRun ? ' (dry-run)' : '') + ' - proceeding with signing and notarizing');

  let childPaths = await walkAsync(appOutDir);

  childPaths.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length).forEach(file => signFile(file));

  console.log('Notarizing the application...');
  child_process.spawnSync(notarizeCommand, [path.basename(appPath), 'org.eclipse.esmf.ame'], {
    cwd: path.dirname(appPath),
    maxBuffer: 1024 * 10000,
    env: process.env,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
}

defaultFunction().catch(console.error);
