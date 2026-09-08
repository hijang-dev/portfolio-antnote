import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('trade_journals')
export class TradeJournal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // No @ManyToOne to User — same reasoning as Term.userId (see
  // terms/entities/term.entity.ts): the FK is enforced in the migration,
  // not as an application-level relation.
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ name: 'stock_name', type: 'varchar', length: 100 })
  stockName!: string;

  // Sanitized HTML from the rich text editor (see common/sanitize/).
  @Column({ type: 'text' })
  rationale!: string;

  // Null until the user writes a reflection — the dashboard's
  // "pending review" widget queries on this being null.
  @Column({ type: 'text', nullable: true })
  review!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
