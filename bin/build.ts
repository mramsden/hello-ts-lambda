#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as ts from 'typescript';

const paths = {
    config: path.join(__dirname, '../tsconfig.json'),
    dist: path.join(__dirname, '../dist'),
};

const reportDiagnostics = (diagnostics: ts.Diagnostic[]): void => {
    diagnostics.forEach(diagnostic => {
        let message = "Error";
        if (diagnostic.file && diagnostic.start) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
        }
        message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
};

const readConfigFile = (configFileName: string) => {
    const configFileText = fs.readFileSync(configFileName).toString();

    const result = ts.parseConfigFileTextToJson(configFileName, configFileText);
    const configObject = result.config;
    if (!configObject) {
        if (result.error) { reportDiagnostics([result.error]); }
        process.exit(1);
    }

    const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        process.exit(1);
    }

    return configParseResult;
}

const clean = (): void => rimraf.sync(paths.dist);

const compile = (configFileName: string): void => {
    let config = readConfigFile(configFileName);

    let program = ts.createProgram(config.fileNames, config.options);
    let emitResult = program.emit();

    reportDiagnostics(ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    process.exit(exitCode);
};

clean();
compile(paths.config);
