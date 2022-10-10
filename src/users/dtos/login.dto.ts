import { InputType, PickType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";

@InputType()
export class loginDto extends PickType(User, ['email', 'password']) {}
