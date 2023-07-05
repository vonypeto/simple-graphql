import {
  Injectable,
  NestMiddleware,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as atob from 'atob';
import { verify, VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const req = ctx.req;

    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      if (authorizationHeader.startsWith('Basic ')) {
        // Basic Authentication
        const encodedCredentials = authorizationHeader.substring(6);
        const decodedCredentials = atob(encodedCredentials);
        const [username, password] = decodedCredentials.split(':');

        req.authorization = { username, password };
      } else if (authorizationHeader.startsWith('Bearer ')) {
        // JWT Authentication
        const token = authorizationHeader.substring(7);

        req.authorization = { token };

        try {
          const decoded = await new Promise<JwtPayload | undefined>(
            (resolve, reject) => {
              verify(
                token,
                process.env.ACCESS_TOKEN_SECRET!,
                (err: VerifyErrors | null, decoded: JwtPayload | undefined) => {
                  if (err) {
                    console.error(err.message);
                    reject(err);
                  } else {
                    console.log(decoded);
                    resolve(decoded);
                  }
                },
              );
            },
          );

          req.ctx = { ...req.ctx, userId: decoded?.userId };
        } catch (error) {
          console.error(error);
          return false;
        }
      }
    }

    return true;
  }
}
