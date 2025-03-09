const {Router} = require('express');
const notificationController = require('../controllers/notification-controller');
const {tokenValidator} = require('../validators/token-validator');
const {notificationQuerySchema, notificationSchema} = require('../utils/zod/notification-schema-zod');
const {queryValidator, bodyValidator} = require('../middlewares/validator-middleware');
const notificationRouter = Router();

notificationRouter.get('/get', queryValidator(notificationQuerySchema), tokenValidator, notificationController.getNotificationsByUserId);
notificationRouter.get('/get/unread-count', tokenValidator, notificationController.unreadNotificationCount);
notificationRouter.put('/mark-read', bodyValidator(notificationSchema), tokenValidator, notificationController.markNotificationAsRead);

module.exports = notificationRouter;