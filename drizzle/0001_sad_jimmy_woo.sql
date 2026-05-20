ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "host" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "power_consumption" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "email" TO "username";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");