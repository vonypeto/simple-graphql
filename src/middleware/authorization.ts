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
      return new HttpException({ code: 'FORBIDDEN' }, HttpStatus.FORBIDDEN);
    }

    req.claims = await this.jwtService.verifyAsync<{ id: string }>(token);
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

      req.claims = await this.jwtService.verifyAsync<{ id: string }>(token);

      return true;
    }

    return false;
  }
}
