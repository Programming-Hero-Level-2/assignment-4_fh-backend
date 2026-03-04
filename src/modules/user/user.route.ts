import express from 'express';
import { userController } from './user.controller';

const router = express.Router();

router
  .post('/', userController.createUser)
  .get('/', userController.getAllUsers)
  .get('/:id', userController.getUser)
  .patch('/:id', userController.updateUser)
  .delete('/:id', userController.deleteUser);

export { router as userRouter };
