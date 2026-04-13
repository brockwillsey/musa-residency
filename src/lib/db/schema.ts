import { pgTable, text, timestamp, uuid, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  bio: text('bio'),
  location: text('location'),
  workInfo: text('work_info'),
  socialMedia: text('social_media'),
  profileImageUrl: text('profile_image_url'),
  isEmailVerified: boolean('is_email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationTokenExpiry: timestamp('email_verification_token_expiry'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const homes = pgTable('homes', {
  id: uuid('id').primaryKey().defaultRandom(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  maxGuests: integer('max_guests').notNull(),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const homePhotos = pgTable('home_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id').references(() => homes.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  caption: text('caption'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id').references(() => homes.id, { onDelete: 'cascade' }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id').references(() => homes.id).notNull(),
  guestId: uuid('guest_id').references(() => users.id).notNull(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending, approved, declined, cancelled, completed
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  message: text('message'),
  hostResponseAt: timestamp('host_response_at'),
  autoDeclineAt: timestamp('auto_decline_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  hostedHomes: many(homes, { relationName: 'host' }),
  guestBookings: many(bookings, { relationName: 'guest' }),
  hostBookings: many(bookings, { relationName: 'host' }),
  messages: many(messages),
}));

export const homesRelations = relations(homes, ({ one, many }) => ({
  host: one(users, {
    fields: [homes.hostId],
    references: [users.id],
    relationName: 'host',
  }),
  photos: many(homePhotos),
  availability: many(availability),
  bookings: many(bookings),
}));

export const homePhotosRelations = relations(homePhotos, ({ one }) => ({
  home: one(homes, {
    fields: [homePhotos.homeId],
    references: [homes.id],
  }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  home: one(homes, {
    fields: [availability.homeId],
    references: [homes.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  home: one(homes, {
    fields: [bookings.homeId],
    references: [homes.id],
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
    relationName: 'guest',
  }),
  host: one(users, {
    fields: [bookings.hostId],
    references: [users.id],
    relationName: 'host',
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Home = typeof homes.$inferSelect;
export type NewHome = typeof homes.$inferInsert;
export type HomePhoto = typeof homePhotos.$inferSelect;
export type NewHomePhoto = typeof homePhotos.$inferInsert;
export type Availability = typeof availability.$inferSelect;
export type NewAvailability = typeof availability.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;