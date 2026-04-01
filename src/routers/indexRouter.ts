import { Router } from 'express';
import userRouter from './userRouter';
import definitionRouter from './definitionRouter';

const router = Router();

router.use('/users', userRouter);
router.use('/definitions', definitionRouter);

export default router;
