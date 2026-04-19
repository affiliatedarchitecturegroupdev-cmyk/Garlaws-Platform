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
  parentId: integer("parent_id").references(() => expense_categories.id),
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