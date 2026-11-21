// The five levels in order. Each scene module owns its own metadata,
// its differences and its drawing; this file only collects them so the
// engine and the screens can walk the list in one place.
import { meta as harbourMeta, differences as harbourDiffs, drawScene as drawHarbour } from './scenes/harbour.js';
import { meta as forestMeta, differences as forestDiffs, drawScene as drawForest } from './scenes/forest.js';
import { meta as marketMeta, differences as marketDiffs, drawScene as drawMarket } from './scenes/market.js';
import { meta as cabinMeta, differences as cabinDiffs, drawScene as drawCabin } from './scenes/cabin.js';
import { meta as observatoryMeta, differences as observatoryDiffs, drawScene as drawObservatory } from './scenes/observatory.js';

export const levels = [
  { ...harbourMeta, differences: harbourDiffs, draw: drawHarbour },
  { ...forestMeta, differences: forestDiffs, draw: drawForest },
  { ...marketMeta, differences: marketDiffs, draw: drawMarket },
  { ...cabinMeta, differences: cabinDiffs, draw: drawCabin },
  { ...observatoryMeta, differences: observatoryDiffs, draw: drawObservatory },
];

export function levelById(id) {
  return levels.find((l) => l.id === id) || null;
}
