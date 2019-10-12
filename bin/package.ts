#!/usr/bin/env ts-node

import * as archiver from 'archiver';
import * as fs from 'fs';
import { execSync } from 'child_process';
import * as path from 'path';
import * as rimraf from 'rimraf';

const paths = {
    archive: path.join(__dirname, '../dist/deploy.zip'),
    dist: path.join(__dirname, '../dist'),
    package: path.join(__dirname, '../package.json'),
};

const clean = (): void => rimraf.sync(paths.archive);

const installPackages = (): void => {
    execSync(`npm --no-save --production --prefix ${paths.dist} install ${paths.package}`, {stdio: [0, 1, 2]});
};

const createDeploymentPackage = async (): Promise<void> => new Promise((resolve, reject) => {
    const cwd = process.cwd();
    process.chdir(paths.dist);
    const output = fs.createWriteStream(paths.archive);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', () => {
        console.log(archive.pointer() + ' total bytes');
        process.chdir(cwd);
        resolve();
    });

    archive.on('warning', (err: any) => {
        if (err.code === 'ENOENT') {
            console.log(err.message);
        } else {
            process.chdir(cwd);
            reject(err);
        }
    });

    archive.on('error', (err: any) => {
        process.chdir(cwd);
        reject(err);
    });

    archive.pipe(output);
    archive.glob('**/*.js');
    archive.finalize();
});

(async () => {
    clean();
    installPackages();
    await createDeploymentPackage();
})();
