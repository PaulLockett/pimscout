import * as founder from "./founder.js";
import * as message from "./message.js";
import * as delivery from "./delivery.js";
import * as enrichment from "./enrichment.js";

export const founderAccess = {
  qualify: founder.qualify,
  engage: founder.engage,
  advance: founder.advance,
  archive: founder.archive,
  retrieve: founder.retrieve,
};

export const messageAccess = {
  draft: message.draft,
  approve: message.approve,
  dispatch: message.dispatch,
  retrieveMessages: message.retrieveMessages,
};

export const deliveryAccess = {
  dispatch: delivery.dispatch,
  track: delivery.track,
};

export const enrichmentAccess = {
  lookup: enrichment.lookup,
  verify: enrichment.verify,
  supplement: enrichment.supplement,
};

export type { QualifyInput, QualifyResult, EngageInput, AdvanceInput, RetrieveResult } from "./founder.js";
export type { DraftInput, RetrieveMessagesOptions, HydratedMessage } from "./message.js";
export type { DispatchInput, DispatchResult, TrackResult } from "./delivery.js";
