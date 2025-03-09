const {z} = require('zod');

const commentLikeParamsSchema = z.object({
    commentId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid comment id'}).optional(),
});


module.exports = {
    commentLikeParamsSchema
}