/* eslint-disable no-console */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const commands = process.argv.slice(2);
const [filePath, destinationPath] = commands;
let currDir = null;
let destDir = null;
let currFile = null;
let destFile = null;

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
  if (commands.length < 2) {
    console.error(`Check arguments in comand line`);

    return false;
  } else if (isDirectory(filePath)) {
    console.error(`Source is a directory!`);

    return false;
  } else if (!fs.existsSync(destDir) && !destinationPath.endsWith(path.sep)) {
    console.error(`Destination directory does not exist!`);

    return false;
  }

  return true;
}

function isLikeDirectory(destPath) {
  if (fs.existsSync(destPath)) {
    try {
      return fs.statSync(destPath).isDirectory();
    } catch (err) {
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

function isDirectory(somePath) {
  try {
    const stats = fs.statSync(somePath);

    return stats.isDirectory();
  } catch (err) {
    console.error(err.message);

    return false;
  }
}

function moveFile(pathFrom, pathTo) {
  let destination = pathTo;

  if (isLikeDirectory(pathTo)) {
    destination = path.join(pathTo, currFile);
  }

  const action = renameOrMove();

  if (action === 'noop') {
    console.log('Nothing to do: source and destination are equal.');

    return;
  }

  const phrase =
    action === 'rn'
      ? 'renamed'
      : action === 'mv'
        ? 'moved'
        : action === 'rnmv'
          ? 'renamed and moved'
          : 'processed';

  if (fs.existsSync(pathFrom)) {
    fs.rename(pathFrom, destination, (error) => {
      if (error) {
        console.error(
          `Error occurred while trying to rename or move a file: ${error.message}`,
        );
      } else {
        console.log(`File ${phrase} successfully!`);
      }
    });
  } else {
    console.error('Wrong path to file');
  }
}
