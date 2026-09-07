import { PartialType } from '@nestjs/swagger';
import { CreateTermDto } from './create-term.dto.js';

export class UpdateTermDto extends PartialType(CreateTermDto) {}
