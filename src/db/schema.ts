import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  password: text("password").notNull(),
  role: text("role").$type<"admin" | "property_owner" | "service_provider" | "customer">().default("customer"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const properties = sqliteTable("properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  propertyType: text("property_type").$type<"residential" | "commercial" | "industrial">().default("residential"),
  size: real("size"), // in square meters
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  description: text("description"),
  status: text("status").$type<"active" | "maintenance" | "inactive">().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").$type<"maintenance" | "repair" | "cleaning" | "landscaping" | "security" | "utilities">().notNull(),
  price: real("price"),
  duration: integer("duration"), // in minutes
  providerId: integer("provider_id").references(() => users.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  customerId: integer("customer_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => users.id),
  scheduledDate: integer("scheduled_date", { mode: "timestamp" }).notNull(),
  status: text("status").$type<"pending" | "confirmed" | "in_progress" | "completed" | "cancelled">().default("pending"),
  notes: text("notes"),
  totalPrice: real("total_price"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  amount: real("amount").notNull(),
  currency: text("currency").default("ZAR"),
  status: text("status").$type<"pending" | "completed" | "failed" | "refunded">().default("pending"),
  paymentMethod: text("payment_method").$type<"card" | "bank_transfer" | "cash" | "eft">(),
  transactionId: text("transaction_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").$type<"booking" | "payment" | "system" | "marketing">().notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON string for additional data
  read: integer("read", { mode: "boolean" }).default(false),
  priority: text("priority").$type<"low" | "medium" | "high" | "urgent">().default("medium"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const conversations = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  type: text("type").$type<"booking" | "general">().default("booking"),
  title: text("title"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const conversation_participants = sqliteTable("conversation_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").$type<"customer" | "provider" | "admin">().notNull(),
  joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
});

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").$type<"text" | "image" | "file" | "system">().default("text"),
  metadata: text("metadata"), // JSON string for additional data
  readAt: integer("read_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  revieweeId: integer("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  comment: text("comment"),
  categories: text("categories"), // JSON array of review categories
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const support_tickets = sqliteTable("support_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  category: text("category").$type<"technical" | "billing" | "service" | "general">().default("general"),
  priority: text("priority").$type<"low" | "medium" | "high" | "urgent">().default("medium"),
  status: text("status").$type<"open" | "in_progress" | "resolved" | "closed">().default("open"),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const ticket_messages = sqliteTable("ticket_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: integer("ticket_id").notNull().references(() => support_tickets.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isInternal: integer("is_internal", { mode: "boolean" }).default(false),
  attachments: text("attachments"), // JSON array of file URLs
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});