import { ArgsType, Field, ID, InputType, PartialType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";


@ArgsType()
export class UserProfileInput {
    @Field(type => ID)
    userId: number;
}

@InputType()
class UpdateUserProfile extends PartialType(PickType(User, ['email', 'password'])) {

}

@ArgsType()
export class UpdateUserProfileInput {
    @Field(type => ID)
    userId: number;

    @Field(type => UpdateUserProfile)
    data: UpdateUserProfile
}