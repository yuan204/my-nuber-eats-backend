import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtMiddleware } from './jwt.middleware';
import { JwtService } from './jwt.service';

@Module({
})
export class JwtModule {

  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      global: true,
      module: JwtModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        JwtService,
      ],
      exports: [JwtService]
    }
  }
}
