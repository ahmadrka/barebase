import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { version } from '../package.json';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () => this.http.pingCheck('network', 'https://google.com'),

      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);

    return {
      name: 'BareStore POS API',
      version: version,
      serverTime: new Date().toISOString(),
      uptimeInSeconds: Math.floor(process.uptime()),
      ...result,
    };
  }
}
