import * as composing from "./composing.js";
import * as enriching from "./enriching.js";

export const composingEngine = {
  compose: composing.compose,
  selectTemplate: composing.selectTemplate,
};

export const enrichingEngine = {
  enrich: enriching.enrich,
};
