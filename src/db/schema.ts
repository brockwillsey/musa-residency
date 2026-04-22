import { pgTable, text, uuid, timestamp, integer, boolean, json, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  bio: text('bio'),
  location: text('location'),
  workInfo: text('work_info'),
  profilePhotoUrl: text('profile_photo_url'),
  socialMediaLinks: json('social_media_links').$type<Record<string, string>>(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const homes = pgTable('homes', {
  id: uuid('id').defaultRandom().primaryKey(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  maxGuests: integer('max_guests').notNull(),
  amenities: json('amenities').$type<string[]>().default([]),
  photos: json('photos').$type<string[]>().default([]),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const availability = pgTable('availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => homes.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isBlocked: boolean('is_blocked').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  homeId: uuid('home_id').references(() => homes.id).notNull(),
  guestId: uuid('guest_id').references(() => users.id).notNull(),
  hostId: uuid('host_id').references(() => users.id).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'approved', 'declined', 'paid', 'completed', 'cancelled'] }).default('pending').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  message: text('message'),
  hostResponseAt: timestamp('host_response_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  homes: many(homes),
  guestBookings: many(bookings, { relationName: 'guestBookings' }),
  hostBookings: many(bookings, { relationName: 'hostBookings' }),
  messages: many(messages),
}));

export const homesRelations = relations(homes, ({ one, many }) => ({
  host: one(users, { fields: [homes.hostId], references: [users.id] }),
  availability: many(availability),
  bookings: many(bookings),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  home: one(homes, { fields: [availability.homeId], references: [homes.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  home: one(homes, { fields: [bookings.homeId], references: [homes.id] }),
  guest: one(users, { fields: [bookings.guestId], references: [users.id], relationName: 'guestBookings' }),
  host: one(users, { fields: [bookings.hostId], references: [users.id], relationName: 'hostBookings' }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, { fields: [messages.bookingId], references: [bookings.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));