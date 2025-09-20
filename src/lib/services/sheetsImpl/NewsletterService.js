import INewsletterService from "../INewsletterService";

class NewsletterService extends INewsletterService {
  constructor(sheetsRepository) {
    super();
    this.sheetsRepo = sheetsRepository
  }

  async subscribe(email) {
    if (!email) {
      throw new Error('Email is required');
    }

    // Check if already subscribed
    const exists = await this.sheetsRepo.exists('email', email);
    if (exists) {
      throw new Error('Email already subscribed');
    }

    return await this.sheetsRepo.create({
      email,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    });
  }

  async unsubscribe(email) {
    const deleted = await this.sheetsRepo.delete('email', email);
    if (deleted === 0) {
      throw new Error('Email not found');
    }
    return { message: 'Unsubscribed successfully' };
  }

  async getAllSubscribers() {
    return await this.sheetsRepo.findAll();
  }
}

export default NewsletterService;