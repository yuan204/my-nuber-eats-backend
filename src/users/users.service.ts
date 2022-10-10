import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginOutputDto } from './dtos/login-output.dto';
import { loginDto } from './dtos/login.dto';
import { UpdateUserProfileInput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
   
    constructor(
        @InjectRepository(User) private readonly usersRep: Repository<User>,
        private readonly jwtService: JwtService
        ) {}

    async findById(id: number) {
        console.log(typeof id);
        return this.usersRep.findOneBy({id})
    }
        
    async create(createUserDto: CreateUserDto) {
        const {email} = createUserDto
        const user = await this.usersRep.findOneBy({email})
        if (user) {
            throw new BadRequestException('email is in used')
        }

        return this.usersRep.save(
            this.usersRep.create(createUserDto)
        )
    }

    async login({email, password}: loginDto):Promise<LoginOutputDto> {
        const user = await this.usersRep.findOneBy({email})
        if (!user) {
            throw new BadRequestException('not find email')
        }

        const isValid = await user.validatePassword(password)
        if (!isValid) {
            throw new BadRequestException('wrong password')
        }

        const token = this.jwtService.sign({sub: user.id})
        const result = {token, ...user} as LoginOutputDto
        return result

    }

    async update({userId, data}: UpdateUserProfileInput) {
        
        const user = await this.usersRep.preload({
            id: userId,
            ...data
        })

       
        
        

        if (!user) {
            throw new NotFoundException('not found user')
        }

        if (data.password) {
           await  user.hashPassword()
        }

        return this.usersRep.save(user)
    }
    
}
