import {User} from "../models/User";

/**
 * Newsletter Service Interface
 * Defines the contract for newsletter-related operations
 */
class IUserService {
  constructor() {
    if (this.constructor === IUserService) {
      throw new Error('Cannot instantiate interface directly');
    }
  }

  /**
   * Update a user
   * @param id the user id
   * @param mobileNumber phone number
   * @returns {Promise<User>} The created subscription record
   */
  async update(id: string, mobileNumber: string) {
    throw new Error('subscribe method must be implemented');
  }
}

export default IUserService;