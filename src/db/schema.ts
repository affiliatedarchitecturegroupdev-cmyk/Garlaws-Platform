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

// Financial Reconciliation System Tables

export const bank_accounts = sqliteTable("bank_accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").$type<"checking" | "savings" | "business">().default("checking"),
  currency: text("currency").default("ZAR"),
  openingBalance: real("opening_balance").default(0),
  currentBalance: real("current_balance").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bank_transactions = sqliteTable("bank_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bankAccountId: integer("bank_account_id").notNull().references(() => bank_accounts.id),
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  transactionType: text("transaction_type").$type<"debit" | "credit">().notNull(),
  reference: text("reference"),
  category: text("category").$type<"income" | "expense" | "transfer" | "fee" | "other">().default("other"),
  reconciled: integer("reconciled", { mode: "boolean" }).default(false),
  reconciliationId: integer("reconciliation_id").references(() => reconciliations.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reconciliations = sqliteTable("reconciliations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bankAccountId: integer("bank_account_id").notNull().references(() => bank_accounts.id),
  reconciliationDate: integer("reconciliation_date", { mode: "timestamp" }).notNull(),
  openingBalance: real("opening_balance").notNull(),
  closingBalance: real("closing_balance").notNull(),
  reconciledAmount: real("reconciled_amount").default(0),
  status: text("status").$type<"in_progress" | "completed" | "cancelled">().default("in_progress"),
  notes: text("notes"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reconciliation_items = sqliteTable("reconciliation_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reconciliationId: integer("reconciliation_id").notNull().references(() => reconciliations.id),
  bankTransactionId: integer("bank_transaction_id").references(() => bank_transactions.id),
  systemTransactionId: integer("system_transaction_id").references(() => payments.id),
  amount: real("amount").notNull(),
  matchType: text("match_type").$type<"exact" | "partial" | "manual">().default("exact"),
  reconciled: integer("reconciled", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").references(() => bookings.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  issuerId: integer("issuer_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  issueDate: integer("issue_date", { mode: "timestamp" }).notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  subtotal: real("subtotal").notNull(),
  taxAmount: real("tax_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").default("ZAR"),
  status: text("status").$type<"draft" | "sent" | "paid" | "overdue" | "cancelled">().default("draft"),
  notes: text("notes"),
  paymentTerms: text("payment_terms"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const invoice_items = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  description: text("description").notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  taxRate: real("tax_rate").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const invoice_payments = sqliteTable("invoice_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  paymentId: integer("payment_id").references(() => payments.id),
  amount: real("amount").notNull(),
  paymentDate: integer("payment_date", { mode: "timestamp" }).notNull(),
  paymentMethod: text("payment_method").$type<"card" | "bank_transfer" | "cash" | "eft">(),
  transactionId: text("transaction_id"),
  reconciled: integer("reconciled", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => expense_categories.id),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").default("ZAR"),
  expenseDate: integer("expense_date", { mode: "timestamp" }).notNull(),
  paymentMethod: text("payment_method").$type<"card" | "bank_transfer" | "cash" | "eft">(),
  receiptUrl: text("receipt_url"),
  isReimbursable: integer("is_reimbursable", { mode: "boolean" }).default(false),
  reimbursed: integer("reimbursed", { mode: "boolean" }).default(false),
  tags: text("tags"), // JSON array of tags
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const expense_categories = sqliteTable("expense_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const financial_audit_logs = sqliteTable("financial_audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").$type<"create" | "update" | "delete" | "reconcile" | "approve" | "reject">().notNull(),
  entityType: text("entity_type").$type<"bank_account" | "transaction" | "reconciliation" | "invoice" | "expense" | "payment">().notNull(),
  entityId: integer("entity_id").notNull(),
  oldValues: text("old_values"), // JSON string of old values
  newValues: text("new_values"), // JSON string of new values
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Supply Chain & Logistics Management Tables

export const suppliers = sqliteTable("suppliers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("South Africa"),
  taxId: text("tax_id"),
  paymentTerms: text("payment_terms").$type<"net_15" | "net_30" | "net_60" | "cod">().default("net_30"),
  rating: real("rating"), // 1-5 stars
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  categories: text("categories"), // JSON array of supplier categories
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const warehouses = sqliteTable("warehouses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  country: text("country").default("South Africa"),
  capacity: integer("capacity"), // in square meters
  type: text("type").$type<"central" | "regional" | "local" | "mobile">().default("local"),
  managerId: integer("manager_id").references(() => users.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  coordinates: text("coordinates"), // JSON {lat, lng}
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const inventory_items = sqliteTable("inventory_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").$type<"materials" | "equipment" | "consumables" | "spare_parts">().notNull(),
  subcategory: text("subcategory"),
  unit: text("unit").$type<"piece" | "kg" | "liter" | "meter" | "box" | "roll">().default("piece"),
  unitCost: real("unit_cost").notNull(),
  sellingPrice: real("selling_price"),
  reorderPoint: integer("reorder_point").default(10),
  maxStock: integer("max_stock"),
  currentStock: integer("current_stock").default(0),
  reservedStock: integer("reserved_stock").default(0),
  availableStock: integer("available_stock").default(0),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  location: text("location"), // Shelf/bin location
  barcode: text("barcode"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  tags: text("tags"), // JSON array of tags
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const procurement_orders = sqliteTable("procurement_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  status: text("status").$type<"draft" | "pending_approval" | "approved" | "ordered" | "partially_received" | "received" | "cancelled">().default("draft"),
  orderDate: integer("order_date", { mode: "timestamp" }).notNull(),
  expectedDeliveryDate: integer("expected_delivery_date", { mode: "timestamp" }),
  actualDeliveryDate: integer("actual_delivery_date", { mode: "timestamp" }),
  totalAmount: real("total_amount").notNull(),
  currency: text("currency").default("ZAR"),
  paymentStatus: text("payment_status").$type<"unpaid" | "partial" | "paid">().default("unpaid"),
  notes: text("notes"),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const purchase_order_items = sqliteTable("purchase_order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  procurementOrderId: integer("procurement_order_id").notNull().references(() => procurement_orders.id),
  inventoryItemId: integer("inventory_item_id").references(() => inventory_items.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  status: text("status").$type<"pending" | "partially_received" | "received">().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const shipments = sqliteTable("shipments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shipmentNumber: text("shipment_number").notNull().unique(),
  procurementOrderId: integer("procurement_order_id").references(() => procurement_orders.id),
  carrier: text("carrier").notNull(),
  trackingNumber: text("tracking_number"),
  status: text("status").$type<"preparing" | "shipped" | "in_transit" | "delivered" | "delayed" | "lost">().default("preparing"),
  originWarehouseId: integer("origin_warehouse_id").references(() => warehouses.id),
  destinationWarehouseId: integer("destination_warehouse_id").references(() => warehouses.id),
  estimatedDeliveryDate: integer("estimated_delivery_date", { mode: "timestamp" }),
  actualDeliveryDate: integer("actual_delivery_date", { mode: "timestamp" }),
  weight: real("weight"), // in kg
  dimensions: text("dimensions"), // JSON {length, width, height}
  cost: real("cost"),
  currency: text("currency").default("ZAR"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const inventory_movements = sqliteTable("inventory_movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  inventoryItemId: integer("inventory_item_id").notNull().references(() => inventory_items.id),
  movementType: text("movement_type").$type<"inbound" | "outbound" | "transfer" | "adjustment" | "return">().notNull(),
  quantity: integer("quantity").notNull(),
  fromWarehouseId: integer("from_warehouse_id").references(() => warehouses.id),
  toWarehouseId: integer("to_warehouse_id").references(() => warehouses.id),
  referenceId: integer("reference_id"), // Could be order ID, shipment ID, etc.
  referenceType: text("reference_type").$type<"procurement_order" | "sales_order" | "shipment" | "manual">(),
  reason: text("reason"),
  performedBy: integer("performed_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const supplier_performance = sqliteTable("supplier_performance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  period: text("period").notNull(), // YYYY-MM or YYYY-Q1
  onTimeDelivery: real("on_time_delivery"), // percentage
  qualityRating: real("quality_rating"), // 1-5
  responsiveness: real("responsiveness"), // 1-5
  totalOrders: integer("total_orders"),
  totalValue: real("total_value"),
  currency: text("currency").default("ZAR"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Business Intelligence & Analytics Platform Tables

export const dashboards = sqliteTable("dashboards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  layout: text("layout"), // JSON layout configuration
  filters: text("filters"), // JSON default filters
  refreshInterval: integer("refresh_interval"), // in seconds
  lastRefreshed: integer("last_refreshed", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const dashboard_widgets = sqliteTable("dashboard_widgets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  dashboardId: integer("dashboard_id").notNull().references(() => dashboards.id),
  widgetType: text("widget_type").$type<"chart" | "metric" | "table" | "map" | "text" | "image">().notNull(),
  title: text("title").notNull(),
  position: text("position"), // JSON {x, y, width, height}
  config: text("config"), // JSON widget configuration
  dataSource: text("data_source"), // JSON data source configuration
  refreshInterval: integer("refresh_interval"), // in seconds
  isVisible: integer("is_visible", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  reportType: text("report_type").$type<"financial" | "operational" | "performance" | "compliance" | "custom">().notNull(),
  category: text("category"),
  template: text("template"), // JSON report template
  filters: text("filters"), // JSON default filters
  parameters: text("parameters"), // JSON report parameters
  format: text("format").$type<"pdf" | "excel" | "csv" | "html">().default("pdf"),
  status: text("status").$type<"draft" | "published" | "archived">().default("draft"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const report_schedules = sqliteTable("report_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").notNull().references(() => reports.id),
  name: text("name").notNull(),
  scheduleType: text("schedule_type").$type<"daily" | "weekly" | "monthly" | "quarterly" | "yearly">().notNull(),
  scheduleConfig: text("schedule_config"), // JSON schedule configuration
  recipients: text("recipients"), // JSON array of email addresses
  format: text("format").$type<"pdf" | "excel" | "csv" | "html">().default("pdf"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastRun: integer("last_run", { mode: "timestamp" }),
  nextRun: integer("next_run", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const kpis = sqliteTable("kpis", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  category: text("category").$type<"financial" | "operational" | "customer" | "quality" | "efficiency">().notNull(),
  metric: text("metric").notNull(),
  dataSource: text("data_source"), // JSON data source configuration
  calculation: text("calculation"), // JSON calculation logic
  target: real("target"),
  unit: text("unit"),
  frequency: text("frequency").$type<"real-time" | "hourly" | "daily" | "weekly" | "monthly">().default("daily"),
  alertThresholds: text("alert_thresholds"), // JSON alert configuration
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const kpi_values = sqliteTable("kpi_values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kpiId: integer("kpi_id").notNull().references(() => kpis.id),
  value: real("value").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  period: text("period"), // YYYY-MM-DD or YYYY-MM-DD HH:mm
  metadata: text("metadata"), // JSON additional data
});

export const analytics_data = sqliteTable("analytics_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  dataType: text("data_type").$type<"events" | "metrics" | "trends" | "forecasts">().notNull(),
  category: text("category"),
  key: text("key").notNull(),
  value: real("value"),
  data: text("data"), // JSON structured data
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  source: text("source"), // Module or system that generated the data
  tags: text("tags"), // JSON array of tags
});

export const predictive_models = sqliteTable("predictive_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  modelType: text("model_type").$type<"regression" | "classification" | "clustering" | "time_series">().notNull(),
  targetVariable: text("target_variable").notNull(),
  features: text("features"), // JSON array of feature names
  algorithm: text("algorithm"),
  parameters: text("parameters"), // JSON model parameters
  accuracy: real("accuracy"),
  status: text("status").$type<"training" | "ready" | "failed" | "deprecated">().default("training"),
  lastTrained: integer("last_trained", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Advanced Data Science & Machine Learning Ops Tables



export const datasets = sqliteTable("datasets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  version: text("version").notNull(),
  datasetType: text("dataset_type").$type<"training" | "validation" | "test" | "production">().default("training"),
  format: text("format").$type<"csv" | "parquet" | "json" | "image" | "text">().default("csv"),
  storageLocation: text("storage_location").notNull(),
  size: integer("size"), // in bytes
  rowCount: integer("row_count"),
  columnCount: integer("column_count"),
  schema: text("schema"), // JSON schema definition
  statistics: text("statistics"), // JSON descriptive statistics
  tags: text("tags"), // JSON array
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const dataset_versions: any = sqliteTable("dataset_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  datasetId: integer("dataset_id").notNull().references(() => datasets.id),
  version: text("version").notNull(),
  parentVersionId: integer("parent_version_id").references(() => dataset_versions.id),
  changes: text("changes"), // JSON change description
  storageLocation: text("storage_location").notNull(),
  size: integer("size"),
  rowCount: integer("row_count"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const experiments = sqliteTable("experiments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  modelId: integer("model_id").references(() => ml_models.id),
  datasetId: integer("dataset_id").references(() => datasets.id),
  status: text("status").$type<"running" | "completed" | "failed" | "stopped">().default("running"),
  hyperparameters: text("hyperparameters"), // JSON
  configuration: text("configuration"), // JSON experiment config
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const experiment_runs = sqliteTable("experiment_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  experimentId: integer("experiment_id").notNull().references(() => experiments.id),
  runNumber: integer("run_number").notNull(),
  status: text("status").$type<"running" | "completed" | "failed" | "stopped">().default("running"),
  parameters: text("parameters"), // JSON
  metrics: text("metrics"), // JSON metrics
  artifacts: text("artifacts"), // JSON artifact paths
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const ml_pipelines: any = sqliteTable("ml_pipelines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  version: text("version").notNull(),
  pipelineType: text("pipeline_type").$type<"training" | "inference" | "preprocessing" | "evaluation">().default("training"),
  definition: text("definition"), // JSON pipeline DAG definition
  schedule: text("schedule"), // cron expression
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastRunId: integer("last_run_id").references(() => pipeline_runs.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const pipeline_runs: any = sqliteTable("pipeline_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pipelineId: integer("pipeline_id").notNull().references(() => ml_pipelines.id),
  runNumber: integer("run_number").notNull(),
  status: text("status").$type<"running" | "completed" | "failed" | "stopped" | "skipped">().default("running"),
  triggeredBy: text("triggered_by"), // manual, schedule, webhook
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  steps: text("steps"), // JSON step execution details
  artifacts: text("artifacts"), // JSON produced artifacts
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const model_deployments = sqliteTable("model_deployments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  modelId: integer("model_id").notNull().references(() => ml_models.id),
  environment: text("environment").$type<"development" | "staging" | "production">().default("development"),
  deploymentType: text("deployment_type").$type<"rest" | "grpc" | "batch" | "streaming">().default("rest"),
  endpointUrl: text("endpoint_url"),
  endpointConfig: text("endpoint_config"), // JSON scaling, routing config
  status: text("status").$type<"deploying" | "active" | "inactive" | "failed">().default("deploying"),
  replicas: integer("replicas").default(1),
  cpuRequest: real("cpu_request"),
  memoryRequest: integer("memory_request"), // in MB
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const model_metrics = sqliteTable("model_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").notNull().references(() => ml_models.id),
  deploymentId: integer("deployment_id").references(() => model_deployments.id),
  metricName: text("metric_name").notNull(),
  metricValue: real("metric_value").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  labels: text("labels"), // JSON label dimensions
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const ab_tests = sqliteTable("ab_tests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  modelAId: integer("model_a_id").references(() => ml_models.id),
  modelBId: integer("model_b_id").references(() => ml_models.id),
  trafficSplit: real("traffic_split"), // percentage for model A
  status: text("status").$type<"draft" | "running" | "completed" | "stopped">().default("draft"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  hypothesis: text("hypothesis"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const ab_test_results = sqliteTable("ab_test_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testId: integer("test_id").notNull().references(() => ab_tests.id),
  metricName: text("metric_name").notNull(),
  modelAValue: real("model_a_value"),
  modelBValue: real("model_b_value"),
  pValue: real("p_value"),
  isStatisticallySignificant: integer("is_statistically_significant", { mode: "boolean" }),
  confidenceInterval: text("confidence_interval"), // JSON
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const feature_store = sqliteTable("feature_store", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  featureType: text("feature_type").$type<"numerical" | "categorical" | "text" | "image">().default("numerical"),
  dataType: text("data_type").notNull(),
  defaultValue: text("default_value"),
  validationRules: text("validation_rules"), // JSON
  statistics: text("statistics"), // JSON stats
  version: text("version").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const model_explainability = sqliteTable("model_explainability", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").notNull().references(() => ml_models.id),
  explanationType: text("explanation_type").$type<"shap" | "lime" | "permutation" | "partial_dependence">().notNull(),
  featureImportance: text("feature_importance"), // JSON
  explanationData: text("explanation_data"), // JSON
  sampleCount: integer("sample_count"),
  generatedAt: integer("generated_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Advanced Quality Assurance & Testing Platform Tables

export const test_suites = sqliteTable("test_suites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  testType: text("test_type").$type<"unit" | "integration" | "e2e" | "api" | "performance" | "security" | "accessibility">().notNull(),
  framework: text("framework").$type<"jest" | "cypress" | "playwright" | "selenium" | "postman" | "k6" | "owasp_zap">(),
  status: text("status").$type<"active" | "inactive" | "deprecated">().default("active"),
  schedule: text("schedule"), // cron expression
  environment: text("environment").$type<"development" | "staging" | "production">().default("development"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const test_cases = sqliteTable("test_cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testSuiteId: integer("test_suite_id").notNull().references(() => test_suites.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  status: text("status").$type<"draft" | "ready" | "review" | "approved" | "deprecated">().default("draft"),
  testSteps: text("test_steps"), // JSON array of test steps
  expectedResult: text("expected_result"),
  preconditions: text("preconditions"),
  tags: text("tags"), // JSON array
  automationStatus: text("automation_status").$type<"manual" | "automated" | "semi_automated">().default("manual"),
  automationScript: text("automation_script"), // Code or script content
  estimatedDuration: integer("estimated_duration"), // in seconds
  createdBy: integer("created_by").references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const test_runs = sqliteTable("test_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testSuiteId: integer("test_suite_id").references(() => test_suites.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").$type<"scheduled" | "running" | "completed" | "failed" | "cancelled">().default("scheduled"),
  environment: text("environment").$type<"development" | "staging" | "production">().default("development"),
  triggeredBy: text("triggered_by"), // "manual", "schedule", "ci_cd", "webhook"
  triggeredByUser: integer("triggered_by_user").references(() => users.id),
  startTime: integer("start_time", { mode: "timestamp" }),
  endTime: integer("end_time", { mode: "timestamp" }),
  duration: integer("duration"), // in seconds
  totalTests: integer("total_tests").default(0),
  passedTests: integer("passed_tests").default(0),
  failedTests: integer("failed_tests").default(0),
  skippedTests: integer("skipped_tests").default(0),
  config: text("config"), // JSON run configuration
  results: text("results"), // JSON detailed results
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const test_results = sqliteTable("test_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  testRunId: integer("test_run_id").notNull().references(() => test_runs.id),
  testCaseId: integer("test_case_id").references(() => test_cases.id),
  testName: text("test_name").notNull(),
  status: text("status").$type<"passed" | "failed" | "skipped" | "error" | "blocked">().notNull(),
  duration: integer("duration"), // in milliseconds
  errorMessage: text("error_message"),
  stackTrace: text("stack_trace"),
  screenshots: text("screenshots"), // JSON array of file URLs
  logs: text("logs"), // JSON test logs
  metadata: text("metadata"), // JSON additional data
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bugs = sqliteTable("bugs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tenantId: text("tenant_id").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  testRunId: integer("test_run_id").references(() => test_runs.id),
  severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  priority: text("priority").$type<"low" | "medium" | "high" | "urgent">().default("medium"),
  status: text("status").$type<"open" | "in_progress" | "resolved" | "closed" | "rejected">().default("open"),
  type: text("type").$type<"bug" | "feature_request" | "improvement" | "security_issue">().default("bug"),
  reportedBy: integer("reported_by").references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  tags: text("tags"), // JSON array
  attachments: text("attachments"), // JSON array of file URLs
  reproductionSteps: text("reproduction_steps"),
  expectedBehavior: text("expected_behavior"),
  actualBehavior: text("actual_behavior"),
  environment: text("environment"), // JSON environment details
  browser: text("browser"),
  os: text("os"),
  resolution: text("resolution"),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const code_quality_reports = sqliteTable("code_quality_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id),
  commitHash: text("commit_hash"),
  branch: text("branch").default("main"),
  tool: text("tool").$type<"eslint" | "prettier" | "sonarcloud" | "codeclimate" | "eslint" | "typescript">().notNull(),
  status: text("status").$type<"passed" | "failed" | "warning">().default("passed"),
  score: real("score"), // 0-100 quality score
  issues: text("issues"), // JSON array of issues
  metrics: text("metrics"), // JSON quality metrics
  generatedAt: integer("generated_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const performance_tests: any = sqliteTable("performance_tests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  testType: text("test_type").$type<"load" | "stress" | "spike" | "volume" | "endurance">().default("load"),
  targetUrl: text("target_url").notNull(),
  config: text("config"), // JSON test configuration (vus, duration, thresholds)
  script: text("script"), // K6 or similar script content
  status: text("status").$type<"draft" | "scheduled" | "running" | "completed" | "failed">().default("draft"),
  schedule: text("schedule"), // cron expression
  lastRunId: integer("last_run_id").references(() => performance_test_runs.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const performance_test_runs: any = sqliteTable("performance_test_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  performanceTestId: integer("performance_test_id").notNull().references(() => performance_tests.id),
  status: text("status").$type<"running" | "completed" | "failed">().default("running"),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  duration: integer("duration"), // in seconds
  results: text("results"), // JSON performance metrics
  thresholds: text("thresholds"), // JSON pass/fail thresholds
  passed: integer("passed", { mode: "boolean" }),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const security_scans: any = sqliteTable("security_scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  scanType: text("scan_type").$type<"sast" | "dast" | "sca" | "container" | "infrastructure">().notNull(),
  target: text("target"), // URL, repo, container image, etc.
  tool: text("tool").$type<"owasp_zap" | "sonarqube" | "snyk" | "trivy" | "nessus">().notNull(),
  config: text("config"), // JSON scan configuration
  status: text("status").$type<"scheduled" | "running" | "completed" | "failed">().default("scheduled"),
  schedule: text("schedule"), // cron expression
  lastRunId: integer("last_run_id").references(() => security_scan_runs.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const security_scan_runs: any = sqliteTable("security_scan_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  securityScanId: integer("security_scan_id").notNull().references(() => security_scans.id),
  status: text("status").$type<"running" | "completed" | "failed">().default("running"),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  duration: integer("duration"), // in seconds
  vulnerabilities: text("vulnerabilities"), // JSON vulnerability findings
  severityCounts: text("severity_counts"), // JSON {critical: 0, high: 2, medium: 5, low: 10}
  complianceScore: real("compliance_score"), // 0-100
  reportUrl: text("report_url"),
  passed: integer("passed", { mode: "boolean" }),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const ci_cd_pipelines: any = sqliteTable("ci_cd_pipelines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  repository: text("repository"), // Git repository URL
  branch: text("branch").default("main"),
  config: text("config"), // JSON pipeline configuration
  status: text("status").$type<"active" | "inactive" | "deprecated">().default("active"),
  lastBuildId: integer("last_build_id").references(() => pipeline_builds.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const pipeline_builds: any = sqliteTable("pipeline_builds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pipelineId: integer("pipeline_id").notNull().references(() => ci_cd_pipelines.id),
  buildNumber: integer("build_number").notNull(),
  commitHash: text("commit_hash"),
  branch: text("branch"),
  triggeredBy: text("triggered_by"), // "push", "pull_request", "manual", "schedule"
  triggeredByUser: integer("triggered_by_user").references(() => users.id),
  status: text("status").$type<"pending" | "running" | "success" | "failure" | "cancelled">().default("pending"),
  startTime: integer("start_time", { mode: "timestamp" }),
  endTime: integer("end_time", { mode: "timestamp" }),
  duration: integer("duration"), // in seconds
  stages: text("stages"), // JSON pipeline stages and their status
  artifacts: text("artifacts"), // JSON build artifacts
  testResults: text("test_results"), // JSON test execution results
  codeQualityReport: text("code_quality_report"), // JSON linting/static analysis results
  securityScanReport: text("security_scan_report"), // JSON security scan results
  deploymentUrl: text("deployment_url"),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const quality_metrics = sqliteTable("quality_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  metricType: text("metric_type").$type<"test_coverage" | "code_quality" | "performance" | "security" | "reliability" | "maintainability">().notNull(),
  metricName: text("metric_name").notNull(),
  value: real("value").notNull(),
  target: real("target"),
  unit: text("unit"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  metadata: text("metadata"), // JSON additional context
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  alertType: text("alert_type").$type<"kpi" | "system" | "performance" | "security">().notNull(),
  severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  sourceId: integer("source_id"), // ID of the source (KPI, system component, etc.)
  sourceType: text("source_type"),
  conditions: text("conditions"), // JSON alert trigger conditions
  recipients: text("recipients"), // JSON array of user IDs or emails
  status: text("status").$type<"active" | "acknowledged" | "resolved" | "suppressed">().default("active"),
  acknowledgedBy: integer("acknowledged_by").references(() => users.id),
  acknowledgedAt: integer("acknowledged_at", { mode: "timestamp" }),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Customer Relationship Management Tables

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id), // Link to user account if exists
  tenantId: text("tenant_id").notNull(),
  customerNumber: text("customer_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),
  gender: text("gender").$type<"male" | "female" | "other">(),

  // Address information
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("South Africa"),

  // Customer status
  status: text("status").$type<"active" | "inactive" | "prospect" | "lead">().default("active"),
  customerType: text("customer_type").$type<"individual" | "business">().default("individual"),
  segmentId: integer("segment_id").references(() => customer_segments.id),

  // Business information (for business customers)
  companyName: text("company_name"),
  companySize: text("company_size").$type<"1-10" | "11-50" | "51-200" | "201-1000" | "1000+">(),
  industry: text("industry"),

  // Preferences and analytics
  preferredLanguage: text("preferred_language").default("en"),
  communicationPreferences: text("communication_preferences"), // JSON
  totalSpent: real("total_spent").default(0),
  totalOrders: integer("total_orders").default(0),
  lastOrderDate: integer("last_order_date", { mode: "timestamp" }),
  lifetimeValue: real("lifetime_value").default(0),
  churnRisk: text("churn_risk").$type<"low" | "medium" | "high">().default("low"),

  // System fields
  source: text("source"), // How they became a customer
  tags: text("tags"), // JSON array of tags
  customFields: text("custom_fields"), // JSON custom fields
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const customer_segments = sqliteTable("customer_segments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  criteria: text("criteria"), // JSON segmentation criteria
  customerCount: integer("customer_count").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  leadNumber: text("lead_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  source: text("source").$type<"website" | "referral" | "social_media" | "advertisement" | "cold_call" | "trade_show" | "other">(),
  sourceDetails: text("source_details"),
  status: text("status").$type<"new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost">().default("new"),
  priority: text("priority").$type<"low" | "medium" | "high">().default("medium"),
  estimatedValue: real("estimated_value"),
  probability: real("probability"), // Conversion probability percentage
  score: integer("score").default(0), // Lead score
  assignedTo: integer("assigned_to").references(() => users.id),
  qualificationNotes: text("qualification_notes"),
  nextFollowUp: integer("next_follow_up", { mode: "timestamp" }),
  convertedCustomerId: integer("converted_customer_id").references(() => customers.id),
  convertedAt: integer("converted_at", { mode: "timestamp" }),
  tags: text("tags"), // JSON array of tags
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").$type<"email" | "sms" | "social_media" | "direct_mail" | "web_push" | "multichannel">().notNull(),
  status: text("status").$type<"draft" | "scheduled" | "running" | "paused" | "completed" | "cancelled">().default("draft"),
  targetSegment: integer("target_segment").references(() => customer_segments.id),
  targetCriteria: text("target_criteria"), // JSON targeting criteria
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  budget: real("budget"),
  currency: text("currency").default("ZAR"),
  expectedReach: integer("expected_reach"),
  content: text("content"), // JSON campaign content
  automationRules: text("automation_rules"), // JSON automation workflow
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const campaign_analytics = sqliteTable("campaign_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  revenue: real("revenue").default(0),
  cost: real("cost").default(0),
  bounceRate: real("bounce_rate"),
  openRate: real("open_rate"),
  clickRate: real("click_rate"),
  conversionRate: real("conversion_rate"),
  unsubscribeRate: real("unsubscribe_rate"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const communications = sqliteTable("communications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  type: text("type").$type<"email" | "sms" | "call" | "meeting" | "note" | "system">().notNull(),
  direction: text("direction").$type<"inbound" | "outbound">(),
  subject: text("subject"),
  content: text("content"),
  status: text("status").$type<"sent" | "delivered" | "read" | "replied" | "bounced" | "failed">(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  readAt: integer("read_at", { mode: "timestamp" }),
  repliedAt: integer("replied_at", { mode: "timestamp" }),
  performedBy: integer("performed_by").references(() => users.id),
  metadata: text("metadata"), // JSON additional data
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const loyalty_programs = sqliteTable("loyalty_programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").$type<"points" | "tiered" | "cashback" | "hybrid">().default("points"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  pointValue: real("point_value").default(1), // Value per point in currency
  currency: text("currency").default("ZAR"),
  tiers: text("tiers"), // JSON tier definitions
  rules: text("rules"), // JSON program rules
  expiryDays: integer("expiry_days"), // Days until points expire
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const loyalty_points = sqliteTable("loyalty_points", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  programId: integer("program_id").notNull().references(() => loyalty_programs.id),
  points: integer("points").notNull(),
  transactionType: text("transaction_type").$type<"earned" | "redeemed" | "expired" | "adjusted">().notNull(),
  transactionId: text("transaction_id"), // Reference to original transaction
  description: text("description"),
  expiryDate: integer("expiry_date", { mode: "timestamp" }),
  balanceAfter: integer("balance_after"), // Points balance after this transaction
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const customer_feedback = sqliteTable("customer_feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").$type<"survey" | "review" | "complaint" | "suggestion" | "compliment">().notNull(),
  rating: integer("rating"), // 1-5 stars
  subject: text("subject"),
  message: text("message").notNull(),
  category: text("category"),
  status: text("status").$type<"new" | "in_progress" | "resolved" | "closed">().default("new"),
  assignedTo: integer("assigned_to").references(() => users.id),
  response: text("response"),
  respondedAt: integer("responded_at", { mode: "timestamp" }),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Advanced Security & Compliance Framework Tables

export const user_roles = sqliteTable("user_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id"),
  isSystemRole: integer("is_system_role", { mode: "boolean" }).default(false),
  permissions: text("permissions"), // JSON array of permission IDs
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const permissions = sqliteTable("permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  resource: text("resource").notNull(), // e.g., 'users', 'bookings', 'reports'
  action: text("action").notNull(), // e.g., 'create', 'read', 'update', 'delete'
  description: text("description"),
  category: text("category").$type<"user_management" | "data_access" | "system_admin" | "reporting" | "financial">().notNull(),
  isSystemPermission: integer("is_system_permission", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const role_permissions = sqliteTable("role_permissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roleId: integer("role_id").notNull().references(() => user_roles.id),
  permissionId: integer("permission_id").notNull().references(() => permissions.id),
  grantedBy: integer("granted_by").references(() => users.id),
  grantedAt: integer("granted_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const user_role_assignments = sqliteTable("user_role_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => user_roles.id),
  tenantId: text("tenant_id"),
  assignedBy: integer("assigned_by").references(() => users.id),
  assignedAt: integer("assigned_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const security_events = sqliteTable("security_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id"),
  eventType: text("event_type").$type<"login" | "logout" | "failed_login" | "password_change" | "permission_change" | "data_access" | "suspicious_activity">().notNull(),
  severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  userId: integer("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"), // JSON {country, city, coordinates}
  deviceInfo: text("device_info"), // JSON device information
  resource: text("resource"), // Affected resource
  action: text("action"), // Action performed
  oldValues: text("old_values"), // JSON
  newValues: text("new_values"), // JSON
  success: integer("success", { mode: "boolean" }).default(true),
  errorMessage: text("error_message"),
  sessionId: text("session_id"),
  correlationId: text("correlation_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const security_policies = sqliteTable("security_policies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").$type<"password" | "access" | "data" | "network" | "compliance">().notNull(),
  policyType: text("policy_type").$type<"preventive" | "detective" | "corrective">().notNull(),
  rules: text("rules"), // JSON policy rules
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  enforcementLevel: text("enforcement_level").$type<"strict" | "moderate" | "permissive">().default("moderate"),
  tenantId: text("tenant_id"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const compliance_records = sqliteTable("compliance_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  regulation: text("regulation").$type<"POPIA" | "B-BBEE" | "NHBRC" | "CIDB" | "GDPR" | "SOX" | "HIPAA">().notNull(),
  requirement: text("requirement").notNull(),
  status: text("status").$type<"compliant" | "non_compliant" | "pending_review" | "exempted">().default("pending_review"),
  evidence: text("evidence"), // JSON evidence documentation
  reviewDate: integer("review_date", { mode: "timestamp" }),
  nextReviewDate: integer("next_review_date", { mode: "timestamp" }),
  reviewerId: integer("reviewer_id").references(() => users.id),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const security_incidents = sqliteTable("security_incidents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  incidentType: text("incident_type").$type<"breach" | "unauthorized_access" | "data_leak" | "malware" | "ddos" | "phishing" | "other">().notNull(),
  severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  status: text("status").$type<"detected" | "investigating" | "contained" | "resolved" | "closed">().default("detected"),
  detectedAt: integer("detected_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  resolvedAt: integer("resolved_at", { mode: "timestamp" }),
  assignedTo: integer("assigned_to").references(() => users.id),
  impact: text("impact"), // JSON impact assessment
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  preventiveActions: text("preventive_actions"), // JSON
  affectedUsers: integer("affected_users").default(0),
  affectedRecords: integer("affected_records").default(0),
  financialImpact: real("financial_impact"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const threat_intelligence = sqliteTable("threat_intelligence", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threatId: text("threat_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  threatType: text("threat_type").$type<"malware" | "phishing" | "ddos" | "vulnerability" | "insider_threat">().notNull(),
  severity: text("severity").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  source: text("source"), // Threat intelligence source
  indicators: text("indicators"), // JSON threat indicators
  mitigation: text("mitigation"), // JSON mitigation steps
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  firstSeen: integer("first_seen", { mode: "timestamp" }),
  lastSeen: integer("last_seen", { mode: "timestamp" }),
  confidence: real("confidence"), // 0-1
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const data_encryption_keys = sqliteTable("data_encryption_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  keyId: text("key_id").notNull(),
  version: integer("version").notNull(),
  algorithm: text("algorithm").$type<"AES-256" | "RSA" | "ECC">().default("AES-256"),
  keyData: text("key_data"), // Encrypted key material
  status: text("status").$type<"active" | "rotated" | "compromised" | "expired">().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  rotatedAt: integer("rotated_at", { mode: "timestamp" }),
  createdBy: integer("created_by").references(() => users.id),
});

// Advanced AI Assistant & Automation Platform Tables

export const ai_workflows = sqliteTable("ai_workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  status: text("status").$type<"active" | "paused" | "completed" | "failed">().default("active"),
  triggerType: text("trigger_type").$type<"manual" | "scheduled" | "event" | "api">().default("manual"),
  scheduleConfig: text("schedule_config"), // JSON cron expression or schedule
  triggerConfig: text("trigger_config"), // JSON trigger configuration
  priority: text("priority").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const automation_rules = sqliteTable("automation_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workflowId: integer("workflow_id").notNull().references(() => ai_workflows.id),
  name: text("name").notNull(),
  condition: text("condition").notNull(), // JSON condition logic
  action: text("action").notNull(), // JSON action to execute
  actionConfig: text("action_config"), // JSON action configuration
  order: integer("order").default(0),
  isEnabled: integer("is_enabled", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const ml_models = sqliteTable("ml_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  modelType: text("model_type").$type<"regression" | "classification" | "clustering" | "nlp" | "deep_learning">().notNull(),
  algorithm: text("algorithm"),
  parameters: text("parameters"), // JSON model parameters
  trainingData: text("training_data"), // JSON training configuration
  modelUrl: text("model_url"), // URL to stored model file
  accuracy: real("accuracy"), // 0-1
  status: text("status").$type<"training" | "ready" | "deployed" | "failed">().default("training"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const model_predictions = sqliteTable("model_predictions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: integer("model_id").notNull().references(() => ml_models.id),
  inputData: text("input_data"), // JSON input
  prediction: text("prediction"), // JSON prediction result
  confidence: real("confidence"), // confidence score
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const nlp_interactions = sqliteTable("nlp_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  inputText: text("input_text").notNull(),
  responseText: text("response_text"),
  intent: text("intent"),
  entities: text("entities"), // JSON extracted entities
  sentiment: text("sentiment").$type<"positive" | "neutral" | "negative">(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const code_reviews = sqliteTable("code_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  submittedBy: integer("submitted_by").notNull().references(() => users.id),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  codeContent: text("code_content").notNull(),
  reviewStatus: text("review_status").$type<"pending" | "approved" | "rejected" | "changes_requested">().default("pending"),
  issuesFound: text("issues_found"), // JSON list of issues
  suggestions: text("suggestions"), // JSON suggestions
  score: real("score"), // 0-100 quality score
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Enterprise Integration & API Management Platform Tables

export const api_keys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  tenantId: text("tenant_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  permissions: text("permissions"), // JSON array of allowed scopes
  rateLimit: integer("rate_limit"), // requests per hour
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  lastUsed: integer("last_used", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const external_integrations = sqliteTable("external_integrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  provider: text("provider").notNull(), // e.g., 'quickbooks', 'xero', 'salesforce'
  type: text("type").$type<"oauth" | "api_key" | "basic_auth" | "custom">().default("oauth"),
  config: text("config"), // JSON provider configuration
  credentials: text("credentials"), // Encrypted credentials
  tenantId: text("tenant_id").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  status: text("status").$type<"connected" | "disconnected" | "error" | "pending">().default("pending"),
  lastSync: integer("last_sync", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const webhooks = sqliteTable("webhooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  tenantId: text("tenant_id").notNull(),
  secret: text("secret"), // webhook signing secret
  events: text("events"), // JSON array of event types
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  headers: text("headers"), // JSON custom headers
  retryPolicy: text("retry_policy"), // JSON retry configuration
  lastTriggered: integer("last_triggered", { mode: "timestamp" }),
  failureCount: integer("failure_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const webhook_deliveries = sqliteTable("webhook_deliveries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  webhookId: integer("webhook_id").notNull().references(() => webhooks.id),
  event: text("event").notNull(),
  payload: text("payload").notNull(),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  success: integer("success", { mode: "boolean" }).default(false),
  attempt: integer("attempt").default(1),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sync_schedules = sqliteTable("sync_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  integrationId: integer("integration_id").notNull().references(() => external_integrations.id),
  syncType: text("sync_type").$type<"full" | "incremental" | "realtime">().default("incremental"),
  schedule: text("schedule").notNull(), // cron expression
  config: text("config"), // JSON sync configuration
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastSync: integer("last_sync", { mode: "timestamp" }),
  nextSync: integer("next_sync", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sync_logs = sqliteTable("sync_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id").references(() => sync_schedules.id),
  integrationId: integer("integration_id").references(() => external_integrations.id),
  status: text("status").$type<"running" | "completed" | "failed" | "partial">().default("running"),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsFailed: integer("records_failed").default(0),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  errorMessage: text("error_message"),
  details: text("details"), // JSON sync details
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const data_transformations = sqliteTable("data_transformations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  sourceSchema: text("source_schema"), // JSON source data structure
  targetSchema: text("target_schema"), // JSON target data structure
  mappingRules: text("mapping_rules"), // JSON field mapping
  transformationLogic: text("transformation_logic"), // JavaScript/expression
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const api_analytics = sqliteTable("api_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  apiKeyId: integer("api_key_id").references(() => api_keys.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"), // in milliseconds
  requestSize: integer("request_size"),
  responseSize: integer("response_size"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const rate_limits = sqliteTable("rate_limits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  identifier: text("identifier").notNull(), // API key, IP, or user ID
  type: text("type").$type<"api_key" | "ip" | "user">().notNull(),
  limit: integer("limit").notNull(), // max requests
  window: integer("window").notNull(), // time window in seconds
  current: integer("current").default(0),
  resetAt: integer("reset_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sso_providers = sqliteTable("sso_providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  provider: text("provider").$type<"azure_ad" | "okta" | "auth0" | "google" | "github">().notNull(),
  tenantId: text("tenant_id").notNull(),
  config: text("config"), // JSON provider configuration
  credentials: text("credentials"), // Encrypted OAuth credentials
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  syncUserProfile: integer("sync_user_profile", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sso_connections = sqliteTable("sso_connections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id").notNull().references(() => sso_providers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  externalId: text("external_id").notNull(),
  email: text("email").notNull(),
  metadata: text("metadata"), // JSON additional profile data
  lastLogin: integer("last_login", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const access_tokens = sqliteTable("access_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  refreshToken: text("refresh_token"),
  tokenType: text("token_type").$type<"bearer" | "api_key" | "session">().default("bearer"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

// Advanced Project Management & Collaboration Platform Tables

export const teams: any = sqliteTable("teams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  leaderId: integer("leader_id").references(() => users.id),
  parentTeamId: integer("parent_team_id").references(() => teams.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const team_members = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id").notNull().references(() => teams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").$type<"member" | "lead" | "manager">().default("member"),
  joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const projects: any = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: text("tenant_id").notNull(),
  code: text("code").notNull().unique(),
  status: text("status").$type<"planning" | "active" | "on_hold" | "completed" | "cancelled">().default("planning"),
  priority: text("priority").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  budget: real("budget"),
  currency: text("currency").default("ZAR"),
  progress: real("progress").default(0), // 0-100
  ownerId: integer("owner_id").notNull().references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  parentProjectId: integer("parent_project_id").references(() => projects.id),
  templateId: integer("template_id").references(() => project_templates.id),
  customFields: text("custom_fields"), // JSON
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const project_members = sqliteTable("project_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").$type<"viewer" | "contributor" | "manager" | "owner">().default("contributor"),
  joinedAt: integer("joined_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const tasks: any = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  parentTaskId: integer("parent_task_id").references(() => tasks.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").$type<"todo" | "in_progress" | "review" | "done" | "cancelled">().default("todo"),
  priority: text("priority").$type<"low" | "medium" | "high" | "urgent">().default("medium"),
  type: text("type").$type<"task" | "bug" | "feature" | "epic" | "story">().default("task"),
  assigneeId: integer("assignee_id").references(() => users.id),
  reporterId: integer("reporter_id").references(() => users.id),
  startDate: integer("start_date", { mode: "timestamp" }),
  dueDate: integer("due_date", { mode: "timestamp" }),
  estimatedHours: real("estimated_hours"),
  actualHours: real("actual_hours").default(0),
  progress: real("progress").default(0), // 0-100
  tags: text("tags"), // JSON array
  customFields: text("custom_fields"), // JSON
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const task_dependencies = sqliteTable("task_dependencies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  dependsOnTaskId: integer("depends_on_task_id").notNull().references(() => tasks.id),
  dependencyType: text("dependency_type").$type<"finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish">().default("finish_to_start"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const task_comments: any = sqliteTable("task_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id").references(() => task_comments.id),
  isInternal: integer("is_internal", { mode: "boolean" }).default(false),
  attachments: text("attachments"), // JSON array of file URLs
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const project_milestones = sqliteTable("project_milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  status: text("status").$type<"pending" | "completed" | "overdue">().default("pending"),
  progress: real("progress").default(0), // 0-100
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const time_entries = sqliteTable("time_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  projectId: integer("project_id").references(() => projects.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  hours: real("hours").notNull(),
  description: text("description"),
  billable: integer("billable", { mode: "boolean" }).default(true),
  billableRate: real("billable_rate"),
  approved: integer("approved", { mode: "boolean" }).default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  projectId: integer("project_id").references(() => projects.id),
  taskId: integer("task_id").references(() => tasks.id),
  folderId: integer("folder_id").references(() => document_folders.id),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  version: integer("version").default(1),
  isLatest: integer("is_latest", { mode: "boolean" }).default(true),
  permissions: text("permissions"), // JSON permission settings
  tags: text("tags"), // JSON array
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const document_versions = sqliteTable("document_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull().references(() => documents.id),
  version: integer("version").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileUrl: text("file_url").notNull(),
  changes: text("changes"), // Description of changes
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const document_folders: any = sqliteTable("document_folders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  parentFolderId: integer("parent_folder_id").references(() => document_folders.id),
  projectId: integer("project_id").references(() => projects.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  permissions: text("permissions"), // JSON permission settings
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const project_templates = sqliteTable("project_templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").$type<"software" | "construction" | "marketing" | "general">().notNull(),
  tenantId: text("tenant_id"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  templateData: text("template_data"), // JSON template structure
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const project_analytics = sqliteTable("project_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  date: integer("date", { mode: "timestamp" }).notNull(),
  metric: text("metric").notNull(), // e.g., 'tasks_completed', 'hours_logged', 'budget_used'
  value: real("value").notNull(),
  category: text("category").$type<"productivity" | "quality" | "budget" | "timeline">(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Advanced Enterprise Resource Planning Integration Tables

export const erp_connectors = sqliteTable("erp_connectors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  provider: text("provider").$type<"sap" | "oracle" | "microsoft_dynamics" | "sage" | "netsuite" | "custom">().notNull(),
  version: text("version"),
  connectionType: text("connection_type").$type<"api" | "database" | "file" | "soap" | "odata">().default("api"),
  endpoint: text("endpoint"),
  authentication: text("authentication"), // JSON auth configuration
  credentials: text("credentials"), // Encrypted credentials
  status: text("status").$type<"connected" | "disconnected" | "error" | "configuring">().default("configuring"),
  lastSync: integer("last_sync", { mode: "timestamp" }),
  syncFrequency: text("sync_frequency").$type<"real_time" | "hourly" | "daily" | "weekly" | "manual">().default("daily"),
  tenantId: text("tenant_id").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_modules = sqliteTable("erp_modules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull(), // GL, AP, AR, INV, HR, etc.
  description: text("description"),
  category: text("category").$type<"financial" | "supply_chain" | "hr" | "manufacturing" | "sales" | "project">().notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_workflows = sqliteTable("erp_workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  workflowType: text("workflow_type").$type<"purchase_order" | "sales_order" | "invoice" | "payroll" | "inventory" | "custom">().notNull(),
  trigger: text("trigger").$type<"manual" | "scheduled" | "event" | "api">().default("manual"),
  triggerConfig: text("trigger_config"), // JSON trigger configuration
  steps: text("steps"), // JSON workflow steps definition
  conditions: text("conditions"), // JSON execution conditions
  approvals: text("approvals"), // JSON approval workflow
  notifications: text("notifications"), // JSON notification settings
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  tenantId: text("tenant_id").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_sync_logs = sqliteTable("erp_sync_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  connectorId: integer("connector_id").notNull().references(() => erp_connectors.id),
  moduleId: integer("module_id").references(() => erp_modules.id),
  syncType: text("sync_type").$type<"full" | "incremental" | "delta" | "real_time">().default("incremental"),
  direction: text("direction").$type<"import" | "export" | "bidirectional">().default("bidirectional"),
  status: text("status").$type<"running" | "completed" | "failed" | "partial">().default("running"),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsFailed: integer("records_failed").default(0),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  duration: integer("duration"), // in seconds
  errorMessage: text("error_message"),
  metadata: text("metadata"), // JSON additional sync info
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_transformations = sqliteTable("erp_transformations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  sourceSystem: text("source_system"), // e.g., "sap", "oracle", "garlaws"
  targetSystem: text("target_system"),
  entityType: text("entity_type"), // e.g., "customer", "invoice", "product"
  mappingRules: text("mapping_rules"), // JSON field mapping rules
  transformationLogic: text("transformation_logic"), // JavaScript transformation code
  validationRules: text("validation_rules"), // JSON validation rules
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  tenantId: text("tenant_id").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const multi_company_config = sqliteTable("multi_company_config", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  legalEntity: text("legal_entity"),
  taxId: text("tax_id"),
  currency: text("currency").default("ZAR"),
  timezone: text("timezone").default("Africa/Johannesburg"),
  address: text("address"), // JSON address object
  contactInfo: text("contact_info"), // JSON contact information
  settings: text("settings"), // JSON company-specific settings
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  parentCompanyId: text("parent_company_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_transactions = sqliteTable("erp_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  transactionId: text("transaction_id").notNull(),
  transactionType: text("transaction_type").$type<"sales_order" | "purchase_order" | "invoice" | "payment" | "inventory" | "payroll">().notNull(),
  sourceModule: text("source_module"), // e.g., "sales", "procurement", "finance"
  targetModule: text("target_module"),
  status: text("status").$type<"pending" | "processing" | "completed" | "failed" | "cancelled">().default("pending"),
  priority: text("priority").$type<"low" | "medium" | "high" | "critical">().default("medium"),
  data: text("data"), // JSON transaction data
  metadata: text("metadata"), // JSON additional metadata
  companyId: text("company_id").references(() => multi_company_config.id),
  createdBy: integer("created_by").references(() => users.id),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_reports = sqliteTable("erp_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  reportType: text("report_type").$type<"financial" | "operational" | "compliance" | "performance" | "custom">().notNull(),
  category: text("category"),
  parameters: text("parameters"), // JSON report parameters
  queryDefinition: text("query_definition"), // SQL or JSON query definition
  visualizationConfig: text("visualization_config"), // JSON chart/visualization config
  schedule: text("schedule"), // cron expression for automated reports
  recipients: text("recipients"), // JSON email recipients
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  tenantId: text("tenant_id").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const erp_audit_trail = sqliteTable("erp_audit_trail", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entityType: text("entity_type").notNull(), // e.g., "customer", "invoice", "product"
  entityId: text("entity_id").notNull(),
  action: text("action").$type<"create" | "update" | "delete" | "sync" | "export" | "import">().notNull(),
  oldValues: text("old_values"), // JSON
  newValues: text("new_values"), // JSON
  source: text("source"), // "erp_sync", "manual", "api", "workflow"
  sourceId: text("source_id"), // ID from source system
  userId: integer("user_id").references(() => users.id),
  companyId: text("company_id").references(() => multi_company_config.id),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});