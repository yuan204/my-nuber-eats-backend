import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly configOptions: JwtModuleOptions) { }

    sign(payload: Record<string, any>) {
        return jwt.sign(payload, this.configOptions.privateKey)
    }

    verify(token: string) {
        return jwt.verify(token, this.configOptions.privateKey)
    }
}
