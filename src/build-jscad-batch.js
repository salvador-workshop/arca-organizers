// const { exec } = require("child_process");
// const fs = require('node:fs');

import { exec } from "child_process";
import {
    readFileSync,
    lstatSync,
    readdirSync,
    existsSync,
    mkdirSync,
} from 'node:fs';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, '../arca.config.json')
const inputDir = join(__dirname, '../input')
const outputDir = join(__dirname, '../output')

const arcaConfigJsonContent = readFileSync(configPath);
const arcaConfigJsonData = JSON.parse(arcaConfigJsonContent);
console.log(arcaConfigJsonContent);
console.log(arcaConfigJsonData);
console.log(typeof arcaConfigJsonData);

let detectedProject = false
let detectedBuildConfigs = false
let errMsg = ''

console.log('----------------------------------------------------------------\n')
console.log('> Preparing to run JSCAD with files from `src/input/`...')

const isDirectory = fileName => {
    return lstatSync(fileName).isDirectory();
};
const directoryListLong = readdirSync(inputDir)
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

let bProjects = []
let bArgs = []
let configHasProjects = false
let configHasBuildArgs = false

if (Object.hasOwn(arcaConfigJsonData, 'buildProjects')
    && Array.isArray(arcaConfigJsonData.buildProjects)
    && arcaConfigJsonData.buildProjects.length > 0) {
    configHasProjects = true
    bProjects = arcaConfigJsonData.buildProjects
}

if (Object.hasOwn(arcaConfigJsonData, 'buildArgs')
    && Array.isArray(arcaConfigJsonData.buildArgs)
    && arcaConfigJsonData.buildArgs.length > 0) {
    configHasBuildArgs = true
    bArgs = arcaConfigJsonData.buildArgs
}

if (configHasProjects && configHasBuildArgs) {
    detectedBuildConfigs = true
}

let buildQueueProjects = []
if (directoryList.some(r => bProjects.includes(r))) {
    detectedProject = true
    buildQueueProjects = directoryList.filter(value => bProjects.includes(value));
}

if (detectedProject && detectedBuildConfigs) {
    buildQueueProjects.forEach(bProject => {
        console.log(`Building ${bProject}...`);
        bArgs.forEach((bArgOpt, idx) => {
            console.log('bArgOpt', bArgOpt);
            const displayIdx = idx + 1
            const projOutputDir = join(outputDir, bProject)

            const generateCmdLineParams = (argObj) => {
                let cmdLineParamString = ''
                for (const [paramKey, paramVal] of Object.entries(argObj)) {
                    cmdLineParamString += `--${paramKey} "${paramVal}" `;
                }
                return cmdLineParamString
            }
            const cmdLineParams = generateCmdLineParams(bArgOpt)
            const cmdString = `npx jscad input/${bProject}/ ${cmdLineParams} -o output/${bProject}/${bProject}-${displayIdx}.stl`

            // create output folder
            try {
                if (!existsSync(projOutputDir)) {
                    mkdirSync(projOutputDir);
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
        })
    })
} else {
    errMsg = '> Project or build configuration not found!'
    console.error(errMsg)
}

console.log('\n----------------------------------------------------------------\n')
