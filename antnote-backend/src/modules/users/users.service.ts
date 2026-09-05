import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

export interface CreateUserInput {
  username: string;
  passwordHash: string;
  nickname: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = this.usersRepository.create({
      username: input.username,
      password: input.passwordHash,
      nickname: input.nickname,
    });
    return this.usersRepository.save(user);
  }
}
