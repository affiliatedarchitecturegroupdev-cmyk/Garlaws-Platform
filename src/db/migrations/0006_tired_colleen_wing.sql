CREATE TABLE `alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`alert_type` text NOT NULL,
	`severity` text DEFAULT 'medium',
	`title` text NOT NULL,
	`message` text NOT NULL,
	`source_id` integer,
	`source_type` text,
	`conditions` text,
	`recipients` text,
	`status` text DEFAULT 'active',
	`acknowledged_by` integer,
	`acknowledged_at` integer,
	`resolved_at` integer,
	`created_at` integer,
	FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `analytics_data` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tenant_id` text NOT NULL,
	`data_type` text NOT NULL,
	`category` text,
	`key` text NOT NULL,
	`value` real,
	`data` text,
	`timestamp` integer NOT NULL,
	`source` text,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `dashboard_widgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dashboard_id` integer NOT NULL,
	`widget_type` text NOT NULL,
	`title` text NOT NULL,
	`position` text,
	`config` text,
	`data_source` text,
	`refresh_interval` integer,
	`is_visible` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`dashboard_id`) REFERENCES `dashboards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dashboards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`user_id` integer,
	`is_public` integer DEFAULT false,
	`is_default` integer DEFAULT false,
	`layout` text,
	`filters` text,
	`refresh_interval` integer,
	`last_refreshed` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`subcategory` text,
	`unit` text DEFAULT 'piece',
	`unit_cost` real NOT NULL,
	`selling_price` real,
	`reorder_point` integer DEFAULT 10,
	`max_stock` integer,
	`current_stock` integer DEFAULT 0,
	`reserved_stock` integer DEFAULT 0,
	`available_stock` integer DEFAULT 0,
	`supplier_id` integer,
	`warehouse_id` integer,
	`location` text,
	`barcode` text,
	`is_active` integer DEFAULT true,
	`tags` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_items_sku_unique` ON `inventory_items` (`sku`);--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventory_item_id` integer NOT NULL,
	`movement_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`from_warehouse_id` integer,
	`to_warehouse_id` integer,
	`reference_id` integer,
	`reference_type` text,
	`reason` text,
	`performed_by` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kpi_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kpi_id` integer NOT NULL,
	`value` real NOT NULL,
	`timestamp` integer NOT NULL,
	`period` text,
	`metadata` text,
	FOREIGN KEY (`kpi_id`) REFERENCES `kpis`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kpis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`category` text NOT NULL,
	`metric` text NOT NULL,
	`data_source` text,
	`calculation` text,
	`target` real,
	`unit` text,
	`frequency` text DEFAULT 'daily',
	`alert_thresholds` text,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `predictive_models` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`model_type` text NOT NULL,
	`target_variable` text NOT NULL,
	`features` text,
	`algorithm` text,
	`parameters` text,
	`accuracy` real,
	`status` text DEFAULT 'training',
	`last_trained` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `procurement_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`supplier_id` integer NOT NULL,
	`warehouse_id` integer NOT NULL,
	`status` text DEFAULT 'draft',
	`order_date` integer NOT NULL,
	`expected_delivery_date` integer,
	`actual_delivery_date` integer,
	`total_amount` real NOT NULL,
	`currency` text DEFAULT 'ZAR',
	`payment_status` text DEFAULT 'unpaid',
	`notes` text,
	`approved_by` integer,
	`approved_at` integer,
	`created_by` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `procurement_orders_order_number_unique` ON `procurement_orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`procurement_order_id` integer NOT NULL,
	`inventory_item_id` integer,
	`description` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	`received_quantity` integer DEFAULT 0,
	`status` text DEFAULT 'pending',
	`created_at` integer,
	FOREIGN KEY (`procurement_order_id`) REFERENCES `procurement_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `report_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer NOT NULL,
	`name` text NOT NULL,
	`schedule_type` text NOT NULL,
	`schedule_config` text,
	`recipients` text,
	`format` text DEFAULT 'pdf',
	`is_active` integer DEFAULT true,
	`last_run` integer,
	`next_run` integer,
	`created_at` integer,
	FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`tenant_id` text NOT NULL,
	`report_type` text NOT NULL,
	`category` text,
	`template` text,
	`filters` text,
	`parameters` text,
	`format` text DEFAULT 'pdf',
	`status` text DEFAULT 'draft',
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shipment_number` text NOT NULL,
	`procurement_order_id` integer,
	`carrier` text NOT NULL,
	`tracking_number` text,
	`status` text DEFAULT 'preparing',
	`origin_warehouse_id` integer,
	`destination_warehouse_id` integer,
	`estimated_delivery_date` integer,
	`actual_delivery_date` integer,
	`weight` real,
	`dimensions` text,
	`cost` real,
	`currency` text DEFAULT 'ZAR',
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`procurement_order_id`) REFERENCES `procurement_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`origin_warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destination_warehouse_id`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipments_shipment_number_unique` ON `shipments` (`shipment_number`);--> statement-breakpoint
CREATE TABLE `supplier_performance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`supplier_id` integer NOT NULL,
	`period` text NOT NULL,
	`on_time_delivery` real,
	`quality_rating` real,
	`responsiveness` real,
	`total_orders` integer,
	`total_value` real,
	`currency` text DEFAULT 'ZAR',
	`created_at` integer,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`email` text NOT NULL,
	`phone` text,
	`address` text,
	`city` text,
	`province` text,
	`postal_code` text,
	`country` text DEFAULT 'South Africa',
	`tax_id` text,
	`payment_terms` text DEFAULT 'net_30',
	`rating` real,
	`is_active` integer DEFAULT true,
	`categories` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`province` text NOT NULL,
	`postal_code` text,
	`country` text DEFAULT 'South Africa',
	`capacity` integer,
	`type` text DEFAULT 'local',
	`manager_id` integer,
	`is_active` integer DEFAULT true,
	`coordinates` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`manager_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `warehouses_code_unique` ON `warehouses` (`code`);