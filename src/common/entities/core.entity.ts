import { Field, ID, ObjectType } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@ObjectType()
export class CoreEntity {
    @PrimaryGeneratedColumn()
    @Field(type => ID)
    id: number;

    @CreateDateColumn()
    @Field(type => Date)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(type => Date)
    updatedAt: Date;


}
