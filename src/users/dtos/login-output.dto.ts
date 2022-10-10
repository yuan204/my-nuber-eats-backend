import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";


@ObjectType()
export class LoginOutputDto extends User {
    @Field(type => String)
    token: string;
}