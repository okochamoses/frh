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
   * @param {string} email - The email address to subscribe
   * @returns {Promise<Object>} The created subscription record
   * @throws {Error} If email is invalid or already subscribed
   */
  async subscribe(email) {
    throw new Error('subscribe method must be implemented');
  }

  /**
   * Unsubscribe a user from the newsletter
   * @param {string} email - The email address to unsubscribe
   * @returns {Promise<Object>} Success message with confirmation
   * @throws {Error} If email is not found
   */
  async unsubscribe(email) {
    throw new Error('unsubscribe method must be implemented');
  }

  /**
   * Get all newsletter subscribers
   * @returns {Promise<Array>} Array of all subscriber records
   */
  async getAllSubscribers() {
    throw new Error('getAllSubscribers method must be implemented');
  }

  // Optional methods that implementations might want to add
  /**
   * Get active subscribers only
   * @returns {Promise<Array>} Array of active subscriber records
   */
  async getActiveSubscribers() {
    throw new Error('getActiveSubscribers method must be implemented');
  }

  /**
   * Update subscriber status
   * @param {string} email - The email address to update
   * @param {string} status - New status (active, inactive, unsubscribed)
   * @returns {Promise<Object>} Updated subscriber record
   */
  async updateSubscriberStatus(email, status) {
    throw new Error('updateSubscriberStatus method must be implemented');
  }

  /**
   * Get total subscriber count
   * @returns {Promise<number>} Total number of subscribers
   */
  async getSubscriberCount() {
    throw new Error('getSubscriberCount method must be implemented');
  }

  /**
   * Check if an email is already subscribed
   * @param {string} email - The email address to check
   * @returns {Promise<boolean>} True if email exists, false otherwise
   */
  async isSubscribed(email) {
    throw new Error('isSubscribed method must be implemented');
  }
}

export default INewsletterService;