import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/users/repositories/users.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { UserSessionRepository } from 'src/users/repositories/user-sessions.repository';
import { UserVerificationRepository } from 'src/users/repositories/user-verifications.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtAuthStrategy } from './strategy/jwt-auth.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { MicrosoftStrategy } from './strategy/microsoft.strategy';
import { FacebookStrategy } from './strategy/facebook.strategy';

const JWT_SECRET = process.env.JWT_SECRET;

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET || 'fallback',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    UserSessionRepository,
    UserVerificationRepository,
    JwtAuthStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    FacebookStrategy,
  ],
})
export class AuthModule {}
