import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { Verification } from "../entities/verification.entity";



@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {

}