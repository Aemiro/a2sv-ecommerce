import { CurrentUserDto } from '@libs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CategoryEntity } from '@products/persistence/categories/category.entity';
export class CreateCategoryCommand {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  description: string;
  currentUser: CurrentUserDto;

  static toEntity(command: CreateCategoryCommand): CategoryEntity {
    const entity = new CategoryEntity();
    entity.name = command.name;
    entity.description = command.description;
    entity.isActive = true;
    return entity;
  }
}
export class UpdateCategoryCommand extends PartialType(CreateCategoryCommand) {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  isActive: boolean;
}
export class ArchiveCategoryCommand {
  @ApiProperty({
    example: 'd02dd06f-2a30-4ed8-a2a0-75c683e3092e',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty()
  @IsNotEmpty()
  reason: string;
  currentUser: CurrentUserDto;
}
