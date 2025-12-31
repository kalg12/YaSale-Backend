import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantGroupDto } from './create-variant-group.dto';

export class UpdateVariantGroupDto extends PartialType(CreateVariantGroupDto) {}
