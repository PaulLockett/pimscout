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
  retrieve: message.retrieveMessages,
};

export const deliveryAccess = {
  send: delivery.send,
  track: delivery.track,
  verifyDelivery: delivery.verifyDelivery,
};

export const enrichmentAccess = {
  lookup: enrichment.lookup,
  verify: enrichment.verify,
  supplement: enrichment.supplement,
};
