const {Router} = require('express');
const userController = require('../controllers/user-controller');
const upload = require('../configs/multer-config');
const {tokenValidator} = require('../validators/token-validator');
const {bodyValidator, paramValidator, queryValidator} = require('../middlewares/validator-middleware');
const userSchema = require('../utils/zod/user-schema-zod');
const userRouter = Router();


userRouter.put('/update', tokenValidator, bodyValidator(userSchema.updateUserSchema), upload.single('image'), userController.updateUser);
userRouter.get('/get', queryValidator(userSchema.getUserSchema), userController.getUser);
userRouter.post('/get-filtered', bodyValidator(userSchema.getFilteredUsersSchema), userController.getFilteredUser);
userRouter.get('/get/name', queryValidator(userSchema.getUsersByNameSchema), userController.getUserByName);


module.exports = userRouter;

