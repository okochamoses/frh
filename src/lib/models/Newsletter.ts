import {randomUUID} from "crypto";

export type NewsletterStatus = 'active' | 'inactive' | 'unsubscribed';

export interface NewsletterData {
  id: string;
  name?: string;
  email: string;
  subscribedAt: string; // ISO timestamp
  status: NewsletterStatus;
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  _rowIndex?: number; // Internal field for sheet operations
}

export class Newsletter implements NewsletterData {
  public id: string;
  public email: string;
  public name?: string;
  public subscribedAt: string;
  public status: NewsletterStatus;
  public createdAt: string;
  public updatedAt: string;
  public _rowIndex?: number;

  constructor(data: Partial<NewsletterData> = {}) {
    this.id = data.id || randomUUID();
    this.email = data.email;
    this.name = data.name;
    this.subscribedAt = data.subscribedAt || new Date().toISOString();
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this._rowIndex = data._rowIndex;
  }
}

export class NewsletterFactory {
  static createSubscription(email: string, name: string): Newsletter {
    if (!email) {
      throw new Error('Email is required');
    }
    return new Newsletter({
      name,
      email,
      subscribedAt: new Date().toISOString(),
      status: "active"
    })
  };
}