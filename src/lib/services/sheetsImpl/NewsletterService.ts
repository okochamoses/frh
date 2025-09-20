import INewsletterService from "../INewsletterService";
import {Newsletter, NewsletterFactory} from "../../models/Newsletter";
import Repository from "@/lib/repositories/Repository";

class NewsletterService extends INewsletterService {
  private newsletterRepository: Repository<Newsletter>;
  constructor(newsletterRepository) {
    super();
    this.newsletterRepository = newsletterRepository
  }

  async subscribe(email: string, name: string) {
    if (await this.newsletterRepository.exists('email', email)) {
      throw new Error('Email already subscribed');
    }

    return await this.newsletterRepository.create(NewsletterFactory.createSubscription(email, name));
  }

  async unsubscribe(email: string) {
    const deleted = await this.newsletterRepository.delete('email', email);
    if (deleted === 0) {
      throw new Error('Email not found');
    }
    return { message: 'Unsubscribed successfully' };
  }

  async getAllSubscribers(): Promise<[Newsletter]> {
    return await this.newsletterRepository.findAll();
  }
}

export default NewsletterService;