/* eslint-disable no-console */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const [filePath, destinationPath] = process.argv.slice(2);

let currDir, currFile, destDir, destFile;

if (typeof filePath === 'string') {
  currDir = path.dirname(filePath);
  currFile = path.basename(filePath);
}

if (typeof destinationPath === 'string') {
  destDir = path.dirname(destinationPath);
  destFile = path.basename(destinationPath) || currFile;
}

if (conditionsCheck()) {
  moveFile(filePath, destinationPath);
}

function conditionsCheck() {
  if (!filePath || !destinationPath) {
    console.error('Check arguments in command line');

    return false;
  }

  if (isDirectory(filePath)) {
    console.error('Source is a directory!');

    return false;
  }

  if (!fs.existsSync(destDir) && !destinationPath.endsWith(path.sep)) {
    console.error('Destination directory does not exist!');

    return false;
  }

  return true;
}

function isDirectory(p) {
  try {
    return fs.statSync(path.resolve(p)).isDirectory();
  } catch {
    return false;
  }
}

function isLikeDirectory(destPath) {
  if (fs.existsSync(destPath)) {
    try {
      return fs.statSync(destPath).isDirectory();
    } catch {
      return false;
    }
  }

  if (destPath.endsWith(path.sep)) {
    return true;
  }

  if (path.extname(destPath)) {
    return false;
  }

  return false;
}

function renameOrMove() {
  if (currDir === destDir && currFile === destFile) {
    return 'noop';
  }

  if (currDir === destDir && currFile !== destFile) {
    return 'rn';
  }

  if (currDir !== destDir) {
    if (currFile === destFile) {
      return 'mv';
    } else {
      return 'rnmv';
    }
  }
}

function moveFile(pathFrom, pathTo) {
  const destination = isLikeDirectory(pathTo)
    ? path.join(pathTo, currFile)
    : pathTo;

  const action = renameOrMove();

  if (action === 'noop') {
    console.log('Nothing to do: source and destination are equal.');

    return;
  }

  const phrase =
    {
      rn: 'renamed',
      mv: 'moved',
      rnmv: 'renamed and moved',
    }[action] || 'processed';

  if (!fs.existsSync(pathFrom)) {
    console.error('Wrong path to file');

    return;
  }

  fs.rename(pathFrom, destination, (err) => {
    if (err) {
      console.error(`Error while trying to move/rename: ${err.message}`);
    } else {
      console.log(`File ${phrase} successfully!`);
    }
  });
}
