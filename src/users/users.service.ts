import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginOutputDto } from './dtos/login-output.dto';
import { loginDto } from './dtos/login.dto';
import { UpdateUserProfileInput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private readonly usersRep: Repository<User>,
        @InjectRepository(Verification)
        private readonly verificationRep: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) { }

    async findById(id: number) {
        return this.usersRep.findOneBy({ id });
    }

    async create(createUserDto: CreateUserDto) {
        const { email } = createUserDto;
        const user = await this.usersRep.findOneBy({ email });
        
        if (user) {
            throw new BadRequestException('email is in used');
        }

        const createUser = await this.usersRep.save(
            this.usersRep.create(createUserDto),
        );

        const verification =  await this.verificationRep.save(
            this.verificationRep.create({ user: createUser }),
        );

        
        this.mailService.sendEmail(createUser.email, verification.code)

        return createUser;
    }

    async login({ email, password }: loginDto): Promise<LoginOutputDto> {
        const user = await this.usersRep.findOneBy({ email });
        if (!user) {
            throw new BadRequestException('not find email');
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
            throw new BadRequestException('wrong password');
        }

        const token = this.jwtService.sign({ sub: user.id });
        const result = { token, ...user } as LoginOutputDto;
        return result;
    }

    async update({ userId, data }: UpdateUserProfileInput) {
        const user = await this.usersRep.preload({
            id: userId,
            ...data,
        });

        if (!user) {
            throw new NotFoundException('not found user');
        }

        const updatedUser = await this.usersRep.save(user);


        return updatedUser;
    }


    async verifyEmail(code: string) {
        const verification = await this.verificationRep.findOne({
            where: { code },
            relations: {
                'user': true
            }
        })


        if (!verification) {
            throw new NotFoundException('not found verifyication')
        }

        const { user } = verification
        user.verifyed = true
        await this.verificationRep.remove(verification)
        return this.usersRep.save(user)



    }
}
