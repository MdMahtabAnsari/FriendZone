const {z} = require('zod');

const followerSchema = z.object({
    followingId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid user id'}).optional(),
});

const followerParamsSchema = z.object({
    userId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid userId'}).optional(),
});


const followerQuerySchema = z.object({

    page: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Page should be a positive number."}).transform(Number).optional(),
    limit: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Limit should be a positive number."}).transform(Number).optional(),

});


module.exports = {
    followerSchema,
    followerParamsSchema,
    followerQuerySchema
}