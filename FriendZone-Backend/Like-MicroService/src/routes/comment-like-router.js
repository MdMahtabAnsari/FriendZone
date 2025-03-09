const {Router} = require('express');
const commentLikeController = require('../controllers/comment-like-controller');
const {tokenValidator} = require('../validators/token-validator');
const {commentLikeParamsSchema} = require('../utils/zod/comment-like-schema-zod');
const {paramValidator} = require('../middlewares/validator-middleware');
const commentLikeRouter = Router();

commentLikeRouter.post('/like/:commentId', paramValidator(commentLikeParamsSchema), tokenValidator, commentLikeController.likeComment);
commentLikeRouter.post('/dislike/:commentId', paramValidator(commentLikeParamsSchema), tokenValidator, commentLikeController.dislikeComment);
commentLikeRouter.get('/get/likes/count/:commentId', paramValidator(commentLikeParamsSchema), commentLikeController.getLikeCount);
commentLikeRouter.get('/get/dislikes/count/:commentId', paramValidator(commentLikeParamsSchema), commentLikeController.getDislikeCount);
commentLikeRouter.delete('/remove/like/:commentId', paramValidator(commentLikeParamsSchema), tokenValidator, commentLikeController.removeLike);
commentLikeRouter.delete('/remove/dislike/:commentId', paramValidator(commentLikeParamsSchema), tokenValidator, commentLikeController.removeDislike);
commentLikeRouter.get('/get/likeAndDislike/status/:commentId', paramValidator(commentLikeParamsSchema), tokenValidator, commentLikeController.getCommentLikeAndDislike);

module.exports = commentLikeRouter;