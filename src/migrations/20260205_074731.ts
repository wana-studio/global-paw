import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "timezones_locales" CASCADE;
  ALTER TABLE "wallpaper_categories_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "wallpapers_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "cities_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "calendar_events_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "search_suggestions_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  ALTER TABLE "ai_suggestions_locales" ALTER COLUMN "_locale" SET DATA TYPE text;
  DROP TYPE "public"."_locales";
  CREATE TYPE "public"."_locales" AS ENUM('en', 'ar');
  ALTER TABLE "wallpaper_categories_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "wallpapers_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "cities_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "calendar_events_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "search_suggestions_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  ALTER TABLE "ai_suggestions_locales" ALTER COLUMN "_locale" SET DATA TYPE "public"."_locales" USING "_locale"::"public"."_locales";
  
  DO $$ 
  BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timezones' AND column_name='label') THEN
      ALTER TABLE "timezones" ADD COLUMN "label" varchar NOT NULL;
    END IF;
  END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."_locales" ADD VALUE 'fa';
  CREATE TABLE "timezones_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "timezones_locales" ADD CONSTRAINT "timezones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timezones"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "timezones_locales_locale_parent_id_unique" ON "timezones_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "timezones" DROP COLUMN "label";`)
}
