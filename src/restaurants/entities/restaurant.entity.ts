import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant {

    @PrimaryGeneratedColumn()
    @Field(type => ID)
    id: number;

    @Column()
    @Field(type => String)
    @Length(5, 10)
    @IsString()
    name: string;

    @Column({default: true})
    @Field(type => Boolean, {nullable: true})
    @IsBoolean()
    @IsOptional()
    isVegan: boolean;

    @Column()
    @Field(type => String)
    @IsString()
    address: string;

    @Column()
    @Field(type => String)
    @IsString()
    ownersName: string;
}