const {z} = require('zod');

const commentSchema = z.object({
    parentCommentId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid parentCommentId'}).optional(),
    postId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid postId'}).optional(),
    comment: z.string({message: "Comment should be a string"}).trim().min(1, {message: 'Comment should not be empty'}).max(1000, {message: 'Comment should not exceed 1000 characters'}).optional(),
    commentId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid commentId'}).optional(),
});

const commentParamsSchema = z.object({
    id: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid id'}).optional(),
    postId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid postId'}).optional(),
    // parentCommentId should be a valid mongodb id or null if not present in the url params
    parentCommentId: z.union([z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid parentCommentId'}), z.literal(':parentCommentId')]).optional(),
});

const commentQuerySchema = z.object({

    page: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Page should be a positive number."}).transform(Number).optional(),
    limit: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Limit should be a positive number."}).transform(Number).optional(),

});

module.exports = {
    commentSchema,
    commentParamsSchema,
    commentQuerySchema
}
