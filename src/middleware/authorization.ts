import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as atob from 'atob';
import { verify, VerifyErrors, JwtPayload } from 'jsonwebtoken'; // Modified import

interface CustomRequest extends Request {
  parent?: any;
  args?: any;
  ctx?: any;
  authorization?: {
    username?: string;
    password?: string;
    token?: string;
  };
}

@Injectable()
export class GraphQLContextMiddleware implements NestMiddleware {
  async use(req: CustomRequest, res: Response, next: () => void) {
    // Made use() method async
    // Set the parent, args, and context properties in the request object
    req.parent = req.body?.parent;
    req.args = req.body?.args;
    req.ctx = req.body?.ctx;

    // Decode the Basic Authorization header
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader) {
      if (authorizationHeader.startsWith('Basic ')) {
        const encodedCredentials = authorizationHeader.substring(6);
        const decodedCredentials = atob(encodedCredentials);
        const [username, password] = decodedCredentials.split(':');

        req.authorization = { username, password };
      } else if (authorizationHeader.startsWith('Bearer ')) {
        const token = authorizationHeader.substring(7);

        req.authorization = { token };
        console.log(token);

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
          return res.sendStatus(403);
        }
      }
    }

    next();
  }
}
