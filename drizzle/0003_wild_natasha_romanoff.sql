ALTER TABLE "chapters" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "chapters" ALTER COLUMN "content" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chapters" ALTER COLUMN "video_youtube" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "chapters" ALTER COLUMN "video_youtube" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "created_at" timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "video_uploaded";--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "pdf_uploaded";