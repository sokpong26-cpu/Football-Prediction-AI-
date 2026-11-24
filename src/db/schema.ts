import { relations } from 'drizzle-orm';
import {
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  phone: text('phone').notNull().default(''),
  bettingPlatform: text('betting_platform').notNull().default('sokrizybet'),
  bettingAccountId: text('betting_account_id').notNull().default(''),
  bio: text('bio').notNull().default(''),
  role: text('role').notNull().default('user'),
  vipTier: text('vip_tier').notNull().default('free'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gameServices = pgTable('game_services', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  nameKh: text('name_kh').notNull(),
  category: text('category').notNull().default('vip_signal'),
  priceUsd: doublePrecision('price_usd').notNull(),
  priceKhr: integer('price_khr').notNull(),
  durationDays: integer('duration_days').notNull().default(7),
  accuracyRate: text('accuracy_rate').notNull().default('99.99%'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  serviceId: integer('service_id').references(() => gameServices.id),
  serviceName: text('service_name').notNull(),
  customerName: text('customer_name').notNull(),
  amountUsd: doublePrecision('amount_usd').notNull(),
  amountKhr: integer('amount_khr').notNull(),
  paymentMethod: text('payment_method').notNull().default('khqr'),
  status: text('status').notNull().default('completed'),
  activationKey: text('activation_key').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const photoScans = pgTable('photo_scans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  ownerUid: text('owner_uid').notNull(),
  platform: text('platform').notNull(),
  activeRow: integer('active_row').notNull(),
  recommendedColumn: integer('recommended_column').notNull(),
  overallConfidence: doublePrecision('overall_confidence').notNull(),
  summaryTitle: text('summary_title').notNull(),
  answerExplanation: text('answer_explanation').notNull(),
  rowSignalsJson: text('row_signals_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const footballPredictions = pgTable('football_predictions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  ownerUid: text('owner_uid').notNull(),
  league: text('league').notNull().default('International'),
  homeTeam: text('home_team').notNull(),
  awayTeam: text('away_team').notNull(),
  winningTeamPick: text('winning_team_pick').notNull(),
  handicapPick: text('handicap_pick').notNull(),
  overUnderPick: text('over_under_pick').notNull(),
  correctScorePick: text('correct_score_pick').notNull(),
  confidence: doublePrecision('confidence').notNull().default(99.99),
  workingAnalysis: text('working_analysis').notNull().default(''),
  marketsJson: text('markets_json').notNull().default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  photoScans: many(photoScans),
  footballPredictions: many(footballPredictions),
}));

export const gameServicesRelations = relations(gameServices, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  service: one(gameServices, {
    fields: [orders.serviceId],
    references: [gameServices.id],
  }),
}));

export const photoScansRelations = relations(photoScans, ({ one }) => ({
  author: one(users, {
    fields: [photoScans.userId],
    references: [users.id],
  }),
}));

export const footballPredictionsRelations = relations(footballPredictions, ({ one }) => ({
  author: one(users, {
    fields: [footballPredictions.userId],
    references: [users.id],
  }),
}));
