import { pgTable, text, timestamp, boolean, integer, decimal, uuid } from 'drizzle-orm/pg-core';
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
  profileImage: text('profile_image'),
  isEmailVerified: boolean('is_email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const homes = pgTable('homes', {
  id: uuid('id').primaryKey().defaultRandom(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  maxGuests: integer('max_guests').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  amenities: text('amenities').array(),
  images: text('images').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id').references(() => homes.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isBooked: boolean('is_booked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id').references(() => homes.id).notNull(),
  guestId: uuid('guest_id').references(() => users.id).notNull(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'approved', 'declined', 'cancelled', 'completed'] }).default('pending'),
  message: text('message'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  receiverId: uuid('receiver_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  homes: many(homes),
  guestBookings: many(bookings, { relationName: 'guestBookings' }),
  hostBookings: many(bookings, { relationName: 'hostBookings' }),
  sentMessages: many(messages, { relationName: 'sentMessages' }),
  receivedMessages: many(messages, { relationName: 'receivedMessages' }),
}));

export const homesRelations = relations(homes, ({ one, many }) => ({
  host: one(users, {
    fields: [homes.hostId],
    references: [users.id],
  }),
  availability: many(availability),
  bookings: many(bookings),
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
    relationName: 'guestBookings',
  }),
  host: one(users, {
    fields: [bookings.hostId],
    references: [users.id],
    relationName: 'hostBookings',
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
    relationName: 'sentMessages',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'receivedMessages',
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Home = typeof homes.$inferSelect;
export type NewHome = typeof homes.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;