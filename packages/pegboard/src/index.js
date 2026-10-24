"use strict"

const pegboardInit = ({ jscad, swcadJs }) => {
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

    const {
        standards,
    } = swcadJs.data

    const {
        math,
        position,
        geometry,
    } = swcadJs.calcs

    const {
        reinforcedRectPanel,
    } = swcadJs.components


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof pegboard
     * @access private
     */
    const pegboardDefaults = () => {
        /** Specific value declarations */
        const defaultValues = {
            dims: {
                size: [
                    math.inchesToMm(2),
                    math.inchesToMm(4),
                    math.inchesToMm(1),
                ],
                holeDiam: math.inchesToMm(1 / 4),
                holeDist: math.inchesToMm(1),
                connectorWidth: math.inchesToMm(7 / 32),
            },
            points: {
                centrePt: [0, 0, 0]
            },
            types: {
                default: standards.types.TYPE_DEFAULT,
                alt: standards.types.TYPE_ALT,
            },
        }

        /** Options used by SW models */
        const standardOpts = {
            type: defaultValues.types.default.id,
            scale: 1,
            interfaceThickness: standards.INTERFACE_THICKNESS,
            fitGap: standards.FIT_GAP,
        }

        /** Computed values for option defaults */
        const defaultOpts = {
            ...standardOpts,
            size: defaultValues.dims.size,
            holeDiam: defaultValues.dims.holeDiam,
            holeDist: defaultValues.dims.holeDist,
            connectorWidth: defaultValues.dims.connectorWidth,
        }

        return {
            opts: defaultOpts,
            vals: defaultValues,
        }
    }


    //------------------------------------------------------------------------------


    /**
     * Initializes options with user input
     * @param {*} opts 
     * @returns model properties
     * @memberof pegboard
     * @access private
     */
    const pegboardOpts = (opts) => {
        const defaults = pegboardDefaults()
        console.log('pegboardOpts() -- opts', opts)

        // User options
        const {
            size = defaults.opts.size,
            holeDiam = defaults.opts.holeDiam,
            holeDist = defaults.opts.holeDist,
            connectorWidth = defaults.opts.connectorWidth,
            type = defaults.opts.type,
            scale = defaults.opts.scale,
            interfaceThickness = defaults.opts.interfaceThickness,
            fitGap = defaults.opts.fitGap,
        } = opts

        const stdOpts = {
            type,
            scale,
            interfaceThickness,
            fitGap,
        }

        const initOpts = {
            size,
            holeDiam,
            holeDist,
            connectorWidth,
            ...stdOpts,
        }

        console.log('pegboardOpts() -- initOpts', initOpts)

        return initOpts
    }


    //------------------------------------------------------------------------------


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof pegboard
     * @access private
     */
    const pegboardProps = (opts) => {
        const defaults = pegboardDefaults()
        console.log('pegboardProps() -- opts', opts)

        const {
            size,
            holeDiam,
            holeDist,
            connectorWidth,
            type,
            scale,
            interfaceThickness,
            fitGap,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const diagFactor = Math.sqrt(2)

        const width = size[0]
        const depth = size[1]
        const height = size[2]

        const ringDiam = holeDiam * 2.5

        const midPieceLength = connectorWidth
        const crossPieceLengthTotal = holeDist * diagFactor - ringDiam - midPieceLength
        const crossPieceLength = crossPieceLengthTotal / 2 + (interfaceThickness * 2)
        const ringConnectorLength = holeDist - ringDiam + interfaceThickness

        const xEdgeLength = width - (midPieceLength * 2) + interfaceThickness
        const yEdgeLength = depth - (midPieceLength * 2) + interfaceThickness

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = {
        }

        /** Derived user options for the model */
        const modelOpts = {
            type,
            scale,
        }

        /** Various dimensions for model */
        const modelDims = {
            size,
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        }

        /** Various key points for model */
        const modelPoints = {
            centrePt: defaults.vals.points.centrePt,
        }

        /** Components used by model */
        const modelComponents = {
        }

        /* ---------------------------------------------
        *  Model Properties
        * ----------------------------------------------
        * Properties accessible to all model functions.
        * --------------------------------------------- */

        const modelProperties = {
            metadata: {
                id: '9999',
                name: 'New Model',
                project: 'New Project',
                author: 'Somebody Somewhere',
                organization: 'Salvador Workshop',
                client: null,
            },
            constants: modelConstants,
            opts: modelOpts,
            dims: modelDims,
            points: modelPoints,
            components: modelComponents,
        }

        console.log('pegboardProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * MODELLING FUNCTIONS
    * ------------------------------------- */

    const reinforcedUnit = (opts) => {
        const { size, baseThickness, reinfThickness } = opts

        // Generate flat base
        const reinfUnitBase = cuboid({ size: [size[0], size[1], baseThickness] })

        // Generate reinforcement
        const reinfUnitReinforcement = reinforcedRectPanel({
            size,
            reinforcementPattern: 'x',
            reinforcementThickness: [reinfThickness, reinfThickness, reinfThickness]
        })[0]

        // Combine all pieces
        const reinfUnitAssembly = union(
            position.ctrMin(reinfUnitBase),
            position.ctrMin(reinfUnitReinforcement)
        )

        return position.ctr(reinfUnitAssembly)
    }

    const reinforcedEdgeUnit = (opts) => {
        const { size, unitLength, baseThickness, reinfThickness } = opts
        const numUnits = Math.ceil(size[0] / unitLength) + 1

        const reinfEdgeUnitBase = reinforcedUnit({
            size: [unitLength, size[1], size[2]],
            baseThickness,
            reinfThickness,
        })

        // Attach unit base segments until the desired length is reached.
        let reinfEdgePieceAssembly = reinfEdgeUnitBase
        for (let assemblyIdx = 0; assemblyIdx < numUnits; assemblyIdx++) {
            const currentOffset = assemblyIdx * unitLength - reinfThickness
            reinfEdgePieceAssembly = union(
                reinfEdgePieceAssembly,
                translate(
                    [currentOffset, 0, 0],
                    reinfEdgeUnitBase
                )
            )
        }

        const keepBox = cuboid({
            size: [
                size[0],
                size[1] * 1.5,
                size[2] * 1.5,
            ]
        })
        const reinfEdgePiece = intersect(
            position.ctr(reinfEdgePieceAssembly),
            keepBox
        )

        return position.ctr(reinfEdgePiece)
    }

    /**
     * Generates pegboard ring (donut)
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const pegboardRing = (opts) => {
        const defaults = pegboardDefaults()
        const initOpts = pegboardOpts(opts)
        const modelProperties = pegboardProps(initOpts)

        const {
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        // Generate flat circular base
        const ringBase = cylinder({
            height: interfaceThickness,
            radius: ringDiam / 2
        })

        // Generate vertical reinforcements
        const extReinforcementBase = cylinder({
            height,
            radius: ringDiam / 2
        })
        const extReinforcementCutaway = cylinder({
            height: height * 1.5,
            radius: ringDiam / 2 - interfaceThickness
        })
        const extReinforcement = subtract(
            extReinforcementBase,
            extReinforcementCutaway
        )
        const intReinforcement = cylinder({
            height: height,
            radius: holeDiam / 2 + interfaceThickness
        })

        const spokeReinforcementBase = cuboid({ size: [interfaceThickness, ringDiam - interfaceThickness, height] })
        const spokeReinforcements = union(
            spokeReinforcementBase,
            rotate([0, 0, TAU / 8], spokeReinforcementBase),
            rotate([0, 0, TAU / 4], spokeReinforcementBase),
            rotate([0, 0, TAU * .375], spokeReinforcementBase),
        )

        // Combine all pieces and punch through ring assembly
        const ringAssemblyBase = union(
            position.ctrMin(ringBase),
            position.ctrMin(extReinforcement),
            position.ctrMin(intReinforcement),
            position.ctrMin(spokeReinforcements),
        )
        const ringPunch = cylinder({
            height: height * 3,
            radius: holeDiam / 2
        })
        const ringAssembly = subtract(
            ringAssemblyBase,
            ringPunch
        )

        const mainModel = position.ctr(ringAssembly)
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Generates mid piece, for where connecting pieces intersect
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const pegboardMidPiece = (opts) => {
        const defaults = pegboardDefaults()
        const initOpts = pegboardOpts(opts)
        const modelProperties = pegboardProps(initOpts)

        const {
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        const mainModel = reinforcedUnit({
            size: [midPieceLength, midPieceLength, height],
            baseThickness: interfaceThickness,
            reinfThickness: 1.125
        })
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Generates long piece, which connects pegboard rings
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const pegboardLongPiece = (opts) => {
        const defaults = pegboardDefaults()
        const initOpts = pegboardOpts(opts)
        const modelProperties = pegboardProps(initOpts)

        const {
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        const mainModel = reinforcedUnit({
            size: [ringConnectorLength, connectorWidth, height],
            baseThickness: interfaceThickness,
            reinfThickness: 1.125
        })
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Generates cross piece, which connects pegboard rings
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const pegboardCrossPiece = (opts) => {
        const defaults = pegboardDefaults()
        const initOpts = pegboardOpts(opts)
        const modelProperties = pegboardProps(initOpts)

        const {
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        // Generate rectangular sub-sections
        const midPiece = pegboardMidPiece(initOpts)[0]

        const crossArmBase = reinforcedUnit({
            size: [crossPieceLength, connectorWidth, height],
            baseThickness: interfaceThickness,
            reinfThickness: 1.125
        })

        const crossArmBaseAdj = align({
            modes: ['min', 'center', 'center'],
            relativeTo: [midPieceLength / 2 - 1.125, 0, 0]
        }, crossArmBase)

        // Combine all pieces
        const crossPieceAssembly = union(
            midPiece,
            crossArmBaseAdj,
            rotate([0, 0, TAU / 4], crossArmBaseAdj),
            rotate([0, 0, TAU / 2], crossArmBaseAdj),
            rotate([0, 0, TAU * 0.75], crossArmBaseAdj),
        )

        const mainModel = rotate([0, 0, TAU / 8], crossPieceAssembly)
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Generates edges of pegboard
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const pegboardEdges = (opts) => {
        const defaults = pegboardDefaults()
        const initOpts = pegboardOpts(opts)
        const modelProperties = pegboardProps(initOpts)

        const {
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        // Generate sub-sections
        const cornerPieceBase = pegboardMidPiece(initOpts)[0]
        const xEdgeLengthBase = reinforcedEdgeUnit({
            size: [xEdgeLength, connectorWidth, height],
            unitLength: holeDist,
            baseThickness: interfaceThickness,
            reinfThickness: 1.125,
        })
        const yEdgeLengthBase = rotate(
            [0, 0, TAU / 4],
            reinforcedEdgeUnit({
                size: [yEdgeLength, connectorWidth, height],
                unitLength: holeDist,
                baseThickness: interfaceThickness,
                reinfThickness: 1.125,
            })
        )

        const edgePoints = {
            topRight: [width / 2, depth / 2, 0],
            bottomRight: [width / 2, depth / -2, 0],
            topLeft: [width / -2, depth / 2, 0],
            bottomLeft: [width / -2, depth / -2, 0],
            top: [0, depth / 2, 0],
            right: [width / 2, 0, 0],
            bottom: [0, depth / -2, 0],
            left: [width / -2, 0, 0],
        }

        // Combine all pieces
        const edgeAssembly = union(
            align({
                modes: ['max', 'max', 'center'],
                relativeTo: edgePoints.topRight
            }, cornerPieceBase),
            align({
                modes: ['max', 'min', 'center'],
                relativeTo: edgePoints.bottomRight
            }, cornerPieceBase),
            align({
                modes: ['min', 'max', 'center'],
                relativeTo: edgePoints.topLeft
            }, cornerPieceBase),
            align({
                modes: ['min', 'min', 'center'],
                relativeTo: edgePoints.bottomLeft
            }, cornerPieceBase),
            align({
                modes: ['center', 'max', 'center'],
                relativeTo: edgePoints.top
            }, xEdgeLengthBase),
            align({
                modes: ['center', 'min', 'center'],
                relativeTo: edgePoints.bottom
            }, xEdgeLengthBase),
            align({
                modes: ['min', 'center', 'center'],
                relativeTo: edgePoints.left
            }, yEdgeLengthBase),
            align({
                modes: ['max', 'center', 'center'],
                relativeTo: edgePoints.right
            }, yEdgeLengthBase),
        )

        const mainModel = edgeAssembly
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Generates pegboard model
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const pegboard = (opts) => {
        const defaults = pegboardDefaults()
        const initOpts = pegboardOpts(opts)
        const modelProperties = pegboardProps(initOpts)

        const {
            size,
            width,
            depth,
            height,
            holeDiam,
            holeDist,
            connectorWidth,
            ringDiam,
            crossPieceLength,
            midPieceLength,
            ringConnectorLength,
            xEdgeLength,
            yEdgeLength,
            interfaceThickness,
            fitGap,
        } = modelProperties.dims

        // Determine hole points and various connection points
        const connectionPtExt = math.inchesToMm(0.75)
        const crossPointSize = [width + connectionPtExt, depth + connectionPtExt]

        const baseRing = pegboardRing(opts)[0]
        const baseLongPiece = pegboardLongPiece(opts)[0]
        const baseCrossPiece = pegboardCrossPiece(opts)[0]

        const holePts = geometry.getSquarePtsInArea(width - interfaceThickness, depth - interfaceThickness, holeDist)
        const rings = holePts.map((holePt) => {
            const currentPt = [holePt.x, holePt.y, 0]
            return translate(currentPt, baseRing)
        })

        const crossPtsRaw = geometry.getSquarePtsInArea(crossPointSize[0], crossPointSize[1], holeDist)
        const crossPts = crossPtsRaw.map(cPtRaw => [cPtRaw.x, cPtRaw.y, 0])
        const crosses = crossPts.map((crossPt) => {
            return translate(crossPt, baseCrossPiece)
        })

        const longPtsX = crossPtsRaw.map(cPtRaw => [cPtRaw.x, cPtRaw.y + (holeDist / 2), 0])
        const longPiecesX = longPtsX.map((longPtX) => {
            return translate(longPtX, baseLongPiece)
        })
        const longPtsY = crossPtsRaw.map(cPtRaw => [cPtRaw.x + (holeDist / 2), cPtRaw.y, 0])
        const longPiecesY = longPtsY.map((longPtX) => {
            return translate(longPtX, rotate([0, 0, TAU / 4], baseLongPiece))
        })

        const mainAssemblyBase = union(
            ...rings,
            ...crosses,
            longPiecesX,
            longPiecesY,
        )
        const mainAssemblyKeepBox = cuboid({
            size: [
                xEdgeLength,
                yEdgeLength,
                height * 2
            ]
        })
        const mainAssembly = intersect(mainAssemblyBase, mainAssemblyKeepBox)

        const edges = pegboardEdges(opts)[0]

        const mainModel = union(
            mainAssembly,
            edges,
        )

        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return {
        defaults: pegboardDefaults,
        props: pegboardProps,
        pegboardRing,
        pegboardMidPiece,
        pegboardLongPiece,
        pegboardCrossPiece,
        pegboardEdges,
        pegboard,
    }
}

module.exports = {
    init: pegboardInit
}
