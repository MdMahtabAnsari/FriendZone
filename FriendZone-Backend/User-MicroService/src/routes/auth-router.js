const {Router} = require("express");
const {bodyValidator} = require("../middlewares/validator-middleware");
const userSchema = require("../utils/zod/user-schema-zod");
const upload = require("../configs/multer-config");
const userController = require("../controllers/user-controller");
const authRouter = Router();

authRouter.post('/signup', bodyValidator(userSchema.signUpSchema), upload.single('image'), userController.signUp);
authRouter.post('/login', bodyValidator(userSchema.logInSchema), userController.logIn);
authRouter.delete('/logout', userController.logOut);

module.exports = authRouter;