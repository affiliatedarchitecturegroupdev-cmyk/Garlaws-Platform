CREATE TABLE `ab_test_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_id` integer NOT NULL,
	`metric_name` text NOT NULL,
	`model_a_value` real,
	`model_b_value` real,
	`p_value` real,
	`is_statistically_significant` integer,
	`confidence_interval` text,
	`timestamp` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`test_id`) REFERENCES `ab_tests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ab_tests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`model_a_id` integer,
	`model_b_id` integer,
	`traffic_split` real,
	`status` text DEFAULT 'draft',
	`start_date` integer,
	`end_date` integer,
	`hypothesis` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`model_a_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_b_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dataset_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dataset_id` integer NOT NULL,
	`version` text NOT NULL,
	`parent_version_id` integer,
	`changes` text,
	`storage_location` text NOT NULL,
	`size` integer,
	`row_count` integer,
	`created_at` integer,
	FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_version_id`) REFERENCES `dataset_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `datasets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`version` text NOT NULL,
	`dataset_type` text DEFAULT 'training',
	`format` text DEFAULT 'csv',
	`storage_location` text NOT NULL,
	`size` integer,
	`row_count` integer,
	`column_count` integer,
	`schema` text,
	`statistics` text,
	`tags` text,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `experiment_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`experiment_id` integer NOT NULL,
	`run_number` integer NOT NULL,
	`status` text DEFAULT 'running',
	`parameters` text,
	`metrics` text,
	`artifacts` text,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`created_at` integer,
	FOREIGN KEY (`experiment_id`) REFERENCES `experiments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `experiments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`model_id` integer,
	`dataset_id` integer,
	`status` text DEFAULT 'running',
	`hyperparameters` text,
	`configuration` text,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feature_store` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`feature_type` text DEFAULT 'numerical',
	`data_type` text NOT NULL,
	`default_value` text,
	`validation_rules` text,
	`statistics` text,
	`version` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ml_pipelines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`version` text NOT NULL,
	`pipeline_type` text DEFAULT 'training',
	`definition` text,
	`schedule` text,
	`is_active` integer DEFAULT true,
	`last_run_id` integer,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`last_run_id`) REFERENCES `pipeline_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `model_deployments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`model_id` integer NOT NULL,
	`environment` text DEFAULT 'development',
	`deployment_type` text DEFAULT 'rest',
	`endpoint_url` text,
	`endpoint_config` text,
	`status` text DEFAULT 'deploying',
	`replicas` integer DEFAULT 1,
	`cpu_request` real,
	`memory_request` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `model_explainability` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_id` integer NOT NULL,
	`explanation_type` text NOT NULL,
	`feature_importance` text,
	`explanation_data` text,
	`sample_count` integer,
	`generated_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `model_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_id` integer NOT NULL,
	`deployment_id` integer,
	`metric_name` text NOT NULL,
	`metric_value` real NOT NULL,
	`timestamp` integer NOT NULL,
	`labels` text,
	`created_at` integer,
	FOREIGN KEY (`model_id`) REFERENCES `ml_models`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deployment_id`) REFERENCES `model_deployments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pipeline_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pipeline_id` integer NOT NULL,
	`run_number` integer NOT NULL,
	`status` text DEFAULT 'running',
	`triggered_by` text,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`steps` text,
	`artifacts` text,
	`error_message` text,
	`created_at` integer,
	FOREIGN KEY (`pipeline_id`) REFERENCES `ml_pipelines`(`id`) ON UPDATE no action ON DELETE no action
);
