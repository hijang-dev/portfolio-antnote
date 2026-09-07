import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Term } from './entities/term.entity.js';
import { TermsController } from './terms.controller.js';
import { TermsService } from './terms.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Term])],
  controllers: [TermsController],
  providers: [TermsService],
})
export class TermsModule {}
