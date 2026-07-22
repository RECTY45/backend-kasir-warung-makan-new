import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ReservationStatus } from '@prisma/client';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
