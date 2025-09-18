import type { ProjectionModeId, VisualizationModule } from '../types';
import { attractor } from './attractor';
import { crystal } from './crystal';
import { eventGrowth } from './eventGrowth';
import { fiber } from './fiber';
import { fluidField } from './fluidField';
import { graph } from './graph';
import { homology } from './homology';
import { hyperbolic } from './hyperbolic';
import { marbleFlow } from './marbleFlow';
import { morph } from './morph';
import { neural } from './neural';
import { origami } from './origami';
import { phase } from './phase';
import { quantum } from './quantum';
import { synapticGrowth } from './synapticGrowth';
import { zeta } from './zeta';

export const visualizationModules: Record<ProjectionModeId, VisualizationModule> = {
    attractor,
    crystal,
    eventGrowth,
    fiber,
    fluidField,
    graph,
    homology,
    hyperbolic,
    marbleFlow,
    morph,
    neural,
    origami,
    phase,
    quantum,
    synapticGrowth,
    zeta,
};