CREATE TABLE `api_analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`api_key_id` integer,
	`endpoint` text NOT NULL,
	`method` text NOT NULL,
	`status_code` integer,
	`response_time` integer,
	`request_size` integer,
	`response_size` integer,
	`ip_address` text,
	`user_agent` text,
	`timestamp` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`key_hash` text NOT NULL,
	`key_prefix` text NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` integer,
	`permissions` text,
	`rate_limit` integer,
	`expires_at` integer,
	`last_used` integer,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `data_transformations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`source_schema` text,
	`target_schema` text,
	`mapping_rules` text,
	`transformation_logic` text,
	`is_active` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `external_integrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`type` text DEFAULT 'oauth',
	`config` text,
	`credentials` text,
	`tenant_id` text NOT NULL,
	`created_by` integer,
	`is_active` integer DEFAULT true,
	`status` text DEFAULT 'pending',
	`last_sync` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`identifier` text NOT NULL,
	`type` text NOT NULL,
	`limit` integer NOT NULL,
	`window` integer NOT NULL,
	`current` integer DEFAULT 0,
	`reset_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `sso_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`external_id` text NOT NULL,
	`email` text NOT NULL,
	`metadata` text,
	`last_login` integer,
	`created_at` integer,
	FOREIGN KEY (`provider_id`) REFERENCES `sso_providers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sso_providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`tenant_id` text NOT NULL,
	`config` text,
	`credentials` text,
	`is_active` integer DEFAULT true,
	`sync_user_profile` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `sync_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer,
	`integration_id` integer,
	`status` text DEFAULT 'running',
	`records_processed` integer DEFAULT 0,
	`records_created` integer DEFAULT 0,
	`records_updated` integer DEFAULT 0,
	`records_failed` integer DEFAULT 0,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`error_message` text,
	`details` text,
	`created_at` integer,
	FOREIGN KEY (`schedule_id`) REFERENCES `sync_schedules`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`integration_id`) REFERENCES `external_integrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sync_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`integration_id` integer NOT NULL,
	`sync_type` text DEFAULT 'incremental',
	`schedule` text NOT NULL,
	`config` text,
	`is_active` integer DEFAULT true,
	`last_sync` integer,
	`next_sync` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`integration_id`) REFERENCES `external_integrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_id` integer NOT NULL,
	`event` text NOT NULL,
	`payload` text NOT NULL,
	`response_code` integer,
	`response_body` text,
	`success` integer DEFAULT false,
	`attempt` integer DEFAULT 1,
	`delivered_at` integer,
	`error_message` text,
	`created_at` integer,
	FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`tenant_id` text NOT NULL,
	`secret` text,
	`events` text,
	`is_active` integer DEFAULT true,
	`headers` text,
	`retry_policy` text,
	`last_triggered` integer,
	`failure_count` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
