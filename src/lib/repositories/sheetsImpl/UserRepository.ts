import Repository from "../Repository"
import {User} from "../../models/User"

class UserRepository extends Repository<User> {
  constructor() {
    super('Users');
  }
}

export default UserRepository;