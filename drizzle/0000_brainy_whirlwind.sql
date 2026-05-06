CREATE TABLE "device_commands_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"command" varchar(10) NOT NULL,
	"triggered_by" varchar(20) NOT NULL,
	"price_at_time" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"connection_type" varchar(20) NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer,
	"topic" varchar(255),
	"threshold" numeric(10, 2),
	"is_critical" boolean DEFAULT false NOT NULL,
	"override_active" boolean DEFAULT false NOT NULL,
	"override_state" boolean,
	"current_state" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"channel" varchar(20),
	"telegram_chat_id" varchar(100),
	"discord_webhook_url" varchar(500),
	"critical_price_threshold" numeric(10, 2),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp NOT NULL,
	"price_eur_mwh" numeric(10, 2) NOT NULL,
	"source" varchar(50) DEFAULT 'elering' NOT NULL,
	CONSTRAINT "prices_timestamp_unique" UNIQUE("timestamp")
);
--> statement-breakpoint
CREATE TABLE "savings_config" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"fixed_rate_eur_kwh" numeric(10, 4) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "device_commands_log" ADD CONSTRAINT "device_commands_log_device_id_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_config" ADD CONSTRAINT "savings_config_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;