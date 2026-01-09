import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/users/repositories/users.repository';
import { UserSessionRepository } from 'src/users/repositories/user-sessions.repository';
import { UserVerificationRepository } from './../users/repositories/user-verifications.repository';
import { RefreshDto } from './dto/refresh.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyDto } from './dto/verify.dto';
import { PasswordDto } from './dto/password.dto';
import { JwtService } from '@nestjs/jwt';
import { generateToken, hashToken } from 'src/helper/function/crypto-token';
import { sendVerificationEmail } from 'src/helper/function/resend-email';
import * as bcrypt from 'bcryptjs';
import { ErrorCode } from 'src/helper/enum/error-code';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'src/generated/prisma/browser';
import { LogoutDto } from './dto/logout.dto';
import {
  FolderType,
  uploadToCloudinaryFromBase64,
} from 'src/helper/function/cloudinary-file';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userSessions: UserSessionRepository,
    private readonly userVerification: UserVerificationRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // CREATE TOKEN & SESSION
  async tokenSession(
    email: string,
    meta: FastifyRequest,
    tx?: Prisma.TransactionClient,
  ) {
    const user = await this.userRepo.findByEmail(email);

    if (!user)
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });

    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.userRole,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '14d',
      },
    );

    await this.userSessions.createSession(
      {
        userId: user.userId,
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
        ipAddress: meta.ip,
      },
      tx,
    );

    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  // REFRESH TOKEN
  async refresh(refreshDto: RefreshDto, meta: FastifyRequest) {
    try {
      const payload = this.jwtService.verify(refreshDto.token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException({
          message: 'Invalid token type',
          errorCode: ErrorCode.INVALID_TOKEN,
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }

      const hashedToken = hashToken(refreshDto.token);

      // OPEN TRANSACTION
      return await this.prisma.$transaction(async (tx) => {
        const sessions = await this.userSessions.findByRefreshToken(
          payload.sub,
          hashedToken,
        );

        // VALIDATE
        if (!sessions)
          throw new UnauthorizedException({
            message: 'Token not found or revoked',
            errorCode: ErrorCode.INVALID_TOKEN,
            statusCode: HttpStatus.UNAUTHORIZED,
          });
        if (sessions?.ipAddress !== meta.ip)
          throw new UnauthorizedException({
            message: 'IP Mismatch',
            errorCode: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.UNAUTHORIZED,
          });
        if (sessions.expiresAt < new Date())
          throw new UnauthorizedException({
            message: 'Session expired',
            errorCode: ErrorCode.TOKEN_EXPIRED,
            statusCode: HttpStatus.UNAUTHORIZED,
          });

        // ROTATE
        await this.userSessions.deleteSession(sessions.sessionId, tx);

        // RESPONSE
        const user = await this.userRepo.findFull(payload.sub);
        if (!user)
          throw new NotFoundException({
            message: 'User not found',
            errorCode: ErrorCode.USER_NOT_FOUND,
            statusCode: HttpStatus.NOT_FOUND,
          });

        const generateToken = await this.tokenSession(user.email, meta);
        const { passwordHash, ...safeUser } = user;

        return {
          success: true,
          token: generateToken,
          data: safeUser,
        };
      });
    } catch (err) {
      throw new UnauthorizedException({
        message: err.message || 'Unauthorized',
        errorCode: err.response?.errorCode || ErrorCode.INVALID_TOKEN,
        statusCode: err.response?.statusCode || HttpStatus.UNAUTHORIZED,
      });
    }
  }

  // REGULAR LOGIN HANDLER
  async login(loginDto: LoginDto, meta: FastifyRequest) {
    const user = await this.userRepo.findByEmail(loginDto.email);

    if (!user)
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });

    if (!user.passwordHash)
      throw new ForbiddenException({
        message:
          'Please set your password first, verify email to set your password',
        errorCode: ErrorCode.PENDING_PASSWORD,
        statusCode: HttpStatus.FORBIDDEN,
      });

    if (user.userStatus === 'PENDING')
      throw new ForbiddenException({
        message: 'Please verify your email first',
        errorCode: ErrorCode.EMAIL_NOT_VERIFIED,
        statusCode: HttpStatus.FORBIDDEN,
      });

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isMatch)
      throw new UnauthorizedException({
        message: 'Invalid password',
        errorCode: ErrorCode.INVALID_PASSWORD,
        statusCode: HttpStatus.UNAUTHORIZED,
      });

    // RESPONSE
    const generateToken = await this.tokenSession(user.email, meta);
    const { passwordHash, deletedAt, ...safeUser } = user;

    return {
      success: true,
      token: generateToken,
      data: safeUser,
    };
  }

  // SIGNUP STEP 1
  async signup(signupDto: SignupDto) {
    const existingUser = await this.userRepo.findByEmail(signupDto.email);

    if (existingUser) {
      if (existingUser.userStatus !== 'PENDING') {
        throw new ConflictException({
          message: 'This email is already registered.',
          errorCode: ErrorCode.USER_ALREADY_EXISTS,
          statusCode: HttpStatus.CONFLICT,
        });
      }

      const lastVerification = await this.userVerification.findLastByUserId(
        existingUser.userId,
      );

      if (lastVerification) {
        const now = new Date();
        const lastSent = new Date(lastVerification.createdAt);
        const different = (now.getTime() - lastSent.getTime()) / 1000;
        const delay = 60;

        if (different < delay) {
          throw new HttpException(
            {
              message: `Wait ${Math.floor(delay - different)}s before resend verification email.`,
              errorCode: ErrorCode.TOO_MANY_REQUESTS,
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }

      const { token, tokenHash } = generateToken();
      await this.userVerification.createVerify(existingUser.userId, tokenHash);
      await sendVerificationEmail(existingUser.email, token);

      return {
        success: true,
        message: 'Verification email resent, please check your inbox',
      };
    }

    const newUser = await this.userRepo.createUser(signupDto);
    const { token, tokenHash } = generateToken();
    await this.userVerification.createVerify(newUser.userId, tokenHash);
    await sendVerificationEmail(newUser.email, token);

    return {
      success: true,
      message: 'Verification email sent, please check your inbox',
    };
  }

  // SIGNUP STEP 2
  async signupVerify(verifyDto: VerifyDto) {
    const hashedToken = hashToken(verifyDto.token);
    const matching = await this.userVerification.findToken(hashedToken);

    if (!matching) {
      throw new BadRequestException({
        message: 'Token invalid or expired',
        errorCode: ErrorCode.INVALID_TOKEN,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const user = await this.userRepo.findById(matching.userId);

    if (!user)
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });

    return {
      success: true,
      message: 'Verification success, please set your password',
      token: verifyDto.token,
      email: user.email,
    };
  }

  // SIGNUP STEP 3
  async signupPassword(passwordDto: PasswordDto, meta: FastifyRequest) {
    const hashedPassword = await bcrypt.hash(passwordDto.password, 10);
    const hashedToken = hashToken(passwordDto.token);
    const matching = await this.userVerification.findToken(hashedToken);

    if (!matching) {
      throw new BadRequestException({
        message: 'Token invalid or expired',
        errorCode: ErrorCode.INVALID_TOKEN,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    // OPEN TRANSACTION
    return await this.prisma.$transaction(async (tx) => {
      await this.userVerification.deleteToken(matching.verificationId, tx);

      const updatedUser = await this.userRepo.verifyUser(
        matching.userId,
        hashedPassword,
        tx,
      );

      // RESPONSE
      const generateToken = await this.tokenSession(
        updatedUser.email,
        meta,
        tx,
      );

      return {
        success: true,
        message: 'Password setting success',
        token: generateToken,
        data: updatedUser,
      };
    });
  }

  async logout(logoutDto: LogoutDto) {
    const payload = this.jwtService.verify(logoutDto.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const hashedToken = hashToken(logoutDto.refreshToken);

    const sessions = await this.userSessions.findByRefreshToken(
      payload.sub,
      hashedToken,
    );

    if (sessions) {
      await this.userSessions.deleteSession(sessions.sessionId);
    } else {
      throw new NotFoundException({
        message: 'Token not found or revoked',
        errorCode: ErrorCode.INVALID_TOKEN,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // OAUTH LOGIC
  async findOrCreateUserGoogle(
    googleUser: any,
    meta: FastifyRequest,
  ): Promise<{
    success: boolean;
    message: string;
    token: { accessToken: string; refreshToken: string };
    data: any;
  }> {
    let existingUser = await this.userRepo.findByEmail(googleUser.email);

    if (existingUser) {
      existingUser = await this.userRepo.updateUser(
        {
          avatar: existingUser.avatar ? undefined : googleUser.picture,
        },
        existingUser.userId,
      );
    } else {
      existingUser = await this.userRepo.createUser({
        email: googleUser.email,
        name: `${googleUser.firstName} ${googleUser.lastName}`,
        avatar: googleUser.picture,
        userStatus: 'ACTIVE',
      });
    }

    const generateToken = await this.tokenSession(existingUser.email, meta);

    return {
      success: true,
      message: 'Google login success',
      token: generateToken,
      data: existingUser,
    };
  }

  async findOrCreateUserMicrosoft(
    microsoftUser: any,
    meta: FastifyRequest,
  ): Promise<{
    success: boolean;
    message: string;
    token: { accessToken: string; refreshToken: string };
    data: any;
  }> {
    const avatar = uploadToCloudinaryFromBase64(
      microsoftUser.picture,
      FolderType.AVATAR,
    );
    const avatarUrl = avatar ? (await avatar).secure_url : undefined;

    let existingUser = await this.userRepo.findByEmail(microsoftUser.email);

    if (existingUser) {
      existingUser = await this.userRepo.updateUser(
        {
          avatar: existingUser.avatar ? undefined : avatarUrl,
        },
        existingUser.userId,
      );
    } else {
      existingUser = await this.userRepo.createUser({
        email: microsoftUser.email,
        name: `${microsoftUser.firstName} ${microsoftUser.lastName}`,
        avatar: avatarUrl,
        userStatus: 'ACTIVE',
      });
    }

    const generateToken = await this.tokenSession(existingUser.email, meta);

    return {
      success: true,
      message: 'Microsoft login success',
      token: generateToken,
      data: existingUser,
    };
  }

  async findOrCreateUserFacebook(
    facebookUser: any,
    meta: FastifyRequest,
  ): Promise<{
    success: boolean;
    message: string;
    token: { accessToken: string; refreshToken: string };
    data: any;
  }> {
    let existingUser = await this.userRepo.findByEmail(facebookUser.email);

    if (existingUser) {
      existingUser = await this.userRepo.updateUser(
        {
          avatar: existingUser.avatar
            ? undefined
            : facebookUser.photos?.[0]?.value,
        },
        existingUser.userId,
      );
    } else {
      existingUser = await this.userRepo.createUser({
        email: facebookUser.email,
        name: `${facebookUser.firstName} ${facebookUser.middleName} ${facebookUser.lastName}`,
        avatar: facebookUser.photos?.[0]?.value,
        userStatus: 'ACTIVE',
      });
    }

    const generateToken = await this.tokenSession(existingUser.email, meta);

    return {
      success: true,
      message: 'Facebook login success',
      token: generateToken,
      data: existingUser,
    };
  }
}
