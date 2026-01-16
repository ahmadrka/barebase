import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from 'src/helper/enum/error-code';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context } = requestProps;

    console.log(`[Throttler] Checking route: ${context.getHandler().name}`);

    // Cara standar @nestjs/throttler mengecek skip
    const isSkipped = await this.shouldSkip(context);

    if (isSkipped) {
      console.log('=========================================');
      console.log(`[DEBUG] SUCCESS SKIPPING: ${context.getHandler().name}`);
      console.log('=========================================');
      return true;
    }

    return super.handleRequest(requestProps);
  }

  // Method pembantu untuk mengecek @SkipThrottle()
  protected async shouldSkip(context: any): Promise<boolean> {
    const reflector = (this as any).reflector;
    return reflector.getAllAndOverride('SKIP_THROTTLE', [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  protected async throwThrottlerException(): Promise<void> {
    throw new HttpException(
      {
        message: 'ThrottlerException: Too Many Requests',
        errorCode: ErrorCode.TOO_MANY_REQUESTS,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
