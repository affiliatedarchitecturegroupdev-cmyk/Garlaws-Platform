CREATE TABLE `bank_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`account_name` text NOT NULL,
	`account_number` text NOT NULL,
	`bank_name` text NOT NULL,
	`account_type` text DEFAULT 'checking',
	`currency` text DEFAULT 'ZAR',
	`opening_balance` real DEFAULT 0,
	`current_balance` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bank_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bank_account_id` integer NOT NULL,
	`transaction_date` integer NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`transaction_type` text NOT NULL,
	`reference` text,
	`category` text DEFAULT 'other',
	`reconciled` integer DEFAULT false,
	`reconciliation_id` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reconciliation_id`) REFERENCES `reconciliations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`parent_id` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`category_id` integer,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'ZAR',
	`expense_date` integer NOT NULL,
	`payment_method` text,
	`receipt_url` text,
	`is_reimbursable` integer DEFAULT false,
	`reimbursed` integer DEFAULT false,
	`tags` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `financial_audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` integer NOT NULL,
	`old_values` text,
	`new_values` text,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`description` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	`tax_rate` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoice_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`payment_id` integer,
	`amount` real NOT NULL,
	`payment_date` integer NOT NULL,
	`payment_method` text,
	`transaction_id` text,
	`reconciled` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer,
	`invoice_number` text NOT NULL,
	`issuer_id` integer NOT NULL,
	`recipient_id` integer NOT NULL,
	`issue_date` integer NOT NULL,
	`due_date` integer NOT NULL,
	`subtotal` real NOT NULL,
	`tax_amount` real DEFAULT 0,
	`total_amount` real NOT NULL,
	`currency` text DEFAULT 'ZAR',
	`status` text DEFAULT 'draft',
	`notes` text,
	`payment_terms` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issuer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE TABLE `reconciliation_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reconciliation_id` integer NOT NULL,
	`bank_transaction_id` integer,
	`system_transaction_id` integer,
	`amount` real NOT NULL,
	`match_type` text DEFAULT 'exact',
	`reconciled` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`reconciliation_id`) REFERENCES `reconciliations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bank_transaction_id`) REFERENCES `bank_transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`system_transaction_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reconciliations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bank_account_id` integer NOT NULL,
	`reconciliation_date` integer NOT NULL,
	`opening_balance` real NOT NULL,
	`closing_balance` real NOT NULL,
	`reconciled_amount` real DEFAULT 0,
	`status` text DEFAULT 'in_progress',
	`notes` text,
	`created_by` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
