/**
 * Data model for bacterium that can be passed between simulation and rendering systems.
 * This decouples the simulation logic from rendering concerns.
 */
export class BacteriumData {
    constructor(id, position, angle, longAxis, phenotype, magentaProportion, cyanProportion, similarity, visible) {
        this.id = id;
        this.position = position;  // {x, y, z} plain object
        this.angle = angle;
        this.longAxis = longAxis;
        this.phenotype = phenotype;
        this.magentaProportion = magentaProportion;
        this.cyanProportion = cyanProportion;
        this.similarity = similarity;
        this.visible = visible;
    }
}