import {Newsletter} from "../models/Newsletter";

/**
 * Newsletter Service Interface
 * Defines the contract for newsletter-related operations
 */
class INewsletterService {
  constructor() {
    if (this.constructor === INewsletterService) {
      throw new Error('Cannot instantiate interface directly');
    }
  }

  /**
   * Subscribe a user to the newsletter
   * @param name Name of the subscriber
   * @param {string} email - The email address to subscribe
   * @returns {Promise<Object>} The created subscription record
   * @throws {Error} If email is invalid or already subscribed
   */
  async subscribe(email: string, name?: string, ) {
    throw new Error('subscribe method must be implemented');
  }

  /**
   * Unsubscribe a user from the newsletter
   * @param {string} email - The email address to unsubscribe
   * @returns {Promise<Object>} Success message with confirmation
   * @throws {Error} If email is not found
   */
  async unsubscribe(email: string): Promise<{}> {
    throw new Error('unsubscribe method must be implemented');
  }

  /**
   * Get all newsletter subscribers
   * @returns {Promise<Array>} Array of all subscriber records
   */
  async getAllSubscribers(): Promise<[Newsletter]> {
    throw new Error('getAllSubscribers method must be implemented');
  }

  // Optional methods that implementations might want to add
  /**
   * Get active subscribers only
   * @returns {Promise<Array>} Array of active subscriber records
   */
  async getActiveSubscribers(): Promise<[Newsletter]> {
    throw new Error('getActiveSubscribers method must be implemented');
  }
}

export default INewsletterService;