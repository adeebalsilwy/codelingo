DROP TABLE "chapter_contents";--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "content" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "video_youtube" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "video_uploaded" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "chapters" ADD COLUMN "pdf_uploaded" text DEFAULT '';