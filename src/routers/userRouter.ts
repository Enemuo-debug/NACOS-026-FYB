import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorizeSuperUser } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/login', userController.login);
router.put('/register/:token', userController.register);

// Protected routes (Any authenticated user)
router.get('/', authenticate, userController.getAllUsers);

// Super User only routes
router.post('/invite', authenticate, authorizeSuperUser, userController.inviteUser);
router.delete('/:id', authenticate, authorizeSuperUser, userController.deleteUser);

export default router;
