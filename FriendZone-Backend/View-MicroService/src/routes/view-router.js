const {Router} = require('express');
const viewController = require('../controllers/view-controller');
const {tokenValidator} = require('../validators/token-validator');
const {viewParamsSchema} = require('../utils/zod/view-schema-zod');
const {paramValidator} = require('../middlewares/validator-middleware');
const viewRouter = Router();

viewRouter.post('/view/:id', paramValidator(viewParamsSchema), tokenValidator, viewController.createViewPost);
viewRouter.get('/view/:id', paramValidator(viewParamsSchema), viewController.getPostViews);

module.exports = viewRouter;