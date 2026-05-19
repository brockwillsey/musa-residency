export const APP_NAME = "Musa Residency"
export const APP_DESCRIPTION =
  "A curated home exchange platform connecting culturally-minded remote workers with inspiring spaces worldwide."

export const DEFAULT_MIN_STAY_DAYS = 30
export const HOST_RESPONSE_HOURS = 24
export const MAX_PHOTOS_PER_LISTING = 20

export const BOOKING_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  DECLINED: "declined",
  AUTO_DECLINED: "auto_declined",
  PAYMENT_PROCESSING: "payment_processing",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const

export const AMENITIES = [
  "WiFi",
  "Kitchen",
  "Washer",
  "Dryer",
  "Air Conditioning",
  "Heating",
  "Dedicated Workspace",
  "TV",
  "Coffee Maker",
  "Dishwasher",
  "Parking",
  "Elevator",
  "Gym",
  "Pool",
  "Garden",
  "Balcony",
  "Pet Friendly",
] as const

export const CREATIVE_AMENITIES = [
  "Art Studio",
  "Music Room",
  "Photography Studio",
  "Writing Desk",
  "Natural Light",
  "Easel & Supplies",
  "Piano/Keyboard",
  "Sound Proofing",
  "Projector",
  "Library",
  "Darkroom",
  "Kiln",
  "Print Press",
  "Sewing Machine",
  "Recording Equipment",
] as const

export const NON_RESPONSIVENESS_PENALTY_THRESHOLD = 0.7 // 70% response rate