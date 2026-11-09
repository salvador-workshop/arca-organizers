"use strict"

const hooksInit = ({ jscad, swcadJs }) => {
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
                baseplateSizeLarge: [18.9, 73.8],
                hookDepthLarge: 27.3,
                hookWidthLarge: 11.9,
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
        console.log('hooksOpts() -- opts', opts)

        // User options
        const {
            type = defaults.opts.type,
        } = opts

        const initOpts = {
            type,
        }

        console.log('hooksOpts() -- initOpts', initOpts)

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
        console.log('hooksProps() -- opts', opts)

        const dimConstants = defaults.vals.constants

        const {
            screwHoleRadius,
            baseplateCornerRadius,
            baseplateSizeMedium,
            hookDepthMedium,
            hookWidthMedium,
            baseplateSizeLarge,
            hookDepthLarge,
            hookWidthLarge,
            interfaceThickness,
            fitGap,
        } = dimConstants

        const {
            type,
        } = opts

        /* ----------------------------------------
        * Prop calculations
        * ------------------------------------- */

        const baseplateSize = type == 'large' ? baseplateSizeLarge : baseplateSizeMedium
        const hookDepth = type == 'large' ? hookDepthLarge : hookDepthMedium
        const hookWidth = type == 'large' ? hookWidthLarge : hookWidthMedium

        /* ----------------------------------------
        * Preparing Model Properties, Dimensions
        * ------------------------------------- */

        /** Constant values for model */
        const modelConstants = dimConstants

        /** Derived user options for the model */
        const modelOpts = {
            type,
            scale,
        }

        /** Various dimensions for model */
        const modelDims = {
            screwHoleRadius,
            baseplateCornerRadius,
            baseplateSize,
            hookDepth,
            hookWidth,
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

        console.log('hooksProps() -- modelProperties', modelProperties)

        return modelProperties
    }


    //------------------------------------------------------------------------------

    /* ----------------------------------------
    * MODELLING FUNCTIONS
    * ------------------------------------- */

    /**
     * New Model 1
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const hookBaseplate = (opts) => {
        const defaults = hooksDefaults()
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const mainModel = cuboid()
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * New Model 2
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const screwCutaways = (opts) => {
        const defaults = hooksDefaults()
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const mainModel = cuboid()
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * ...
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const straightHook = (opts) => {
        const defaults = hooksDefaults()
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const mainModel = cuboid()
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    /**
     * ...
     * @param {*} opts 
     * @returns Array with model, parts, and properties: [`geom3`, `Object.<string, geom3>`, `Object.<string, any>`]
     * @memberof newModelParent
     */
    const utilityHook = (opts) => {
        const defaults = hooksDefaults()
        const initOpts = hooksOpts(opts)
        const modelProperties = hooksProps(initOpts)

        const mainModel = cuboid()
        const modelParts = {
            mainModel,
        }

        return [mainModel, modelParts, modelProperties]
    }

    return {
        defaults: hooksDefaults,
        props: hooksProps,
        hookBaseplate,
        screwCutaways,
        straightHook,
        utilityHook,
    }
}

module.exports = {
    init: hooksInit
}
