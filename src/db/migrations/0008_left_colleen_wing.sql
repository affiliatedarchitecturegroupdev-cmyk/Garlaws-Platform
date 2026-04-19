CREATE TABLE `access_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`refresh_token` text,
	`token_type` text DEFAULT 'bearer',
	`expires_at` integer NOT NULL,
	`issued_at` integer,
	`revoked_at` integer,
	`ip_address` text,
	`user_agent` text,
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `compliance_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`regulation` text NOT NULL,
	`requirement` text NOT NULL,
	`status` text DEFAULT 'pending_review',
	`evidence` text,
	`review_date` integer,
	`next_review_date` integer,
	`reviewer_id` integer,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `data_encryption_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key_id` text NOT NULL,
	`version` integer NOT NULL,
	`algorithm` text DEFAULT 'AES-256',
	`key_data` text,
	`status` text DEFAULT 'active',
	`created_at` integer,
	`expires_at` integer,
	`rotated_at` integer,
	`created_by` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`resource` text NOT NULL,
	`action` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`is_system_permission` integer DEFAULT false,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`permission_id` integer NOT NULL,
	`granted_by` integer,
	`granted_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `user_roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`granted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text,
	`event_type` text NOT NULL,
	`severity` text DEFAULT 'medium',
	`user_id` integer,
	`ip_address` text,
	`user_agent` text,
	`location` text,
	`device_info` text,
	`resource` text,
	`action` text,
	`old_values` text,
	`new_values` text,
	`success` integer DEFAULT true,
	`error_message` text,
	`session_id` text,
	`correlation_id` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `security_incidents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`incident_type` text NOT NULL,
	`severity` text DEFAULT 'medium',
	`status` text DEFAULT 'detected',
	`detected_at` integer,
	`resolved_at` integer,
	`assigned_to` integer,
	`impact` text,
	`root_cause` text,
	`resolution` text,
	`preventive_actions` text,
	`affected_users` integer DEFAULT 0,
	`affected_records` integer DEFAULT 0,
	`financial_impact` real,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `security_policies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`policy_type` text NOT NULL,
	`rules` text,
	`is_active` integer DEFAULT true,
	`enforcement_level` text DEFAULT 'moderate',
	`tenant_id` text,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `threat_intelligence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`threat_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`threat_type` text NOT NULL,
	`severity` text DEFAULT 'medium',
	`source` text,
	`indicators` text,
	`mitigation` text,
	`is_active` integer DEFAULT true,
	`first_seen` integer,
	`last_seen` integer,
	`confidence` real,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `user_role_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`tenant_id` text,
	`assigned_by` integer,
	`assigned_at` integer,
	`expires_at` integer,
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `user_roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text,
	`is_system_role` integer DEFAULT false,
	`permissions` text,
	`created_at` integer,
	`updated_at` integer
);
