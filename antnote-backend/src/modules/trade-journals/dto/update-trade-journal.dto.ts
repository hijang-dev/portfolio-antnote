import { PartialType } from '@nestjs/swagger';
import { CreateTradeJournalDto } from './create-trade-journal.dto.js';

export class UpdateTradeJournalDto extends PartialType(CreateTradeJournalDto) {}
