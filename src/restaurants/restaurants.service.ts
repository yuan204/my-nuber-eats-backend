import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/createRestaurant.dto';
import { UpdateRestaurantDto } from './dtos/updateRestaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
    constructor(@InjectRepository(Restaurant) private readonly restaurantRep: Repository<Restaurant>) {}

    find() {
        return this.restaurantRep.find()
    }

    create(createRestaurantDto: CreateRestaurantDto) {
        const restaurant = this.restaurantRep.create(createRestaurantDto)
        return this.restaurantRep.save(restaurant)
    }

    update({id, data}: UpdateRestaurantDto) {
        return this.restaurantRep.update(id, data)
    }
}
