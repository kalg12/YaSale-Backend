import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserStore } from '../entities/user-store.entity';
import { Store } from '../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserStore, Store])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
