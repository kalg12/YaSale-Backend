import { PartialType } from '@nestjs/mapped-types';
import { CreatePrinterConfigDto } from './create-printer-config.dto';

export class UpdatePrinterConfigDto extends PartialType(
  CreatePrinterConfigDto,
) {}
