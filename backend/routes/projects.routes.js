import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as projectController from '../controllers/projects.controllers.js'



const router = Router();

router.post('/create',authMiddleware,projectController.createProject);
router.post('/add',authMiddleware,projectController.addUser);
router.delete('/delete/:projectId',authMiddleware,projectController.deleteProject);
router.get('/fetch-collaborator/:projectId',authMiddleware,projectController.getCollaborators)
export default router