const {Router} = require('express');
const followerController = require('../controllers/follower-controller');
const {tokenValidator} = require('../validators/token-validator');
const {followerParamsSchema, followerQuerySchema, followerSchema} = require('../utils/zod/follower-schema-zod');
const {bodyValidator, queryValidator, paramValidator} = require('../middlewares/validator-middleware');

const followerRouter = Router();
// create a follower
followerRouter.post('/create', bodyValidator(followerSchema), tokenValidator, followerController.createFollower);
// delete a follower
followerRouter.delete('/delete/:userId', paramValidator(followerParamsSchema), tokenValidator, followerController.deleteFollower);
// get followers of a user
followerRouter.get('/getFollowers/:userId',paramValidator(followerParamsSchema) ,queryValidator(followerQuerySchema), followerController.getFollowersByUserId);
// get following of a user
followerRouter.get('/getFollowing/:userId',paramValidator(followerParamsSchema) ,queryValidator(followerQuerySchema), followerController.getFollowingByUserId);
// check if user is following another user
followerRouter.get('/isFollowing/:userId', paramValidator(followerParamsSchema), tokenValidator, followerController.isFollowing);
// get followers count of a user
followerRouter.get('/getFollowersCount/:userId',paramValidator(followerParamsSchema) ,followerController.getFollowersCountByUserId);
// get following count of a user
followerRouter.get('/getFollowingCount/:userId',paramValidator(followerParamsSchema) ,followerController.getFollowingCountByUserId);
// get mutual followers of a user
followerRouter.get('/getMutualFollowers/:userId', paramValidator(followerParamsSchema), queryValidator(followerQuerySchema), tokenValidator, followerController.getMutualFollowers);
// get following suggestions for a user
followerRouter.get('/getFollowerSuggestions', queryValidator(followerQuerySchema), tokenValidator, followerController.getFollowerSuggestions);
module.exports = followerRouter;