import User, { IUserModel } from '../models/user.model';
import nodeMailer from 'nodemailer';

export class UserRepository {
  async getAll(): Promise<IUserModel[]> {
    return await User.find();
  }

  async getById(id: string): Promise<IUserModel | null> {
    return await User.findById(id);
  }

  async getByEmail(email: string): Promise<IUserModel | null> {
    return await User.findOne({ email });
  }

  async getByToken(token: string): Promise<IUserModel | null> {
    return await User.findOne({ registrationToken: token });
  }

  async create(userData: IUserModel): Promise<IUserModel> {
    const user = new User(userData);
    return await user.save();
  }

  async update(id: string, userData: IUserModel ): Promise<IUserModel | null> {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async delete(id: string): Promise<IUserModel | null> {
    return await User.findByIdAndDelete(id);
  }

  async sendMailer(to: string, subject: string, text: string) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    const transporter = nodeMailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });
  }

}
