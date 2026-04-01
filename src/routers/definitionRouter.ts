import { Router } from 'express';
import { FYBDefinitionController } from '../controllers/fybDefinition.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new FYBDefinitionController();

router.post('/', authenticate, controller.create);
router.get('/', authenticate, controller.list);
router.post('/:definitionId/entries', controller.createEntry);
router.get('/:definitionId/entries', controller.listEntries);

export default router;
