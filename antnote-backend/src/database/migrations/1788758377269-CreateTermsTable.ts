import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTermsTable1788758377269 implements MigrationInterface {
  name = 'CreateTermsTable1788758377269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "terms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "term" character varying(50) NOT NULL, "definition" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_33b6fe77d6ace7ff43cc8a65958" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bae272776eb7251295f390ab73" ON "terms"  ("user_id", "term") `,
    );
    // Enforced at the schema level even though the Term entity has no
    // @ManyToOne relation object — see the comment on Term.userId.
    await queryRunner.query(
      `ALTER TABLE "terms" ADD CONSTRAINT "FK_terms_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "terms" DROP CONSTRAINT "FK_terms_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bae272776eb7251295f390ab73"`,
    );
    await queryRunner.query(`DROP TABLE "terms"`);
  }
}
