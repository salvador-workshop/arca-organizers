// Code for testing package

"use strict"

const jscad = require('@jscad/modeling')

const {
    cube,
    cylinder,
    sphere,
    cylinderElliptic,
    circle,
    cuboid,
    roundedCuboid,
    roundedCylinder,
    roundedRectangle,
    rectangle,
    triangle,
} = jscad.primitives

const {
    align,
    translate,
    rotate,
    mirror
} = jscad.transforms

const {
    intersect,
    subtract,
    union,
    scission
} = jscad.booleans

const {
    extrudeLinear,
    extrudeRotate,
    project
} = jscad.extrusions

const {
    measureDimensions,
    measureBoundingBox,
    measureVolume
} = jscad.measurements

const {
    hull,
    hullChain
} = jscad.hulls

const { vectorText } = jscad.text
const { toOutlines } = jscad.geometries.geom2
const { TAU } = jscad.maths.constants
const { colorize } = jscad.colors

const swcadJs = require('swcad-js').init({ jscad });

const hooksModule = require('./src/index.js')
const hooks = hooksModule.init({ jscad, swcadJs })

const inchesToMm = (numIn) => numIn * 25.4


//==============================================================================


/* ----------------------------------------
 * Test subjects
 * ------------------------------------- */

const hookBaseplateMd = hooks.hookBaseplate({})[0]
const screwCutawaysMd = hooks.screwCutaways({})[0]
const straightHookMd = hooks.straightHook({})[0]
const utilityHookMd = hooks.utilityHook({})[0]

const medModels = [
    hookBaseplateMd,
    screwCutawaysMd,
    straightHookMd,
    utilityHookMd,
]

const hookBaseplateLg = hooks.hookBaseplate({type: 'large'})[0]
const screwCutawaysLg = hooks.screwCutaways({type: 'large'})[0]
const straightHookLg = hooks.straightHook({type: 'large'})[0]
const utilityHookLg = hooks.utilityHook({type: 'large'})[0]

const lgModels = [
    hookBaseplateLg,
    screwCutawaysLg,
    straightHookLg,
    utilityHookLg,
]


//==============================================================================



const spaceUnit = inchesToMm(1.5)

/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main() {
    const outModelsMd = medModels.map((oModelMd, idx) => {
        return translate([idx * spaceUnit, 0, 0], oModelMd)
    })
    const outModelsLg = lgModels.map((oModelLg, idx) => {
        return translate([idx * spaceUnit, spaceUnit * 2, 0], oModelLg)
    })

    return [
        ...outModelsMd,
        ...outModelsLg,
    ]
}


module.exports = {
    main,
}
