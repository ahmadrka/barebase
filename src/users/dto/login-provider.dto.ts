import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Provider } from 'src/generated/prisma/enums';

export class LoginProviderDto {
  @IsNumber()
  userId: number;

  @IsEnum(Provider)
  provider: Provider;

  @IsString()
  providerId: string;
}
