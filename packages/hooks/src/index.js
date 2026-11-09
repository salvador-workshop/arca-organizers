"use strict"

const hooksInit = ({ jscad, swcadJs }) => {
    const {
        cylinder,
        cuboid,
        roundedRectangle,
    } = jscad.primitives

    const {
        align,
        translate,
        rotate,
    } = jscad.transforms

    const {
        subtract,
        union,
    } = jscad.booleans

    const {
        extrudeLinear,
    } = jscad.extrusions

    const {
        measureDimensions,
    } = jscad.measurements

    const { TAU } = jscad.maths.constants

    const {
        standards,
        constants,
    } = swcadJs.data

    const {
        position,
        math,
    } = swcadJs.calcs

    const {
        reinforcements,
    } = swcadJs.components


    //==============================================================================


    /**
     * Builds default values and opts for the model
     * @param {*} opts 
     * @returns default values and opts
     * @memberof hooks
     * @access private
     */
    const hooksDefaults = () => {
        /** Specific value declarations */
        const modelTypes = {
            medium: { id: 'medium', desc: 'Medium size hook' },
            large: { id: 'large', desc: 'Large size hook' },
        }

        const defaultValues = {
            dims: {
                rowSpacing: math.inchesToMm(2.5)
            },
            opts: {
                numHooks: 3
            },
            points: {
            },
            types: {
                default: modelTypes.medium,
                ...modelTypes
            },
            constants: {
                screwHoleRadius: 2.5,
                baseplateCornerRadius: 1.5,
                baseplateSizeMedium: [16.2, 51.2],
                hookDepthMedium: 22.2,
                hookWidthMedium: 6.1,
                hookReinforcementWidthMedium: standards.INTERFACE_THICKNESS * 3,
                baseplateSizeLarge: [18.9, 73.8],
                hookDepthLarge: 27.3,
                hookWidthLarge: 11.9,
                hookReinforcementWidthLarge: standards.INTERFACE_THICKNESS * 4,
                straightHookAngle: TAU / 6,
                hookRowConnectorWidth: math.inchesToMm(7 / 8),
                interfaceThickness: standards.INTERFACE_THICKNESS,
                fitGap: standards.FIT_GAP,
            }
        }

        /** Options used by SW models */
        const standardOpts = {
            type: defaultValues.types.default.id,
        }

        /** Computed values for option defaults */
        const defaultOpts = {
            rowSpacing: defaultValues.dims.rowSpacing,
            numHooks: defaultValues.opts.numHooks,
            ...standardOpts,
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
     * @memberof hooks
     * @access private
     */
    const hooksOpts = (opts) => {
        const defaults = hooksDefaults()

        // User options
        const {
            type = defaults.opts.type,
            rowSpacing = defaults.opts.rowSpacing,
            numHooks = defaults.opts.numHooks,
        } = opts

        const initOpts = {
            type,
            rowSpacing,
            numHooks,
        }

        return initOpts
    }


    //------------------------------------------------------------------------------


    /**
     * Builds model properties from the given opts
     * @param {*} opts 
     * @returns model properties
     * @memberof hooks
     * @access private
     */
    const hooksProps = (opts) => {
        const defaults = hooksDefaults()

        const dimConstants = defaults.vals.constants

        const {
            baseplateSizeMedium,
            hookDepthMedium,
            hookWidthMedium,
            baseplateSizeLarge,
            hookDepthLarge,
            hookWidthLarge,
        } = dimConstants

        const {
            type,
            rowSpacing,
            numHooks,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const baseplateSize = type == 'large' ? baseplateSizeLarge : baseplateSizeMedium
        const hookDepth = type == 'large' ? hookDepthLarge : hookDepthMedium
        const hookWidth = type == 'large' ? hookWidthLarge : hookWidthMedium

        const straightHookLength = hookDepth / constants.TRI_30_FACTOR * 2

        const hookRowConnectorLength = rowSpacing - baseplateSize[0] + 1
        const numConnectors = numHooks >= 2 ? numHooks - 1 : 0

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = dimConstants

        /** Derived user options for the model */
        const modelOpts = {
            numHooks,
            numConnectors,
            type,
        }

        /** Various dimensions for model */
        const modelDims = {
            rowSpacing,
            baseplateSize,
            hookDepth,
            hookWidth,
            straightHookLength,
            hookRowConnectorLength,
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


        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * MODELLING FUNCTIONS
    * ------------------------------------- */

    const reinforcementUnitBase = (opts) => {
        const { length, width, baseThickness } = opts
        return cuboid({ size: [length, width, baseThickness] })
    }

    const lightLengthReinforcement = (opts) => {
        const { length, reinfThickness, spineHeight } = opts
        const spine = cuboid({ size: [length, reinfThickness, spineHeight] })
        return spine
    }

    const mediumLengthReinforcement = (opts) => {
        const { length, width, reinfThickness, spineHeight } = opts
        const spine = cuboid({ size: [length, reinfThickness, spineHeight] })

        const spacing = width / 3
        const spines = [
            translate([0, spacing / 2 + (reinfThickness / 2), 0], spine),
            translate([0, spacing / -2 - (reinfThickness / 2), 0], spine),
        ]

        return union(spines)
    }

    const lightReinforcedLengthUnit = (opts) => {
        const { size, baseThickness, reinfThickness } = opts

        // Generate flat base
        const lightReinfUnitBase = reinforcementUnitBase({
            length: size[0],
            width: size[1],
            baseThickness: baseThickness
        })
        // Generate reinforcement
        const lightReinfUnitReinforcement = lightLengthReinforcement({
            length: size[0],
            reinfThickness: reinfThickness,
            spineHeight: size[2],
        })

        // Combine all pieces
        const lightReinfUnitAssembly = union(
            position.ctrMin(lightReinfUnitBase),
            position.ctrMin(lightReinfUnitReinforcement)
        )

        return position.ctr(lightReinfUnitAssembly)
    }
    const mediumReinforcedLengthUnit = (opts) => {
        const { size, baseThickness, reinfThickness } = opts

        // Generate flat base
        const mediumReinfUnitBase = reinforcementUnitBase({
            length: size[0],
            width: size[1],
            baseThickness: baseThickness
        })
        // Generate reinforcement
        const mediumReinfUnitReinforcement = mediumLengthReinforcement({
            length: size[0],
            width: size[1],
            reinfThickness: reinfThickness,
            spineHeight: size[2],
        })

        // Combine all pieces
        const mediumReinfUnitAssembly = union(
            position.ctrMin(mediumReinfUnitBase),
            position.ctrMin(mediumReinfUnitReinforcement)
        )

        return position.ctr(mediumReinfUnitAssembly)
    }

    /**
     * Screw hole cutaways
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof hooks
     */
    const screwCutaways = (opts) => {
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const {
            screwHoleRadius,
            interfaceThickness,
        } = modelProperties.constants

        const {
            baseplateSize,
        } = modelProperties.dims

        const cutawayBase = cylinder({
            radius: screwHoleRadius,
            height: interfaceThickness * 4
        })

        const endOffset = baseplateSize[0] / 2
        const spacing = baseplateSize[1] - (endOffset * 2)

        const cutaways = [
            translate([0, spacing / 2, 0], cutawayBase),
            translate([0, spacing / -2, 0], cutawayBase)
        ]

        const mainModel = cutaways
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Baseplate for mounting a hook
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof hooks
     */
    const hookBaseplate = (opts) => {
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const {
            baseplateCornerRadius,
            interfaceThickness,
        } = modelProperties.constants

        const {
            baseplateSize,
        } = modelProperties.dims

        const baseplateProfile = roundedRectangle({
            size: baseplateSize,
            roundRadius: baseplateCornerRadius
        })

        let baseplateBlank = position.ctrMin(extrudeLinear(
            { height: interfaceThickness },
            baseplateProfile
        ))

        const bpSpineOffset = baseplateSize[0]
        const baseplateSpineLength = baseplateSize[1] - (bpSpineOffset * 2)
        const baseplateSpine = position.ctrMin(cuboid({
            size: [interfaceThickness, baseplateSpineLength, interfaceThickness * 2]
        }))
        baseplateBlank = union(baseplateBlank, baseplateSpine)

        const cutaways = screwCutaways(opts)[0]

        const baseplateAssembly = subtract(baseplateBlank, cutaways)

        const mainModel = baseplateAssembly
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Straight hook component
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof hooks
     */
    const straightHook = (opts) => {
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const {
            type
        } = modelProperties.opts

        const {
            straightHookAngle,
            hookReinforcementWidthMedium,
            hookReinforcementWidthLarge,
            interfaceThickness,
        } = modelProperties.constants

        const {
            hookDepth,
            hookWidth,
            straightHookLength,
        } = modelProperties.dims

        let hookBase = null
        if (type == 'large') {
            hookBase = mediumReinforcedLengthUnit({
                size: [straightHookLength, hookWidth, hookReinforcementWidthLarge],
                baseThickness: interfaceThickness,
                reinfThickness: interfaceThickness,
            })
        } else {
            hookBase = lightReinforcedLengthUnit({
                size: [straightHookLength, hookWidth, hookReinforcementWidthMedium],
                baseThickness: interfaceThickness,
                reinfThickness: interfaceThickness,
            })
        }

        const hookBaseCutOffset = interfaceThickness * -1.555

        let hookAdj = rotate([0, 0, TAU / 4], hookBase)
        hookAdj = rotate([straightHookAngle, 0, 0], hookAdj)
        hookAdj = align({
            modes: position.alignModes.ctrMin,
            relativeTo: [0, 0, hookBaseCutOffset]
        }, hookAdj)

        const baseCutAway = position.ctrMax(cuboid({ size: [hookDepth, hookDepth, hookDepth] }))

        const mainModel = subtract(hookAdj, baseCutAway)
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Utility hook, using a straight hook component
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof hooks
     */
    const utilityHook = (opts) => {
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const baseplate = hookBaseplate(opts)[0]
        const strHook = straightHook(opts)[0]
        const strHookDims = measureDimensions(strHook)

        const strHookAdj = align({
            modes: position.alignModes.ctrMin,
            // relativeTo: [0, 0, 0]
        }, strHook)

        const utilityHookAssembly = union(
            baseplate,
            strHookAdj,
        )

        const mainModel = utilityHookAssembly
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * A row of utility hooks, using a straight hook component. The hooks are connected by open web joists.
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof hooks
     */
    const utilityHookRow = (opts) => {
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const {
            numHooks,
            numConnectors,
        } = modelProperties.opts

        const {
            hookRowConnectorWidth,
        } = modelProperties.constants

        const {
            baseplateSize,
            rowSpacing,
            hookRowConnectorLength
        } = modelProperties.dims

        const connectorOpts = {
            length: hookRowConnectorLength,
            width: hookRowConnectorWidth,
            reinforcementLevel: 1,
        }

        const baseHook = position.ctrMin(utilityHook(opts)[0])
        const baseConnector = position.ctrMin(
            rotate(
                [0, 0, TAU / 4],
                reinforcements.reinforcedJoist(connectorOpts)[0]
            )
        )

        const hookCtrPoints = []
        for (let hooksIdx = 0; hooksIdx < numHooks; hooksIdx++) {
            const currentHookX = rowSpacing * hooksIdx
            hookCtrPoints.push([currentHookX, 0, 0])
        }

        const connectorCtrPoints = []
        const connectorStartPt = baseplateSize[0] / 2 + (hookRowConnectorLength / 2)
        for (let connectorsIdx = 0; connectorsIdx < numConnectors; connectorsIdx++) {
            const currentConnX = rowSpacing * connectorsIdx + connectorStartPt
            connectorCtrPoints.push([currentConnX, 0, 0])
        }

        const hooks = hookCtrPoints.map(hookCtrPt => {
            return translate(hookCtrPt, baseHook)
        })
        const connectors = connectorCtrPoints.map(connectorCtrPt => {
            return translate(connectorCtrPt, baseConnector)
        })

        const utilityHookRowAssembly = union(
            ...hooks,
            ...connectors,
        )

        const mainModel = utilityHookRowAssembly
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * Functions modelling various hook/hanger organizers.
     * @namespace hooks
     */
    return {
        defaults: hooksDefaults,
        props: hooksProps,
        screwCutaways,
        hookBaseplate,
        straightHook,
        utilityHook,
        utilityHookRow,
    }
}

module.exports = {
    init: hooksInit
}
