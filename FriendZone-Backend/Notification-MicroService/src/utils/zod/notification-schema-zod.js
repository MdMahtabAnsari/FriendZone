const {z} = require('zod');

const notificationSchema = z.object({
    notificationId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid notification id'}).optional(),

});

const notificationQuerySchema = z.object({

    page: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Page should be a positive number."}).transform(Number).optional(),
    limit: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Limit should be a positive number."}).transform(Number).optional(),

});


module.exports = {
    notificationSchema,
    notificationQuerySchema
}