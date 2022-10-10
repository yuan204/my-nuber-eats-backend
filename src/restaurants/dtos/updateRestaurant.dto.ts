import {  Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./createRestaurant.dto";

@InputType()
 class UpdateRestaurantInput extends PartialType(CreateRestaurantDto) {
    
}


@InputType()
export class UpdateRestaurantDto  {
    @Field(type => ID)
    id: number;

    @Field(type => UpdateRestaurantInput)
    data: UpdateRestaurantInput
}