import { relations } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
  json,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  bio: text('bio'),
  location: text('location'),
  workInfo: text('work_info'),
  socialMedia: json('social_media').$type<{
    instagram?: string
    twitter?: string
    website?: string
  }>(),
  profileImage: text('profile_image'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const homes = pgTable('homes', {
  id: uuid('id').primaryKey().defaultRandom(),
  hostId: uuid('host_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  amenities: json('amenities').$type<string[]>(),
  maxGuests: integer('max_guests').notNull().default(2),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const homeImages = pgTable('home_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id')
    .references(() => homes.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const availability = pgTable('availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  homeId: uuid('home_id')
    .references(() => homes.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean('is_available').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bookingRequests = pgTable('booking_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  homeId: uuid('home_id')
    .references(() => homes.id, { onDelete: 'cascade' })
    .notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status')
    .$type<'pending' | 'approved' | 'declined' | 'paid' | 'cancelled'>()
    .default('pending'),
  message: text('message'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  responseDeadline: timestamp('response_deadline').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  receiverId: uuid('receiver_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  bookingRequestId: uuid('booking_request_id').references(() => bookingRequests.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  homes: many(homes),
  guestBookings: many(bookingRequests, { relationName: 'guest' }),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'receiver' }),
}))

export const homesRelations = relations(homes, ({ one, many }) => ({
  host: one(users, {
    fields: [homes.hostId],
    references: [users.id],
  }),
  images: many(homeImages),
  availability: many(availability),
  bookingRequests: many(bookingRequests),
}))

export const homeImagesRelations = relations(homeImages, ({ one }) => ({
  home: one(homes, {
    fields: [homeImages.homeId],
    references: [homes.id],
  }),
}))

export const availabilityRelations = relations(availability, ({ one }) => ({
  home: one(homes, {
    fields: [availability.homeId],
    references: [homes.id],
  }),
}))

export const bookingRequestsRelations = relations(bookingRequests, ({ one, many }) => ({
  guest: one(users, {
    fields: [bookingRequests.guestId],
    references: [users.id],
    relationName: 'guest',
  }),
  home: one(homes, {
    fields: [bookingRequests.homeId],
    references: [homes.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
  bookingRequest: one(bookingRequests, {
    fields: [messages.bookingRequestId],
    references: [bookingRequests.id],
  }),
}))