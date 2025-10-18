import IUserService from "../IUserService";
import {User} from "../../models/User";
import Repository from "@/lib/repositories/Repository";

class UserService extends IUserService {
  private userRepository: Repository<User>;
  constructor(userRepository) {
    super();
    this.userRepository = userRepository
  }

  async update(id: string, mobileNumber: string): Promise<User> {
    await this.userRepository.update('id', id, {mobileNumber});
    return await this.userRepository.findOne({id});
  }
}

export default UserService;