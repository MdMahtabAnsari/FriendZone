const {Router} = require('express');
const commentController = require('../controllers/comment-controller');
const {tokenValidator} = require('../validators/token-validator');
const {commentSchema, commentParamsSchema, commentQuerySchema} = require('../utils/zod/comment-schema-zod');
const {bodyValidator, paramValidator, queryValidator} = require('../middlewares/validator-middleware');
const commentRouter = Router();

commentRouter.post('/create', bodyValidator(commentSchema), tokenValidator, commentController.createComment);
commentRouter.put('/update', bodyValidator(commentSchema), tokenValidator, commentController.updateComment);
commentRouter.delete('/delete/:id', paramValidator(commentParamsSchema), tokenValidator, commentController.deleteComment);
commentRouter.get('/count/post/:id', paramValidator(commentParamsSchema), commentController.getCommentsCountByPostId);
commentRouter.get('/get/:id', paramValidator(commentParamsSchema), commentController.getCommentById);
commentRouter.get('/post/:postId/comment/:parentCommentId', paramValidator(commentParamsSchema), queryValidator(commentQuerySchema), commentController.getCommentsByPostIdAndParentCommentId);
commentRouter.get('/get/exists/:id', paramValidator(commentParamsSchema), commentController.isCommentExists);
commentRouter.get('/get/user-post/:id', paramValidator(commentParamsSchema), commentController.getUserIdAndPostIdByCommentId);
module.exports = commentRouter;