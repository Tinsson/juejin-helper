#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
// eslint-disable-next-line
const zipFolder = require('zip-folder');

const extManifestJson = require("../extension/manifest.json");

const DEST_DIR = path.join(__dirname, "../extension");
const DEST_ZIP_DIR = path.join(__dirname, "../zip");

const extractExtensionData = () => ({
  name: extManifestJson.name,
  version: extManifestJson.version
});

const makeDestZipDirIfNotExists = () => {
  if (!fs.existsSync(DEST_ZIP_DIR)) {
    fs.mkdirSync(DEST_ZIP_DIR);
  }
};

const buildZip = (src, dist, zipFilename) => {
  console.info(`Building ${zipFilename}...`);

  return new Promise((resolve, reject) => {
    zipFolder(src, path.join(dist, zipFilename), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const main = () => {
  const { version } = extractExtensionData();
  const zipFilename = `v${version}.zip`;

  makeDestZipDirIfNotExists();

  buildZip(DEST_DIR, DEST_ZIP_DIR, zipFilename)
    .then(() => console.info("OK"))
    .catch(console.err);
};

main();
