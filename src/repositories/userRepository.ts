import { QueryFilter } from 'mongoose';
import { BaseRepository } from './baseRepository';
import User, { IUser } from '../models/user';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findByEmail(email);
  }

  async emailExists(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase().trim() });
  }

  async updateProfilePic(
    userId: string,
    filePath: string,
  ): Promise<IUser | null> {
    return this.updateById(userId, { profilePic: filePath });
  }

  async findPublicProfile(filter: QueryFilter<IUser>): Promise<IUser | null> {
    return this.findOne(filter, undefined);
  }
}

const userRepository = new UserRepository();
export default userRepository;
