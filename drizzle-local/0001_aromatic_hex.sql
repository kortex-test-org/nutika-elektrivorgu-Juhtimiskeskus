ALTER TABLE "devices" ALTER COLUMN "host" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "power_consumption" numeric(10, 2);