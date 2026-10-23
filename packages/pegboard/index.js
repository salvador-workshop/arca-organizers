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

const pegboardModule = require('./src')
const pegboard = pegboardModule.init({ jscad, swcadJs })

const inchesToMm = (numIn) => numIn * 25.4


//==============================================================================


/* ----------------------------------------
 * Test subjects
 * ------------------------------------- */

const pegboardRing = pegboard.pegboardRing({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 4)]
})[0]

const pegboardMidPiece = pegboard.pegboardMidPiece({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 4)]
})[0]

const pegboardLongPiece = pegboard.pegboardLongPiece({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 4)]
})[0]

const pegboardCrossPiece = pegboard.pegboardCrossPiece({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 4)]
})[0]

const pegboardEdges = pegboard.pegboardEdges({
    size: [inchesToMm(4), inchesToMm(4), inchesToMm(1 / 4)]
})[0]



//==============================================================================




/**
 * Main function to be rendered by JSCAD
 * @returns `geom3` or `geom3[]`
 */
function main() {
    const spaceUnit = inchesToMm(3.5)

    return [
        translate([spaceUnit * 0, spaceUnit * 0, spaceUnit * 0], newModel),
    ]
}


module.exports = {
    main,
}
