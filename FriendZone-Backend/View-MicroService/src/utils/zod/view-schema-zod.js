const {z} = require('zod');

const viewParamsSchema = z.object({
    id: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid post id'}).optional(),
});

module.exports = {
    viewParamsSchema
}