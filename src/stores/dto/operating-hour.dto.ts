import { IsObject } from 'class-validator';

export class OperatingHourDto {
  @IsObject()
  monday: { open: string; close: string; isOpen: boolean };

  @IsObject()
  tuesday: { open: string; close: string; isOpen: boolean };

  @IsObject()
  wednesday: { open: string; close: string; isOpen: boolean };

  @IsObject()
  thursday: { open: string; close: string; isOpen: boolean };

  @IsObject()
  friday: { open: string; close: string; isOpen: boolean };

  @IsObject()
  saturday: { open: string; close: string; isOpen: boolean };

  @IsObject()
  sunday: { open: string; close: string; isOpen: boolean };
}
