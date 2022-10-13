import got  from "got";
import { Inject, Injectable } from '@nestjs/common';
import * as FormData from 'form-data'
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailConfigOptions } from './mail.interfaces';

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly configOptions: MailConfigOptions) {}

    async sendEmail(username: string, code: string) {

        
        const { domain, apiKey, from } = this.configOptions
        const form = new FormData()
        form.append('to', '2503404258gl@gmail.com')
        form.append('subject', 'verify email')
        form.append('template', 'verify-email')
        form.append('v:username', username)
        form.append('v:code', code)
        form.append('from', from)
        const url = ` https://api.mailgun.net/v3/${domain}/messages`
        
        const data = await got.post(url, {
            headers: {
                Authorization: `basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`
            },
            body: form
        }).json()

        console.log(data);

        return data
        
    }
}
