import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_app_users_selected_language" AS ENUM('en', 'ar', 'fa');
  CREATE TYPE "public"."enum_app_users_selected_theme" AS ENUM('light', 'dark', 'system');
  CREATE TABLE "app_users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"supabase_id" varchar NOT NULL,
  	"email" varchar,
  	"selected_background_id" integer,
  	"selected_language" "enum_app_users_selected_language" DEFAULT 'en',
  	"selected_theme" "enum_app_users_selected_theme" DEFAULT 'system',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "conversations" RENAME COLUMN "user_id" TO "app_user_id";
  -- Convert varchar column to integer and set existing values to NULL (old UUIDs won't match new integer IDs)
  ALTER TABLE "conversations" ALTER COLUMN "app_user_id" TYPE integer USING NULL;
  ALTER TABLE "users" DROP CONSTRAINT "users_selected_background_id_wallpapers_id_fk";
  
  DROP INDEX "users_selected_background_idx";
  DROP INDEX "conversations_user_id_idx";
  ALTER TABLE "conversations" ALTER COLUMN "title" SET DEFAULT 'New Chat';
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "app_users_id" integer;
  ALTER TABLE "app_users" ADD CONSTRAINT "app_users_selected_background_id_wallpapers_id_fk" FOREIGN KEY ("selected_background_id") REFERENCES "public"."wallpapers"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "app_users_supabase_id_idx" ON "app_users" USING btree ("supabase_id");
  CREATE INDEX "app_users_selected_background_idx" ON "app_users" USING btree ("selected_background_id");
  CREATE INDEX "app_users_updated_at_idx" ON "app_users" USING btree ("updated_at");
  CREATE INDEX "app_users_created_at_idx" ON "app_users" USING btree ("created_at");
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_app_user_id_app_users_id_fk" FOREIGN KEY ("app_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_app_users_fk" FOREIGN KEY ("app_users_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "conversations_app_user_idx" ON "conversations" USING btree ("app_user_id");
  CREATE INDEX "payload_locked_documents_rels_app_users_id_idx" ON "payload_locked_documents_rels" USING btree ("app_users_id");
  ALTER TABLE "users" DROP COLUMN "selected_background_id";
  ALTER TABLE "users" DROP COLUMN "selected_language";
  ALTER TABLE "users" DROP COLUMN "selected_theme";
  DROP TYPE "public"."enum_users_selected_language";
  DROP TYPE "public"."enum_users_selected_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_app_users_selected_language" RENAME TO "enum_users_selected_language";
  ALTER TYPE "public"."enum_app_users_selected_theme" RENAME TO "enum_users_selected_theme";
  ALTER TABLE "app_users" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "app_users" CASCADE;
  ALTER TABLE "conversations" RENAME COLUMN "app_user_id" TO "user_id";
  ALTER TABLE "conversations" DROP CONSTRAINT "conversations_app_user_id_app_users_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_app_users_fk";
  
  DROP INDEX "conversations_app_user_idx";
  DROP INDEX "payload_locked_documents_rels_app_users_id_idx";
  ALTER TABLE "conversations" ALTER COLUMN "title" DROP DEFAULT;
  ALTER TABLE "users" ADD COLUMN "selected_background_id" integer;
  ALTER TABLE "users" ADD COLUMN "selected_language" "enum_users_selected_language";
  ALTER TABLE "users" ADD COLUMN "selected_theme" "enum_users_selected_theme";
  ALTER TABLE "users" ADD CONSTRAINT "users_selected_background_id_wallpapers_id_fk" FOREIGN KEY ("selected_background_id") REFERENCES "public"."wallpapers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_selected_background_idx" ON "users" USING btree ("selected_background_id");
  CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "app_users_id";
  DROP TYPE "public"."enum_users_role";`)
}
