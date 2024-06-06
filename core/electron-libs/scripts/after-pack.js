#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const child_process = require('child_process');
const isBinaryFile = require('isbinaryfile').isBinaryFile;

const rootDir = path.join(__dirname, '..', '..', '..');
const signCommand = path.join(__dirname, 'sign.sh');
const notarizeCommand = path.join(__dirname, 'notarize.sh');
const entitlements = path.resolve(rootDir, 'entitlements.plist');

async function walkAsync(dirPath) {
  console.log('Walking... ' + dirPath);

  async function _walkAsync(dirPath) {
    const children = await fs.readdir(dirPath);
    return await Promise.all(
      children.map(async child => {
        const filePath = path.resolve(dirPath, child);

        const stat = await fs.stat(filePath);
        if (stat.isFile()) {
          switch (path.extname(filePath)) {
            case '.cstemp': // Temporary file generated from past codesign
              console.log('Removing... ' + filePath);
              await fs.remove(filePath);
              return null;
            default:
              return await getFilePathIfBinary(filePath);
          }
        } else if (stat.isDirectory() && !stat.isSymbolicLink()) {
          const walkResult = await _walkAsync(filePath);
          switch (path.extname(filePath)) {
            case '.app': // Application
            case '.framework': // Framework
              walkResult.push(filePath);
          }
          return walkResult;
        }
        return null;
      }),
    );
  }

  const allPaths = await _walkAsync(dirPath);
  return compactFlattenedList(allPaths);
}

async function getFilePathIfBinary(filePath) {
  if (await isBinaryFile(filePath)) {
    return filePath;
  }
  return null;
}

function compactFlattenedList(list) {
  const result = [];

  function populateResult(list) {
    if (!Array.isArray(list)) {
      if (list) result.push(list);
    } else if (list.length > 0) {
      for (const item of list) if (item) populateResult(item);
    }
  }

  populateResult(list);
  return result;
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
  const appOutDir = path.join(__dirname, '..', '..', '..', 'unpack_mac_dir');
  const singedAppPath = path.resolve(appOutDir, 'Aspect-Model-Editor.app');

  let childPaths = await walkAsync(appOutDir);

  childPaths.sort((a, b) => b.split(path.sep).length - a.split(path.sep).length).forEach(file => signFile(file));

  console.log('Notarizing the application...');
  child_process.spawnSync(notarizeCommand, [path.basename(singedAppPath), 'org.eclipse.esmf'], {
    cwd: path.dirname(singedAppPath),
    maxBuffer: 1024 * 10000,
    env: process.env,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
}

defaultFunction().catch(console.error);
