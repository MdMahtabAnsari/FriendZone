const {Router} = require("express");
const upload = require('../configs/multer-config');
const {isMediaSizeValid} = require('../middlewares/media-middleware');
const {tokenValidator} = require('../validators/token-validator');
const {postSchema, postParamsSchema, postQuerySchema} = require('../utils/zod/post-schema-zod');
const {bodyValidator, paramValidator, queryValidator} = require('../middlewares/validator-middleware');
const postController = require('../controllers/post-controller');

const postRouter = Router();

// Post creation and updates
postRouter.post('/create', bodyValidator(postSchema), tokenValidator, upload.array('media', 20), isMediaSizeValid, postController.createPost);
postRouter.put('/update', bodyValidator(postSchema), tokenValidator, upload.array('media', 20), isMediaSizeValid, postController.updatePost);

// Fetching posts
postRouter.get('/random', postController.getRandomPosts);
postRouter.get('/user/:userId', queryValidator(postQuerySchema), postController.getUsersPosts);
postRouter.get('/:postId', paramValidator(postParamsSchema), postController.getPostById);
postRouter.get('/', queryValidator(postQuerySchema), postController.getPosts);
postRouter.get('/content/get', queryValidator(postQuerySchema), postController.getPostsByContent);
postRouter.get('/tags/get', queryValidator(postQuerySchema), postController.getPostsByTag);
postRouter.get('/recommendations/get', queryValidator(postQuerySchema), tokenValidator, postController.getEnhancedRecommendations);
postRouter.get('/get/user/posts/count/:userId', paramValidator(postParamsSchema), postController.getUserPostsCount);

// Post existence check and deletion
postRouter.delete('/delete/:postId', paramValidator(postParamsSchema), tokenValidator, postController.deletePost);
postRouter.get('/get/exists/:postId', paramValidator(postParamsSchema), postController.isPostExists);
postRouter.get('/get/userId/:postId', paramValidator(postParamsSchema), postController.getUserIdByPostId);

module.exports = postRouter;
