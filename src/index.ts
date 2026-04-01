import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import { UserRole } from './interfaces/user.interface';
import indexRouter from './routers/indexRouter';
import swaggerUi from 'swagger-ui-express';
import buildSwaggerSpec from './config/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const swaggerSpec = buildSwaggerSpec(process.env.APP_URL || `http://localhost:${port}`);

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api', indexRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the FYB API!');
});

const seedSuperUser = async () => {
  const superUserEmail = process.env.SUPER_USER_EMAIL || 'superuser@example.com';
  const superUserPassword = process.env.SUPER_USER_PASSWORD || 'superuserpassword';

  try {
    const existingSuperUser = await User.findOne({ role: UserRole.SUPER_USER });
    if (!existingSuperUser) {
      const superUser = new User({
        email: superUserEmail,
        password: superUserPassword,
        role: UserRole.SUPER_USER,
        name: 'Super User'
      });
      await superUser.save();
      console.log('Super User created successfully');
    }
  } catch (err) {
    console.error('Error seeding Super User:', err);
  }
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fyb')
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedSuperUser();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
