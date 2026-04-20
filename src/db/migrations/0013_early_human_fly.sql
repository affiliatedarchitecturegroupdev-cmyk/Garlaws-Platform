CREATE TABLE `bugs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`tenant_id` text NOT NULL,
	`project_id` integer,
	`test_run_id` integer,
	`severity` text DEFAULT 'medium',
	`priority` text DEFAULT 'medium',
	`status` text DEFAULT 'open',
	`type` text DEFAULT 'bug',
	`reported_by` integer,
	`assigned_to` integer,
	`tags` text,
	`attachments` text,
	`reproduction_steps` text,
	`expected_behavior` text,
	`actual_behavior` text,
	`environment` text,
	`browser` text,
	`os` text,
	`resolution` text,
	`resolved_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`test_run_id`) REFERENCES `test_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ci_cd_pipelines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`project_id` integer,
	`repository` text,
	`branch` text DEFAULT 'main',
	`config` text,
	`status` text DEFAULT 'active',
	`last_build_id` integer,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`last_build_id`) REFERENCES `pipeline_builds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `code_quality_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`commit_hash` text,
	`branch` text DEFAULT 'main',
	`tool` text NOT NULL,
	`status` text DEFAULT 'passed',
	`score` real,
	`issues` text,
	`metrics` text,
	`generated_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_audit_trail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`old_values` text,
	`new_values` text,
	`source` text,
	`source_id` text,
	`user_id` integer,
	`company_id` text,
	`timestamp` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`company_id`) REFERENCES `multi_company_config`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_connectors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`version` text,
	`connection_type` text DEFAULT 'api',
	`endpoint` text,
	`authentication` text,
	`credentials` text,
	`status` text DEFAULT 'configuring',
	`last_sync` integer,
	`sync_frequency` text DEFAULT 'daily',
	`tenant_id` text NOT NULL,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `erp_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`report_type` text NOT NULL,
	`category` text,
	`parameters` text,
	`query_definition` text,
	`visualization_config` text,
	`schedule` text,
	`recipients` text,
	`is_public` integer DEFAULT false,
	`tenant_id` text NOT NULL,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_sync_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`connector_id` integer NOT NULL,
	`module_id` integer,
	`sync_type` text DEFAULT 'incremental',
	`direction` text DEFAULT 'bidirectional',
	`status` text DEFAULT 'running',
	`records_processed` integer DEFAULT 0,
	`records_created` integer DEFAULT 0,
	`records_updated` integer DEFAULT 0,
	`records_failed` integer DEFAULT 0,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration` integer,
	`error_message` text,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`connector_id`) REFERENCES `erp_connectors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`module_id`) REFERENCES `erp_modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` text NOT NULL,
	`transaction_type` text NOT NULL,
	`source_module` text,
	`target_module` text,
	`status` text DEFAULT 'pending',
	`priority` text DEFAULT 'medium',
	`data` text,
	`metadata` text,
	`company_id` text,
	`created_by` integer,
	`processed_at` integer,
	`created_at` integer,
	FOREIGN KEY (`company_id`) REFERENCES `multi_company_config`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_transformations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`source_system` text,
	`target_system` text,
	`entity_type` text,
	`mapping_rules` text,
	`transformation_logic` text,
	`validation_rules` text,
	`is_active` integer DEFAULT true,
	`tenant_id` text NOT NULL,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `erp_workflows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`workflow_type` text NOT NULL,
	`trigger` text DEFAULT 'manual',
	`trigger_config` text,
	`steps` text,
	`conditions` text,
	`approvals` text,
	`notifications` text,
	`is_active` integer DEFAULT true,
	`tenant_id` text NOT NULL,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `multi_company_config` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`legal_entity` text,
	`tax_id` text,
	`currency` text DEFAULT 'ZAR',
	`timezone` text DEFAULT 'Africa/Johannesburg',
	`address` text,
	`contact_info` text,
	`settings` text,
	`is_active` integer DEFAULT true,
	`parent_company_id` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `performance_test_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`performance_test_id` integer NOT NULL,
	`status` text DEFAULT 'running',
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration` integer,
	`results` text,
	`thresholds` text,
	`passed` integer,
	`error_message` text,
	`created_at` integer,
	FOREIGN KEY (`performance_test_id`) REFERENCES `performance_tests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `performance_tests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`test_type` text DEFAULT 'load',
	`target_url` text NOT NULL,
	`config` text,
	`script` text,
	`status` text DEFAULT 'draft',
	`schedule` text,
	`last_run_id` integer,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`last_run_id`) REFERENCES `performance_test_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pipeline_builds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pipeline_id` integer NOT NULL,
	`build_number` integer NOT NULL,
	`commit_hash` text,
	`branch` text,
	`triggered_by` text,
	`triggered_by_user` integer,
	`status` text DEFAULT 'pending',
	`start_time` integer,
	`end_time` integer,
	`duration` integer,
	`stages` text,
	`artifacts` text,
	`test_results` text,
	`code_quality_report` text,
	`security_scan_report` text,
	`deployment_url` text,
	`error_message` text,
	`created_at` integer,
	FOREIGN KEY (`pipeline_id`) REFERENCES `ci_cd_pipelines`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`triggered_by_user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quality_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`project_id` integer,
	`metric_type` text NOT NULL,
	`metric_name` text NOT NULL,
	`value` real NOT NULL,
	`target` real,
	`unit` text,
	`date` integer NOT NULL,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `security_scan_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`security_scan_id` integer NOT NULL,
	`status` text DEFAULT 'running',
	`start_time` integer NOT NULL,
	`end_time` integer,
	`duration` integer,
	`vulnerabilities` text,
	`severity_counts` text,
	`compliance_score` real,
	`report_url` text,
	`passed` integer,
	`error_message` text,
	`created_at` integer,
	FOREIGN KEY (`security_scan_id`) REFERENCES `security_scans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `security_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`scan_type` text NOT NULL,
	`target` text,
	`tool` text NOT NULL,
	`config` text,
	`status` text DEFAULT 'scheduled',
	`schedule` text,
	`last_run_id` integer,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`last_run_id`) REFERENCES `security_scan_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `test_cases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_suite_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` text DEFAULT 'medium',
	`status` text DEFAULT 'draft',
	`test_steps` text,
	`expected_result` text,
	`preconditions` text,
	`tags` text,
	`automation_status` text DEFAULT 'manual',
	`automation_script` text,
	`estimated_duration` integer,
	`created_by` integer,
	`assigned_to` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`test_suite_id`) REFERENCES `test_suites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `test_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_run_id` integer NOT NULL,
	`test_case_id` integer,
	`test_name` text NOT NULL,
	`status` text NOT NULL,
	`duration` integer,
	`error_message` text,
	`stack_trace` text,
	`screenshots` text,
	`logs` text,
	`metadata` text,
	`created_at` integer,
	FOREIGN KEY (`test_run_id`) REFERENCES `test_runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`test_case_id`) REFERENCES `test_cases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `test_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`test_suite_id` integer,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'scheduled',
	`environment` text DEFAULT 'development',
	`triggered_by` text,
	`triggered_by_user` integer,
	`start_time` integer,
	`end_time` integer,
	`duration` integer,
	`total_tests` integer DEFAULT 0,
	`passed_tests` integer DEFAULT 0,
	`failed_tests` integer DEFAULT 0,
	`skipped_tests` integer DEFAULT 0,
	`config` text,
	`results` text,
	`created_at` integer,
	FOREIGN KEY (`test_suite_id`) REFERENCES `test_suites`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`triggered_by_user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `test_suites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`project_id` integer,
	`test_type` text NOT NULL,
	`framework` text,
	`status` text DEFAULT 'active',
	`schedule` text,
	`environment` text DEFAULT 'development',
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
