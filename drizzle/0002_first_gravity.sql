CREATE TABLE "telegram_active_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"chat_id" varchar(100) NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_settings" ADD COLUMN "telegram_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD COLUMN "discord_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD COLUMN "telegram_bot_token" varchar(255);--> statement-breakpoint
ALTER TABLE "telegram_active_chats" ADD CONSTRAINT "telegram_active_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;