import { IsString, IsOptional, IsInt, IsDateString, Min, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentType {
  DP = 'DP',
  FULL = 'FULL'
}

export class ReservationItemDto {
  @IsInt()
  menuId: number;

  @IsInt()
  @Min(1)
  qty: number;

  @IsInt()
  price: number;
}

export class CreateReservationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  guestCount: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  tableId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationItemDto)
  @IsOptional()
  items?: ReservationItemDto[];

  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;
}
