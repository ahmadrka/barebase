import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fastifyPassport from '@fastify/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy {
  constructor(private configService: ConfigService) {
    fastifyPassport.use(
      'facebook',
      new Strategy(
        {
          clientID: this.configService.getOrThrow('FACEBOOK_CLIENT_ID'),
          clientSecret: this.configService.getOrThrow('FACEBOOK_CLIENT_SECRET'),
          callbackURL: this.configService.getOrThrow('FACEBOOK_CALLBACK_URL'),
          profileFields: ['id', 'displayName', 'name', 'emails', 'photos'],
          scope: ['public_profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const { emails, name, photos, displayName, id } = profile;

            let email =
              emails && emails.length > 0
                ? emails[0].value
                : `${id}@facebook.com`;

            const firstName =
              name?.givenName || displayName?.split(' ')[0] || 'User';
            const lastName =
              name?.familyName ||
              displayName?.split(' ').slice(1).join(' ') ||
              '';

            const picture =
              photos && photos.length > 0 ? photos[0].value : null;

            const user = {
              email,
              firstName,
              middleName: name?.middleName || '',
              lastName,
              picture,
            };

            return done(null, user);
          } catch (error) {
            console.error('Facebook Strategy Error:', error);
            return done(error, false);
          }
        },
      ),
    );

    fastifyPassport.registerUserSerializer(async (user) => user);
    fastifyPassport.registerUserDeserializer(async (user) => user);
  }
}
