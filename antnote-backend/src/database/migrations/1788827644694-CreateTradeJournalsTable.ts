import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTradeJournalsTable1788827644694 implements MigrationInterface {
  name = 'CreateTradeJournalsTable1788827644694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // NOTE: the generator also proposed dropping "FK_terms_user_id" —
    // that's schema drift-detection noise, not a real change. The Term
    // entity has no @ManyToOne relation (by design, see term.entity.ts),
    // so the generator can't see that constraint and assumes it
    // shouldn't exist. Left in place on purpose; removed from this file.
    await queryRunner.query(
      `CREATE TABLE "trade_journals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(100) NOT NULL, "stock_name" character varying(100) NOT NULL, "rationale" text NOT NULL, "review" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0874b089c9b8e6cb49d732c131f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "trade_journals" ADD CONSTRAINT "FK_trade_journals_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trade_journals" DROP CONSTRAINT "FK_trade_journals_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "trade_journals"`);
  }
}
