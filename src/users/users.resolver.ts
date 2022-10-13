import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginOutputDto } from './dtos/login-output.dto';
import { loginDto } from './dtos/login.dto';
import { UpdateUserProfileInput, UserProfileInput } from './dtos/user-profile.dto';
import { VerifyEmailInput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver()
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Mutation(returns => User)
    signup(@Args('input') createUserInput: CreateUserDto) {
        return this.usersService.create(createUserInput)
    }

    @Mutation(returns => LoginOutputDto)
    signin(@Args('input') loginInput: loginDto) {
        return this.usersService.login(loginInput)
    }

    @Query(returns => User)
    @UseGuards(AuthGuard)
    whoamI(@AuthUser() user: User) {
        return user
    }

    @Query(returns => User)
    userProfile(@Args() {userId}: UserProfileInput) {
        console.log(typeof userId);
        
        return this.usersService.findById(userId)
    }

    @Mutation(returns => User) 
    @UseGuards(AuthGuard)
    editUserProfile(@Args() updateUserProfileDto: UpdateUserProfileInput ) {
        return this.usersService.update(updateUserProfileDto)
    }

    @Mutation(returns => User)
    verifyEmail(@Args('input') {code}: VerifyEmailInput) {
        return this.usersService.verifyEmail(code)
    }
    
    
}
