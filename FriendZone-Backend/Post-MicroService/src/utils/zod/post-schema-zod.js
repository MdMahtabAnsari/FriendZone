const {z} = require('zod');

const postSchema = z.object({
//     userId should mongodb id
    _id: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid user id'}).optional(),
    content: z.string({message: "Content should be a string"}).min(1, {message: 'Content should not be empty'}).max(1000, {message: 'Content should not exceed 1000 characters'}).optional(),
    tags: z.array(z.string({message: "Tags should be strings"}), {message: "Tags should be an array of strings"}).max(30, {message: 'Tags should not exceed 30'}).optional(),
//         images should be array of strings and cloudinary urls
    images: z.array(z.string({message: "Image should have valid url"}), {message: "Image should be an array of urls"}).optional(),
//         videos should be array of strings and cloudinary urls
    videos: z.array(z.string({message: "Image should have valid url"}), {message: "Video should be an array of urls"}).optional(),
    media: z.array(z.string(), {message: "Images/videos should be an array"}).max(20, {message: 'Media should not exceed 10'}).optional(),
});

const postParamsSchema = z.object({
    postId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid post id'}).optional(),
    userId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, {message: 'Invalid user id'}).optional(),
});

const postQuerySchema = z.object({

    page: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Page should be a positive number."}).transform(Number).optional(),
    limit: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Limit should be a positive number."}).transform(Number).optional(),
    content: z.string({message: "Content should be a string"}).min(1, {message: "Content should not be empty"}).max(1000, {message: "Content should not exceed 1000 characters"}).optional(),
    tags: z.array(z.string({message: "Tags should be strings"}), {message: "Tags should be an array of strings"}).max(10, {message: "Tags should not exceed 30"}).optional(),

});


module.exports = {
    postSchema,
    postParamsSchema,
    postQuerySchema
};