import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "app_users" ALTER COLUMN "selected_theme" SET DATA TYPE varchar;
  ALTER TABLE "app_users" ALTER COLUMN "selected_theme" SET DEFAULT 'system';
  ALTER TABLE "wallpapers" ADD COLUMN "is_default" boolean DEFAULT false;
  DROP TYPE "public"."enum_app_users_selected_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_app_users_selected_theme" AS ENUM('light', 'dark', 'system');
  ALTER TABLE "app_users" ALTER COLUMN "selected_theme" SET DEFAULT 'system'::"public"."enum_app_users_selected_theme";
  ALTER TABLE "app_users" ALTER COLUMN "selected_theme" SET DATA TYPE "public"."enum_app_users_selected_theme" USING "selected_theme"::"public"."enum_app_users_selected_theme";
  ALTER TABLE "wallpapers" DROP COLUMN "is_default";`)
}
