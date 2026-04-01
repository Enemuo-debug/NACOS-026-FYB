import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { LoginRequest, UserRole, UserOutput } from '../interfaces/user.interface';
import crypto from 'crypto';
import { IUserModel } from '../models/user.model';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await this.userRepository.getByEmail(email);
      if (!user || !user.password) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'supersecretkey',
        { expiresIn: '1d' }
      );

      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: 'Error during login', error: err });
    }
  };

  public inviteUser = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const existingUser = await this.userRepository.getByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      const registrationToken = crypto.randomBytes(32).toString('hex');
      const appUrl = process.env.APP_URL || 'http://localhost:3000';

      await this.userRepository.create({
        email,
        role: UserRole.USER,
        isInvited: true,
        registrationToken,
        createdAt: new Date(),
        updatedAt: new Date()
      } as IUserModel);

      await this.userRepository.sendMailer(
        email,
        'You are invited to join FYB',
        `You have been invited to join the FYB platform. Please complete your registration here: ${appUrl}/register?token=${registrationToken}\n\nIf you did not request this invitation, you can ignore this email.`
      );

      res.status(200).json({ message: 'Invitation sent' });
    } catch (err) {
      res.status(500).json({ message: 'Error inviting user', error: err });
    }
  };

  public register = async (req: Request<{token: string}, {}, { password: string; name: string }>, res: Response) => {
    const { password, name } = req.body;
    const { token } = req.params;
    try {
      const user = await this.userRepository.getByToken(token);
      if (!user || !user.isInvited) {
        res.status(400).json({ message: 'Invalid or expired registration token' });
        return;
      }

      user.password = password;
      user.name = name;
      user.isInvited = false;
      user.registrationToken = undefined;
      
      await user.save();

      res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error registering user', error: err });
    }
  };

  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userRepository.getAll();
      res.json(users.map(user => ({
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      } as UserOutput)));
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  };

  public deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const userToDelete = await this.userRepository.getById(id as string);
      if (!userToDelete) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      if (userToDelete.role === UserRole.SUPER_USER) {
        res.status(403).json({ message: 'Cannot delete Super User' });
        return;
      }

      await this.userRepository.delete(id as string);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting user', error: err });
    }
  };
}
