import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  date,
  jsonb,
  primaryKey,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Enums ───────────────────────────────────────────────────

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "approved",
  "declined",
  "auto_declined",
  "payment_processing",
  "confirmed",
  "cancelled",
  "completed",
])

export const userRoleEnum = pgEnum("user_role", ["guest", "host", "both"])

// ─── NextAuth Required Tables ────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").default("guest").notNull(),
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  occupation: varchar("occupation", { length: 255 }),
  company: varchar("company", { length: 255 }),
  socialLinks: jsonb("social_links").$type<{
    instagram?: string
    linkedin?: string
    twitter?: string
    website?: string
  }>(),
  phone: varchar("phone", { length: 50 }),
  responseRate: integer("response_rate").default(100),
  totalHostings: integer("total_hostings").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
)

// ─── Listings ────────────────────────────────────────────────

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hostId: uuid("host_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).notNull(),
    address: text("address"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    pricePerNight: integer("price_per_night").notNull(), // in cents
    minStayDays: integer("min_stay_days").default(30).notNull(),
    maxGuests: integer("max_guests").default(2).notNull(),
    bedrooms: integer("bedrooms").default(1).notNull(),
    bathrooms: integer("bathrooms").default(1).notNull(),
    amenities: jsonb("amenities").$type<string[]>().default([]),
    creativeAmenities: jsonb("creative_amenities").$type<string[]>().default([]),
    houseRules: text("house_rules"),
    wifiSpeed: varchar("wifi_speed", { length: 100 }),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("listings_host_id_idx").on(table.hostId),
    index("listings_city_idx").on(table.city),
    index("listings_country_idx").on(table.country),
    index("listings_published_idx").on(table.isPublished),
  ]
)

// ─── Listing Photos ──────────────────────────────────────────

export const listingPhotos = pgTable(
  "listing_photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: varchar("caption", { length: 255 }),
    order: integer("order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("photos_listing_id_idx").on(table.listingId)]
)

// ─── Availability ────────────────────────────────────────────

export const availability = pgTable(
  "availability",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    startDate: date("start_date", { mode: "date" }).notNull(),
    endDate: date("end_date", { mode: "date" }).notNull(),
    isBlocked: boolean("is_blocked").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [index("availability_listing_id_idx").on(table.listingId)]
)

// ─── Bookings ────────────────────────────────────────────────

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hostId: uuid("host_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").default("pending").notNull(),
    checkIn: date("check_in", { mode: "date" }).notNull(),
    checkOut: date("check_out", { mode: "date" }).notNull(),
    totalPrice: integer("total_price").notNull(), // in cents
    guestCount: integer("guest_count").default(1).notNull(),
    message: text("message"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", {
      length: 255,
    }),
    hostResponseDeadline: timestamp("host_response_deadline", {
      mode: "date",
    }),
    respondedAt: timestamp("responded_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_listing_id_idx").on(table.listingId),
    index("bookings_guest_id_idx").on(table.guestId),
    index("bookings_host_id_idx").on(table.hostId),
    index("bookings_status_idx").on(table.status),
  ]
)

// ─── Messages ────────────────────────────────────────────────

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_booking_id_idx").on(table.bookingId),
    index("messages_sender_id_idx").on(table.senderId),
  ]
)

// ─── Relations ───────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  listings: many(listings),
  bookingsAsGuest: many(bookings, { relationName: "guest" }),
  bookingsAsHost: many(bookings, { relationName: "host" }),
  sentMessages: many(messages),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const listingsRelations = relations(listings, ({ one, many }) => ({
  host: one(users, { fields: [listings.hostId], references: [users.id] }),
  photos: many(listingPhotos),
  availability: many(availability),
  bookings: many(bookings),
}))

export const listingPhotosRelations = relations(listingPhotos, ({ one }) => ({
  listing: one(listings, {
    fields: [listingPhotos.listingId],
    references: [listings.id],
  }),
}))

export const availabilityRelations = relations(availability, ({ one }) => ({
  listing: one(listings, {
    fields: [availability.listingId],
    references: [listings.id],
  }),
}))

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  listing: one(listings, {
    fields: [bookings.listingId],
    references: [listings.id],
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
    relationName: "guest",
  }),
  host: one(users, {
    fields: [bookings.hostId],
    references: [users.id],
    relationName: "host",
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}))