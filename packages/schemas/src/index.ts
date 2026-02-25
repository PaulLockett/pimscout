// ─── Enums ──────────────────────────────────────────────────────────────────

export const RelationshipStage = {
  INTAKE: "intake",
  ACTIVE_BOARDY_ONBOARDING: "active-boardy-onboarding",
  ACTIVE_NURTURE: "active-nurture",
  WARM: "warm",
  DORMANT: "dormant",
  CONVERTED: "converted",
  ARCHIVED: "archived",
} as const;
export type RelationshipStage =
  (typeof RelationshipStage)[keyof typeof RelationshipStage];

export const BoardyStatus = {
  NOT_REFERRED: "not-referred",
  REFERRED: "referred",
  ONBOARDING_IN_PROGRESS: "onboarding-in-progress",
  ONBOARDED: "onboarded",
  DECLINED: "declined",
} as const;
export type BoardyStatus = (typeof BoardyStatus)[keyof typeof BoardyStatus];

export const MessageType = {
  BOARDY_INTRO: "boardy-intro",
  ONBOARDING_NUDGE: "onboarding-nudge",
  RELATIONSHIP_BUILDING: "relationship-building",
  FOLLOW_UP: "follow-up",
  CHECK_IN: "check-in",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageStatus = {
  DRAFTED: "drafted",
  QUEUED_FOR_REVIEW: "queued-for-review",
  APPROVED: "approved",
  SENT: "sent",
  BOUNCED: "bounced",
} as const;
export type MessageStatus =
  (typeof MessageStatus)[keyof typeof MessageStatus];

export const PersonalizationLevel = {
  TEMPLATE: "template",
  LIGHT_AI: "light-ai",
  FULL_AI: "full-ai",
} as const;
export type PersonalizationLevel =
  (typeof PersonalizationLevel)[keyof typeof PersonalizationLevel];

export const ConversionPath = {
  BOARDY_REFERRAL: "boardy-referral",
  CONSULTING: "consulting",
  NURTURE: "nurture",
  NETWORK: "network",
} as const;
export type ConversionPath =
  (typeof ConversionPath)[keyof typeof ConversionPath];

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface Founder {
  id: string;
  name: string;
  email: string;
  companyName: string;
  stage?: string;
  raiseAmount?: string;
  sector?: string;
  oneLiner?: string;
  deckLink?: string;
  source: string;
  referringPartner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
  scoutId: string;
  founderId: string;
  stage: RelationshipStage;
  activePaths: ConversionPath[];
  boardyStatus: BoardyStatus;
  cadencePosition: number;
  nextTouchpoint?: Date;
  lastInteractionAt?: Date;
  lastInteractionChannel?: string;
  lastInteractionSummary?: string;
  interactionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  relationshipId: string;
  type: MessageType;
  status: MessageStatus;
  personalizationLevel: PersonalizationLevel;
  subject: string;
  body: string;
  recipients: string[];
  cc: string[];
  generationContext?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scout {
  id: string;
  name: string;
  email: string;
  voicePreferences?: Record<string, unknown>;
  defaultCadence?: number[];
  conversionPathPriorities?: ConversionPath[];
  connectedEmailAccount?: string;
  createdAt: Date;
  updatedAt: Date;
}
