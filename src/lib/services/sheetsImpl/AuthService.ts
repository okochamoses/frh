import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {LoginTicket, OAuth2Client, TokenPayload} from 'google-auth-library';
import UserRepository from "../../repositories/sheetsImpl/UserRepository";
import {User, UserFactory} from "../../models/User";
import MailService from "@/lib/mail/MailService";

class AuthService {
  private userRepo: UserRepository;
  private googleClient: OAuth2Client;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private mailService: MailService;
  constructor() {
    this.userRepo = new UserRepository();
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.mailService = MailService
  }

  async googleSignIn(idToken: string): Promise<{ user: User; token: string }> {
    const ticket: LoginTicket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload: TokenPayload = ticket.getPayload() as TokenPayload;
    if (!payload) throw new Error('Invalid Google token');

    const { sub: googleId, email, given_name, family_name, picture, email_verified, mobileNumber } = payload;
    if (!email) throw new Error('Google account has no email');
    console.log(payload)

    // Check if user exists
    let user: User = await this.userRepo.findOne({email});

    if (!user) {
      // New user → sign up
      const newUser: User = UserFactory.create({
        id: crypto.randomUUID(),
        firstName: given_name || '',
        lastName: family_name || '',
        email,
        username: email.split('@')[0],
        password: null, // Google users don’t need password
        mobileNumber,
        googleId: googleId || null,
        isEmailVerified: email_verified || false,
        isActive: true,
        provider: 'google',
        profilePicture: picture || '',
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      user = await this.userRepo.create(newUser);
    } else {
      // Existing user → update last login
      user.lastLoginAt = new Date();
      // await this.userRepo.update(user.id, user); // TODO: fix later
    }

    // Issue JWT
    const token = this.generateToken(user);
    return { user, token };
  }

  /**
   * Check if an email is already registered
   */
  async checkEmail(email: string): Promise<{ isSignedUp: boolean }> {
    const user = await this.userRepo.findOne({ email, provider: 'local' });
    return { isSignedUp: !!user };
  }

  /** 🔒 Hash password before saving */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /** 🧠 Compare hashed password */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async localSignIn(email, password){
    const user = await this.userRepo.findOne({ email, provider: 'local' });
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if(!isPasswordValid) throw new Error("Email and password combination is wrong")
    const token = this.generateToken(user);
    return { user, token };
  }

  /** 🧑‍💻 Create a new user */
  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    // Check if email already exists
    const existing = await this.userRepo.findOne({ email: data.email, provider: 'local' });
    if (existing) throw new Error("Email is already registered");

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user via the factory
    const newUser = UserFactory.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      mobileNumber: data.phone,
      provider: "local",
      isEmailVerified: false,
      isActive: true,
      lastLoginAt: new Date(),
    });

    const savedUser = await this.userRepo.create(newUser);
    // send welcome email
    MailService.sendWelcomeEmail({
      to: savedUser.email,
      toName: `${savedUser.firstName} ${savedUser.lastName}`,
      firstName: savedUser.firstName,
      verificationLink: 'https://fakelink.com',
    })

    const token = this.generateToken(savedUser);
    delete savedUser.password;
    return { user: savedUser, token };
  }

  private generateToken(user: User): string {
    return jwt.sign(
        { id: user.id, email: user.email, provider: user.provider },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
    );
  }
}

export default AuthService;