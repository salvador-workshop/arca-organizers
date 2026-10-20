const pEnv = process.env

const inputProject = pEnv.npm_config_project ? pEnv.npm_config_project : ""
let detectedProject = null
let errMsg = ''

console.log('----------------------------------------------------------------\n')
console.log('> Preparing to transform models from `src/input/`...')

if (!inputProject) {
    errMsg = '> No project specified!'
    console.error(errMsg)
}

if (detectedProject) {

} else {
    errMsg = '> Project not found!'
    console.error(errMsg)
}

console.log('\n----------------------------------------------------------------\n')
