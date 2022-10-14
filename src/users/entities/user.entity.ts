import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  Client = 'client',
  Owner = 'owner',
  Delivery = 'delivery',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});
@InputType({ isAbstract: true })
@Entity()
@ObjectType()
export class User extends CoreEntity {
  @Column()
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column()
  @Field((type) => String)
  @IsString()
  password: string;

  @Column({ default: false })
  @Field((type) => Boolean)
  verifyed: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Client,
  })
  @Field((type) => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      console.log(this.password);

      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(aPassword) {
    return bcrypt.compare(aPassword, this.password);
  }
}
