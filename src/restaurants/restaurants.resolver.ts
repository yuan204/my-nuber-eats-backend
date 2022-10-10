import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateRestaurantDto } from './dtos/createRestaurant.dto';
import { UpdateRestaurantDto } from './dtos/updateRestaurant.dto';
import { UserProfileInput } from '../users/dtos/user-profile.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';

@Resolver()
export class RestaurantsResolver {
    constructor(private readonly restaurantService: RestaurantsService) {}

    @Query(returns => [Restaurant])
    myRestaurant(): Promise<Restaurant[]> {
        return this.restaurantService.find()
    }
    
    @Mutation(returns => Restaurant)
    createRestaurant(@Args('input') createRestaurant: CreateRestaurantDto ) {
        return this.restaurantService.create(createRestaurant)
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(@Args('input') updateRestaurant: UpdateRestaurantDto ) {
        try {
            await this.restaurantService.update(updateRestaurant)
            return true
        } catch (error) {
            console.log(error);
            return false
        }
    }

    



}
