#!/usr/bin/env node

const os = require('os');
const path = require('path');
const child_process = require('child_process');
const sign_util = require('electron-osx-sign/util');

const signCommand = path.join(__dirname, 'sign.sh');
const notarizeCommand = path.join(__dirname, 'notarize.sh');
const entitlements = path.resolve(__dirname, '..', '..', '..', 'entitlements.plist');

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
  const running_on_mac = os.platform() === 'darwin' || os.platform() === 'mac';
  const appOutDir = path.join(__dirname, '..', '..', 'electron', 'mac');
  const appPath = path.resolve(appOutDir, 'Aspect-Model-Editor.app');

  if (!running_on_mac) {
    console.log('This will only run on MacOs.');
    return;
  }

  const releaseDryRun = process.env.ESMF_JENKINS_RELEASE_DRYRUN === 'true';
  const branch = process.env.BRANCH_NAME;
  const running_ci = process.env.ESMF_JENKINS_CI === 'true';

  // if (!((branch === 'main' || releaseDryRun) && running_ci)) {
  //   console.log('Not a release or dry-run requiring signing/notarizing - skipping');
  //   return;
  // }

  console.log('Detected ESMF Release on Mac ' + (releaseDryRun ? ' (dry-run)' : '') + ' - proceeding with signing and notarizing');

  let childPaths = await sign_util.walkAsync(appOutDir);

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
