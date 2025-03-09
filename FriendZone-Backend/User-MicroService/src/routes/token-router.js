const {Router} = require('express');

const tokenController = require('../controllers/token-controller');

const tokenRouter = Router();

tokenRouter.post('/refresh', tokenController.refreshToken);

module.exports = tokenRouter;