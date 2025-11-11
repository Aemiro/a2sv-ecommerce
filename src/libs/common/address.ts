import { ApiProperty } from '@nestjs/swagger';
export class Address {
  @ApiProperty()
  country?: string;
  @ApiProperty()
  city?: string;
  @ApiProperty()
  subcity?: string;
  @ApiProperty()
  woreda?: string;
  @ApiProperty()
  kebele?: string;
}
