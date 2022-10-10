import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
    ) 
  {}
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-jwt'] as string
    try {
      if (token) {
        const {sub} = this.jwtService.verify(token)
        
        const user = await this.usersService.findById(+sub)
        req.user = user
      }
    } catch (error) {
      
    }    
   
    next();
  }
}
