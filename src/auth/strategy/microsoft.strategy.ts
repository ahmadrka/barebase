import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fastifyPassport from '@fastify/passport';
import { Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy {
  constructor(private configService: ConfigService) {
    fastifyPassport.use(
      'microsoft',
      new Strategy(
        {
          clientID: this.configService.getOrThrow('MICROSOFT_CLIENT_ID'),
          clientSecret: this.configService.getOrThrow(
            'MICROSOFT_CLIENT_SECRET',
          ),
          callbackURL: this.configService.getOrThrow('MICROSOFT_CALLBACK_URL'),
          scope: ['openid', 'profile', 'email', 'user.read'],
          tenant: 'common',
          authorizationURL:
            'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenURL:
            'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        },
        async (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any,
        ) => {
          try {
            let picture: string | null = null;

            try {
              const response = await fetch(
                'https://graph.microsoft.com/v1.0/me/photo/$value',
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                },
              );

              if (response.ok) {
                const buffer = await response.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType =
                  response.headers.get('content-type') || 'image/jpeg';
                picture = `data:${contentType};base64,${base64}`;
              }
            } catch (nodeError) {
              console.log('User has no photo or Graph API error');
            }

            const user = {
              email: profile.userPrincipalName,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              picture,
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
