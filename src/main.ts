import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import pc from 'picocolors';
import fastifyCookie from '@fastify/cookie';
import fastifyPassport from '@fastify/passport';
import fastifySecureSession from '@fastify/secure-session';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      disableRequestLogging: true,
      logger: {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onResponse', (req, reply, done) => {
      const { method, url, ip } = req;
      const status = reply.statusCode;
      const time = reply.elapsedTime;

      console.log(
        `[${new Date().toLocaleTimeString()}] ${pc.cyan(method)} ${pc.white(url)} ${status >= 400 ? pc.red(status) : pc.green(status)} ${pc.yellow(time.toFixed(3) + 'ms')} - ${ip}`,
      );

      done();
    });

  app.register(helmet);

  await app.register(cors, {
    origin: [
      'https://barestore.ahmadrka.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await app.register(multipart);

  await app.register(fastifyCookie, {
    secret: 'a-very-long-secret-key-12345678901234567890',
  });

  await app.register(fastifySecureSession, {
    secret: 'a-very-long-secret-key-12345678901234567890',
    salt: 'mq9H98BYS7PRAS7Q',
    cookie: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });
  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
