import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from 'src/jwt/jwt.interfaces';
import { MailConfigOptions } from './mail.interfaces';
import { MailService } from './mail.service';

@Module({
})
export class MailModule {
  static forRoot(configOptions: MailConfigOptions): DynamicModule {
    return {
      module: MailModule,
      global: true,
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: configOptions
        }
      ],
      exports: [MailService]
    }
  }
}
