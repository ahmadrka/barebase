import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fastifyPassport from '@fastify/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy {
  constructor(private configService: ConfigService) {
    fastifyPassport.use(
      'google',
      new Strategy(
        {
          clientID: this.configService.getOrThrow('GOOGLE_CLIENT_ID'),
          clientSecret: this.configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
          callbackURL: this.configService.getOrThrow('GOOGLE_CALLBACK_URL'),
          scope: ['profile', 'email'],
          prompt: 'select_account',
        } as any,
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any,
        ) => {
          try {
            const user = {
              email: profile.emails[0].value,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              picture: profile.photos[0].value,
            };
            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        },
      ),
    );

    // Wajib ada untuk fastify-passport
    fastifyPassport.registerUserSerializer(async (user) => user);
    fastifyPassport.registerUserDeserializer(async (user) => user);
  }
}
