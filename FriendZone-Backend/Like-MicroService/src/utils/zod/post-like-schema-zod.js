const {z} = require('zod');

const postLikeParamsSchema = z.object({
    postId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid post id'}).optional(),

});

module.exports = {
    postLikeParamsSchema
}