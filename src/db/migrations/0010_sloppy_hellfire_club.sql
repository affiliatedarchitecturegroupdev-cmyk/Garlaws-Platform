CREATE TABLE `ai_workflows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`status` text DEFAULT 'active',
	`trigger_type` text DEFAULT 'manual',
	`schedule_config` text,
	`trigger_config` text,
	`priority` text DEFAULT 'medium',
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `automation_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workflow_id` integer NOT NULL,
	`name` text NOT NULL,
	`condition` text NOT NULL,
	`action` text NOT NULL,
	`action_config` text,
	`order` integer DEFAULT 0,
	`is_enabled` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`workflow_id`) REFERENCES `ai_workflows`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `code_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`task_id` integer,
	`submitted_by` integer NOT NULL,
	`reviewed_by` integer,
	`code_content` text NOT NULL,
	`review_status` text DEFAULT 'pending',
	`issues_found` text,
	`suggestions` text,
	`score` real,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ml_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`model_type` text NOT NULL,
	`algorithm` text,
	`parameters` text,
	`training_data` text,
	`model_url` text,
	`accuracy` real,
	`status` text DEFAULT 'training',
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `model_predictions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_id` integer NOT NULL,
	`input_data` text,
	`prediction` text,
	`confidence` real,
	`timestamp` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nlp_interactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` integer,
	`session_id` text,
	`input_text` text NOT NULL,
	`response_text` text,
	`intent` text,
	`entities` text,
	`sentiment` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
