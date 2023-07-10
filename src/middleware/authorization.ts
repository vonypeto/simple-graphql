import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestMiddleware,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request & { claims: any }, _: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return next();

    const [type, token] = authorizationHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new HttpException({ code: 'FORBIDDEN' }, HttpStatus.FORBIDDEN);
    }

    try {
      req.claims = await this.jwtService.verifyAsync<{
        id: string;
        exp: number;
      }>(token);
    } catch (error) {
      if (error.message === 'jwt expired')
        throw new HttpException(
          { code: 'JWT_EXPIRED', message: 'JWT token expired' },
          HttpStatus.FORBIDDEN,
        );
      else throw new HttpException({ code: 'FORBIDDEN' }, HttpStatus.FORBIDDEN);
    }

    return next();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const req = ctx.req;

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) return true;

    const [type, token] = authorizationHeader.split(' ');
    if (type === 'Bearer') {
      if (!token) {
        return false;
      }

      try {
        req.claims = await this.jwtService.verifyAsync<{
          id: string;
          exp: number;
        }>(token);

        if (req.claims.exp * 1000 < Date.now()) {
          return false;
        }
      } catch (error) {
        return false;
      }

      return true;
    }

    return false;
  }
}
