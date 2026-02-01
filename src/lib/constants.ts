// ============================================
// ROLE CONSTANTS
// ============================================

export const UserRole = {
  CLIENT: "CLIENT",
  DESIGNER: "DESIGNER",
  ADMIN: "ADMIN",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// ============================================
// TASK STATUS CONSTANTS
// ============================================

export const TaskStatus = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  QA_PENDING: "QA_PENDING",
  QA_FAILED: "QA_FAILED",
  COMPLETED: "COMPLETED",
  COMPLAINT: "COMPLAINT",
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

// ============================================
// ORDER STATUS CONSTANTS
// ============================================

export const OrderStatus = {
  PENDING_INPUT: "PENDING_INPUT",
  PROMPT_BUILDING: "PROMPT_BUILDING",
  GENERATING: "GENERATING",
  PENDING_REVIEW: "PENDING_REVIEW",
  IN_PROGRESS: "IN_PROGRESS",
  QA_REVIEW: "QA_REVIEW",
  REVISION: "REVISION",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];

// ============================================
// ORDER PRIORITY CONSTANTS
// ============================================

export const OrderPriority = {
  NORMAL: "NORMAL",
  EXPRESS: "EXPRESS",
  URGENT: "URGENT",
} as const;

export type OrderPriorityType =
  (typeof OrderPriority)[keyof typeof OrderPriority];

// ============================================
// IMAGE TYPE CONSTANTS
// ============================================

export const ImageType = {
  ORIGINAL: "ORIGINAL",
  AI_PREVIEW: "AI_PREVIEW",
  EDITED: "EDITED",
  FINAL: "FINAL",
} as const;

export type ImageTypeType = (typeof ImageType)[keyof typeof ImageType];

// ============================================
// ORDER SOURCE TYPE CONSTANTS
// ============================================

export const OrderSourceType = {
  UPLOAD: "UPLOAD",
  URL: "URL",
} as const;

export type OrderSourceTypeType =
  (typeof OrderSourceType)[keyof typeof OrderSourceType];

// ============================================
// TASK ASSIGNMENT STATUS CONSTANTS
// ============================================

export const TaskAssignmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  EXPIRED: "EXPIRED",
  REJECTED: "REJECTED",
} as const;

export type TaskAssignmentStatusType =
  (typeof TaskAssignmentStatus)[keyof typeof TaskAssignmentStatus];

// ============================================
// SUBSCRIPTION STATUS CONSTANTS
// ============================================

export const SubscriptionStatus = {
  ACTIVE: "active",
  CANCELED: "canceled",
  PAST_DUE: "past_due",
} as const;

export type SubscriptionStatusType =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

// ============================================
// SUBSCRIPTION PLAN CONSTANTS
// ============================================

export const SubscriptionPlan = {
  BASIC: "BASIC",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type SubscriptionPlanType =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

// ============================================
// STYLE CONSTANTS
// ============================================

export const OrderStyle = {
  CLEAN: "CLEAN",
  INDUSTRIAL: "INDUSTRIAL",
  PREMIUM: "PREMIUM",
  LIFESTYLE: "LIFESTYLE",
  MINIMAL: "MINIMAL",
} as const;

export type OrderStyleType = (typeof OrderStyle)[keyof typeof OrderStyle];

// ============================================
// PLATFORM CONSTANTS
// ============================================

export const OrderPlatform = {
  ALLEGRO: "ALLEGRO",
  AMAZON: "AMAZON",
  INSTAGRAM: "INSTAGRAM",
  FACEBOOK: "FACEBOOK",
  LANDING_PAGE: "LANDING_PAGE",
  UNIVERSAL: "UNIVERSAL",
} as const;

export type OrderPlatformType =
  (typeof OrderPlatform)[keyof typeof OrderPlatform];

// ============================================
// BACKGROUND CONSTANTS
// ============================================

export const OrderBackground = {
  WHITE: "WHITE",
  CONTEXTUAL: "CONTEXTUAL",
  AI_GENERATED: "AI_GENERATED",
  TRANSPARENT: "TRANSPARENT",
} as const;

export type OrderBackgroundType =
  (typeof OrderBackground)[keyof typeof OrderBackground];
