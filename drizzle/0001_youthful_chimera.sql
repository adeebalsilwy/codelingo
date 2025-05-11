CREATE TABLE IF NOT EXISTS "chapter_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"content" text DEFAULT '',
	"content_type" "content_type" DEFAULT 'RICH_TEXT' NOT NULL,
	"media_url" text DEFAULT '',
	"order" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "content";--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "content_type";--> statement-breakpoint
ALTER TABLE "chapters" DROP COLUMN IF EXISTS "media_url";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chapter_contents" ADD CONSTRAINT "chapter_contents_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
