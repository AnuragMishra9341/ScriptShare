import { Router } from "express";
import { body } from "express-validator";
import * as userController from '../controllers/users.controllers.js'
const router = Router();

router.get('/signUp',
    body('email').isEmail().withMessage("Email must be a valid email address"),
     body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be atleast of 3 characters"),
    userController.signUpController
)

export default router