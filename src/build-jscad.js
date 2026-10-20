// const { exec } = require("child_process");
// const fs = require('node:fs');

import { exec } from "child_process";
import fs from 'node:fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const pEnv = process.env

const inputProject = pEnv.npm_config_project ? pEnv.npm_config_project : ""
let detectedProject = false
let errMsg = ''

console.log('----------------------------------------------------------------\n')
console.log('> Preparing to run JSCAD with files from `src/input/`...')

let projId = null
if (!inputProject) {
    errMsg = '> No project specified!'
    console.error(errMsg)
} else {
    projId = inputProject
}

const isDirectory = fileName => {
    return fs.lstatSync(fileName).isDirectory();
};
const inputDir = join(__dirname, '../input')
const directoryListLong = fs.readdirSync(inputDir)
    .map(fileName => {
        return join(inputDir, fileName);
    })
    .filter(isDirectory);
const directoryList = directoryListLong.map(longDir => {
    const displayDir = relative(inputDir, longDir)
    return displayDir
})
console.log(directoryListLong)
console.log(directoryList)

if (directoryList.includes(projId)) {
    detectedProject = true
}

if (detectedProject) {
    const outputDir = join(__dirname, '../output')
    const projOutputDir = join(outputDir, projId)
    // const cmdString = `npx jscad src/input/${projId}/ -o output/${projId}/${projId}.stl`
    const cmdString = `npx jscad input/${projId}/ -gp -o output/`

    // create output folder
    try {
        if (!fs.existsSync(projOutputDir)) {
            fs.mkdirSync(projOutputDir);
        }
    } catch (err) {
        console.error(err);
    }

    // run JSCAD
    exec(cmdString, (err, stdout, stderr) => {
        if (err) {
            console.error();
            console.error("Error:");
            console.error(err);
            console.error();
        }
        console.log(stdout);
        console.error(stderr);
    });
} else {
    errMsg = '> Project not found!'
    console.error(errMsg)
}

console.log('\n----------------------------------------------------------------\n')
