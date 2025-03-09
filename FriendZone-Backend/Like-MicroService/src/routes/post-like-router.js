const {Router} = require('express');
const postLikeController = require('../controllers/post-like-controller');
const {tokenValidator} = require('../validators/token-validator');
const {postLikeParamsSchema} = require('../utils/zod/post-like-schema-zod');
const {paramValidator} = require('../middlewares/validator-middleware');
const postLikeRouter = Router();

postLikeRouter.post('/like/:postId', paramValidator(postLikeParamsSchema), tokenValidator, postLikeController.likePost);
postLikeRouter.post('/dislike/:postId', paramValidator(postLikeParamsSchema), tokenValidator, postLikeController.dislikePost);
postLikeRouter.get('/get/likes/count/:postId', paramValidator(postLikeParamsSchema), postLikeController.getLikeCount);
postLikeRouter.get('/get/dislikes/count/:postId', paramValidator(postLikeParamsSchema), postLikeController.getDislikeCount);
postLikeRouter.delete('/remove/like/:postId', paramValidator(postLikeParamsSchema), tokenValidator, postLikeController.removeLike);
postLikeRouter.delete('/remove/dislike/:postId', paramValidator(postLikeParamsSchema), tokenValidator, postLikeController.removeDislike);
postLikeRouter.get('/get/likeAndDislike/status/:postId', paramValidator(postLikeParamsSchema), tokenValidator, postLikeController.getPostLikeAndDislike);

module.exports = postLikeRouter;