import {NewsletterFactory} from "@/lib/models/Newsletter";
import {randomUUID} from "crypto";

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string | null;
  mobileNumber: string;
  googleId: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  provider: 'local' | 'google';
  profilePicture: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public id: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public username: string;
  public password: string | null;
  public mobileNumber: string;
  public googleId: string | null;
  public isEmailVerified: boolean;
  public isActive: boolean;
  public provider: 'local' | 'google';
  public profilePicture: string;
  public lastLoginAt: Date | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(userData: UserData) {
    this.id = userData.id;
    this.firstName = userData.firstName || '';
    this.lastName = userData.lastName || '';
    this.email = userData.email || '';
    this.username = userData.username || userData.email;
    this.password = userData.password || null;
    this.mobileNumber = userData.mobileNumber || '';
    this.googleId = userData.googleId || null;
    this.isEmailVerified = userData.isEmailVerified !== undefined ? userData.isEmailVerified : false;
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
    this.provider = userData.provider || 'local';
    this.profilePicture = userData.profilePicture || '';
    this.lastLoginAt = userData.lastLoginAt || null;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
  }
}

export class UserFactory {
  public static create(userData: Partial<UserData>): User {
    console.log("In the User factory")
    const timestamp = new Date();
    const newUser: UserData = {
      id: randomUUID(),
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      username: userData.username || userData.email || '',
      password: userData.password || null,
      mobileNumber: userData.mobileNumber || '',
      googleId: userData.googleId || null,
      isEmailVerified: userData.isEmailVerified !== undefined ? userData.isEmailVerified : false,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      provider: userData.provider || 'local',
      profilePicture: userData.profilePicture || '',
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: userData.createdAt || timestamp,
      updatedAt: userData.updatedAt || timestamp,
    };
    console.log("creating user: ", newUser)
    return new User(newUser);
  }
}