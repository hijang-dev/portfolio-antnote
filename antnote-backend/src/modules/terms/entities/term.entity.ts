import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('terms')
@Index(['userId', 'term'], { unique: true })
export class Term {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // No @ManyToOne to the User entity — TermsService never needs to join
  // or navigate to the owning user, only filter by id. The FK constraint
  // itself is still added at the schema level (see the migration), just
  // without an ORM relation object coupling this module to `users` at
  // the application layer too.
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  term!: string;

  @Column({ type: 'text' })
  definition!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
