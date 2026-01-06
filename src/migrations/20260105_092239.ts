import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ar', 'fa');
  CREATE TYPE "public"."enum_users_selected_language" AS ENUM('en', 'ar', 'fa');
  CREATE TYPE "public"."enum_users_selected_theme" AS ENUM('light', 'dark', 'system');
  CREATE TYPE "public"."enum_messages_role" AS ENUM('user', 'assistant', 'system');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"selected_background_id" integer,
  	"selected_language" "enum_users_selected_language",
  	"selected_theme" "enum_users_selected_theme",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "wallpaper_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wallpaper_categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "wallpapers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer NOT NULL,
  	"category_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "wallpapers_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "cities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"latitude" numeric NOT NULL,
  	"longitude" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cities_locales" (
  	"name" varchar NOT NULL,
  	"country" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "calendar_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "calendar_events_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "search_suggestions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_suggestions_locales" (
  	"keyword" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "ai_suggestions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ai_suggestions_locales" (
  	"prompt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "timezones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"offset" varchar NOT NULL,
  	"timezone_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "timezones_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "conversations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" varchar NOT NULL,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"conversation_id" integer NOT NULL,
  	"role" "enum_messages_role" NOT NULL,
  	"content" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"wallpaper_categories_id" integer,
  	"wallpapers_id" integer,
  	"cities_id" integer,
  	"calendar_events_id" integer,
  	"search_suggestions_id" integer,
  	"ai_suggestions_id" integer,
  	"timezones_id" integer,
  	"conversations_id" integer,
  	"messages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_selected_background_id_wallpapers_id_fk" FOREIGN KEY ("selected_background_id") REFERENCES "public"."wallpapers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wallpaper_categories_locales" ADD CONSTRAINT "wallpaper_categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wallpaper_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wallpapers" ADD CONSTRAINT "wallpapers_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wallpapers" ADD CONSTRAINT "wallpapers_category_id_wallpaper_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wallpaper_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wallpapers_locales" ADD CONSTRAINT "wallpapers_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."wallpapers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_locales" ADD CONSTRAINT "cities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calendar_events_locales" ADD CONSTRAINT "calendar_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_suggestions" ADD CONSTRAINT "search_suggestions_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_suggestions_locales" ADD CONSTRAINT "search_suggestions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ai_suggestions_locales" ADD CONSTRAINT "ai_suggestions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timezones_locales" ADD CONSTRAINT "timezones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."timezones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wallpaper_categories_fk" FOREIGN KEY ("wallpaper_categories_id") REFERENCES "public"."wallpaper_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_wallpapers_fk" FOREIGN KEY ("wallpapers_id") REFERENCES "public"."wallpapers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calendar_events_fk" FOREIGN KEY ("calendar_events_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_suggestions_fk" FOREIGN KEY ("search_suggestions_id") REFERENCES "public"."search_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_suggestions_fk" FOREIGN KEY ("ai_suggestions_id") REFERENCES "public"."ai_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_timezones_fk" FOREIGN KEY ("timezones_id") REFERENCES "public"."timezones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_conversations_fk" FOREIGN KEY ("conversations_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_messages_fk" FOREIGN KEY ("messages_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_selected_background_idx" ON "users" USING btree ("selected_background_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "wallpaper_categories_updated_at_idx" ON "wallpaper_categories" USING btree ("updated_at");
  CREATE INDEX "wallpaper_categories_created_at_idx" ON "wallpaper_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "wallpaper_categories_locales_locale_parent_id_unique" ON "wallpaper_categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "wallpapers_file_idx" ON "wallpapers" USING btree ("file_id");
  CREATE INDEX "wallpapers_category_idx" ON "wallpapers" USING btree ("category_id");
  CREATE INDEX "wallpapers_updated_at_idx" ON "wallpapers" USING btree ("updated_at");
  CREATE INDEX "wallpapers_created_at_idx" ON "wallpapers" USING btree ("created_at");
  CREATE UNIQUE INDEX "wallpapers_locales_locale_parent_id_unique" ON "wallpapers_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cities_updated_at_idx" ON "cities" USING btree ("updated_at");
  CREATE INDEX "cities_created_at_idx" ON "cities" USING btree ("created_at");
  CREATE UNIQUE INDEX "cities_locales_locale_parent_id_unique" ON "cities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "calendar_events_updated_at_idx" ON "calendar_events" USING btree ("updated_at");
  CREATE INDEX "calendar_events_created_at_idx" ON "calendar_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "calendar_events_locales_locale_parent_id_unique" ON "calendar_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "search_suggestions_logo_idx" ON "search_suggestions" USING btree ("logo_id");
  CREATE INDEX "search_suggestions_updated_at_idx" ON "search_suggestions" USING btree ("updated_at");
  CREATE INDEX "search_suggestions_created_at_idx" ON "search_suggestions" USING btree ("created_at");
  CREATE UNIQUE INDEX "search_suggestions_locales_locale_parent_id_unique" ON "search_suggestions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ai_suggestions_updated_at_idx" ON "ai_suggestions" USING btree ("updated_at");
  CREATE INDEX "ai_suggestions_created_at_idx" ON "ai_suggestions" USING btree ("created_at");
  CREATE UNIQUE INDEX "ai_suggestions_locales_locale_parent_id_unique" ON "ai_suggestions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "timezones_updated_at_idx" ON "timezones" USING btree ("updated_at");
  CREATE INDEX "timezones_created_at_idx" ON "timezones" USING btree ("created_at");
  CREATE UNIQUE INDEX "timezones_locales_locale_parent_id_unique" ON "timezones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");
  CREATE INDEX "conversations_updated_at_idx" ON "conversations" USING btree ("updated_at");
  CREATE INDEX "conversations_created_at_idx" ON "conversations" USING btree ("created_at");
  CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");
  CREATE INDEX "messages_updated_at_idx" ON "messages" USING btree ("updated_at");
  CREATE INDEX "messages_created_at_idx" ON "messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_wallpaper_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("wallpaper_categories_id");
  CREATE INDEX "payload_locked_documents_rels_wallpapers_id_idx" ON "payload_locked_documents_rels" USING btree ("wallpapers_id");
  CREATE INDEX "payload_locked_documents_rels_cities_id_idx" ON "payload_locked_documents_rels" USING btree ("cities_id");
  CREATE INDEX "payload_locked_documents_rels_calendar_events_id_idx" ON "payload_locked_documents_rels" USING btree ("calendar_events_id");
  CREATE INDEX "payload_locked_documents_rels_search_suggestions_id_idx" ON "payload_locked_documents_rels" USING btree ("search_suggestions_id");
  CREATE INDEX "payload_locked_documents_rels_ai_suggestions_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_suggestions_id");
  CREATE INDEX "payload_locked_documents_rels_timezones_id_idx" ON "payload_locked_documents_rels" USING btree ("timezones_id");
  CREATE INDEX "payload_locked_documents_rels_conversations_id_idx" ON "payload_locked_documents_rels" USING btree ("conversations_id");
  CREATE INDEX "payload_locked_documents_rels_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("messages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "wallpaper_categories" CASCADE;
  DROP TABLE "wallpaper_categories_locales" CASCADE;
  DROP TABLE "wallpapers" CASCADE;
  DROP TABLE "wallpapers_locales" CASCADE;
  DROP TABLE "cities" CASCADE;
  DROP TABLE "cities_locales" CASCADE;
  DROP TABLE "calendar_events" CASCADE;
  DROP TABLE "calendar_events_locales" CASCADE;
  DROP TABLE "search_suggestions" CASCADE;
  DROP TABLE "search_suggestions_locales" CASCADE;
  DROP TABLE "ai_suggestions" CASCADE;
  DROP TABLE "ai_suggestions_locales" CASCADE;
  DROP TABLE "timezones" CASCADE;
  DROP TABLE "timezones_locales" CASCADE;
  DROP TABLE "conversations" CASCADE;
  DROP TABLE "messages" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_selected_language";
  DROP TYPE "public"."enum_users_selected_theme";
  DROP TYPE "public"."enum_messages_role";`)
}
