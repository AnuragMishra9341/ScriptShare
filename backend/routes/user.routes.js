import { Router } from "express";
import { body } from "express-validator";
import * as userController from '../controllers/users.controllers.js'
const router = Router();

router.post('/signUp',
    body('email').isEmail()
  .withMessage("Email must be a valid email address"),
     body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be atleast of 3 characters"),
    userController.signUpController
)

router.post('/login',
     body('email').isEmail()
  .withMessage("Email must be a valid email address"),
     body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be atleast of 3 characters"),
    userController.loginController
)

export default router