import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeJournal } from './entities/trade-journal.entity.js';
import { TradeJournalsController } from './trade-journals.controller.js';
import { TradeJournalsService } from './trade-journals.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TradeJournal])],
  controllers: [TradeJournalsController],
  providers: [TradeJournalsService],
})
export class TradeJournalsModule {}
