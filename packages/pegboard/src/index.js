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
                connectorWidth: math.inchesToMm(1 / 4),
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

        const ringDiam = holeDiam * 3

        const crossPieceLength = holeDist * diagFactor - ringDiam + interfaceThickness
        const midPieceLength = connectorWidth
        const ringConnectorLength = holeDist - ringDiam + interfaceThickness

        const xEdgeLength = width - (midPieceLength * 2)
        const yEdgeLength = depth - (midPieceLength * 2)

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
            radius: ringDiam
        })

        // Generate vertical reinforcements
        const extReinforcementBase = cylinder({
            height: interfaceThickness,
            radius: ringDiam
        })
        const extReinforcementCutaway = cylinder({
            height: interfaceThickness,
            radius: ringDiam
        })
        const extReinforcement = subtract(
            extReinforcementBase,
            extReinforcementCutaway
        )
        const intReinforcement = cylinder({
            height: interfaceThickness,
            radius: ringDiam
        })

        const spokeReinforcementBase = cuboid({ size: [interfaceThickness, ringDiam, height] })
        const spokeReinforcements = union(
            spokeReinforcementBase,
            rotate([0, 0, TAU / 4], spokeReinforcementBase),
            rotate([0, 0, TAU / 2], spokeReinforcementBase),
            rotate([0, 0, TAU * 0.75], spokeReinforcementBase),
        )

        // Combine all pieces and punch through ring assembly
        const ringAssemblyBase = union(
            ringBase,
            extReinforcement,
            intReinforcement,
            spokeReinforcements,
        )
        const ringPunch = cylinder({
            height: interfaceThickness,
            radius: ringDiam
        })
        const ringAssembly = subtract(
            ringAssemblyBase,
            ringPunch
        )

        const mainModel = ringAssembly
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

        // Generate flat base
        const midPieceBase = cuboid({ size: [midPieceLength, midPieceLength, interfaceThickness] })

        // Generate reinforcement
        const midPieceReinforcement = reinforcedRectPanel({
            size: [midPieceLength, midPieceLength, height],
            reinforcementPattern: 'x'
        })[0]

        // Combine all pieces
        const midPieceAssembly = union(midPieceBase, midPieceReinforcement)

        const mainModel = midPieceAssembly
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

        // Generate flat base
        const longPieceBase = cuboid({ size: [ringConnectorLength, connectorWidth, interfaceThickness] })

        // Generate reinforcements
        const longPieceReinforcement = reinforcedRectPanel({
            size: [ringConnectorLength, connectorWidth, interfaceThickness],
            reinforcementPattern: 'x'
        })[0]

        // Combine all pieces
        const longPieceAssembly = union(longPieceBase, longPieceReinforcement)

        const mainModel = longPieceAssembly
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
        const crossArmBase = translate(
            [midPieceLength / 2, 0, 0],
            pegboardLongPiece(initOpts)[0]
        )

        // Combine all pieces
        const crossPieceAssembly = union(
            midPiece,
            crossArmBase,
            rotate([0, 0, TAU / 4], crossArmBase),
            rotate([0, 0, TAU / 2], crossArmBase),
            rotate([0, 0, TAU * 0.75], crossArmBase),
        )

        const mainModel = crossPieceAssembly
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
        const xEdgeLengthBase = pegboardLongPiece(initOpts)[0]
        const yEdgeLengthBase = pegboardLongPiece(initOpts)[0]

        // Combine all pieces
        const edgeAssembly = union(
            cornerPieceBase,
            translate([width, 0, 0], cornerPieceBase),
            translate([0, depth, 0], cornerPieceBase),
            translate([width, depth, 0], cornerPieceBase),
            xEdgeLengthBase,
            translate([0, depth, 0], xEdgeLengthBase),
            yEdgeLengthBase,
            translate([width, 0, 0], yEdgeLengthBase),
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

        const mainModel = cuboid()
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
