const {z} = require('zod');
const errorMessages = {
    _id: 'id should be a valid mongoDB ObjectId',
    name: 'Name should be a string with length between 3 and 20 with only alphabets and spaces',
    email: 'Email should be a valid email address',
    dateOfBirth: 'Date of birth should be a string in the format of DD/MM/YYYY',
    gender: "Gender should be a string with value (Male,Female,Other)",
    password: "Password should be a string with length between 8 and 20 with at least one uppercase letter, one lowercase letter, one number and one special character",
    timeZone: "Time zone should be a string with valid time zone format",
    image: "Image should be a string with valid image format (jpg,jpeg,png,gif)"

}
const signUpSchema = z.object({
    // Name should be a string with length between 3 and 20 with only alphabets and spaces
    name: z
        .string({ message: 'Name required in string format' })
        .trim()
        .min(3, { message: 'Name must be at least 3 characters' })
        .max(20, { message: 'Name must not exceed 20 characters' })
        .regex(/^[A-Za-z\s]+$/, { message: 'Name must contain only alphabets and spaces' })
        .optional(),

    // Email should be a valid email address
    email: z
        .string({ message: 'Email required in string format' })
        .trim()
        .email({ message: errorMessages.email })
        .optional(),

    // Date of Birth should follow the format DD/MM/YYYY
    dateOfBirth: z
        .string({ message: 'Date of Birth required in string format' })
        .trim()
        .regex(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
            { message: errorMessages.dateOfBirth }
        )
        .optional(),

    // Gender should be "Male", "Female", or "Other"
    gender: z
        .enum(['Male', 'Female', 'Other'], { message: errorMessages.gender })
        .optional(),

    // Password should have 8-20 characters with uppercase, lowercase, number, and special character
    password: z
        .string({ message: 'Password required in string format' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(20, { message: 'Password must not exceed 20 characters' })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: errorMessages.password }
        )
        .optional(),

    // TimeZone should follow a valid time zone format (e.g., "America/New_York")
    timeZone: z
        .string({ message: 'Time Zone required in string format' })
        .trim()
        .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, { message: errorMessages.timeZone })
        .optional(),

    // Image should be a string with a valid image extension
    image: z
        .string({ message: 'Image required in string format' }).optional(),

    bio: z.string().trim().max(150, {message: 'Bio must be less than 150 characters'}).optional()
});


const logInSchema = z.object({
//     email should be a valid email address
    email: z.string().trim().email({message: errorMessages.email}),
//     password should be a string with length between 8 and 20 with at least one uppercase letter, one lowercase letter, one number and one special character
    password: z
        .string({ message: 'Password required in string format' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(20, { message: 'Password must not exceed 20 characters' })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: errorMessages.password }
        )
});

const updateUserSchema = z.object({
    // id should be a valid MongoDB ObjectId
    _id: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, { message: errorMessages._id })
        .optional(),

    // email should be a valid email address and optional
    name: z
        .string({ message: 'Name required in string format' })
        .trim()
        .min(3, { message: 'Name must be at least 3 characters' })
        .max(20, { message: 'Name must not exceed 20 characters' })
        .regex(/^[A-Za-z\s]+$/, { message: 'Name must contain only alphabets and spaces' })
        .optional(),

    // Email should be a valid email address
    email: z
        .string({ message: 'Email required in string format' })
        .trim()
        .email({ message: errorMessages.email })
        .optional(),

    // Date of Birth should follow the format DD/MM/YYYY
    dateOfBirth: z
        .string({ message: 'Date of Birth required in string format' })
        .trim()
        .regex(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
            { message: errorMessages.dateOfBirth }
        )
        .optional(),

    // Gender should be "Male", "Female", or "Other"
    gender: z
        .enum(['Male', 'Female', 'Other'], { message: errorMessages.gender })
        .optional(),

    // Password should have 8-20 characters with uppercase, lowercase, number, and special character
    password: z
        .string({ message: 'Password required in string format' })
        .min(8, { message: 'Password must be at least 8 characters' })
        .max(20, { message: 'Password must not exceed 20 characters' })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: errorMessages.password }
        )
        .optional(),

    // TimeZone should follow a valid time zone format (e.g., "America/New_York")
    timeZone: z
        .string({ message: 'Time Zone required in string format' })
        .trim()
        .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, { message: errorMessages.timeZone })
        .optional(),

    // Image should be a string with a valid image extension
    image: z
        .string({ message: 'Image required in string format' }).optional(),


    bio: z.string().trim().max(150, {message: 'Bio must be less than 150 characters'}).optional()
});


const getUserSchema = z.object({
//     id should be a valid mongoDB ObjectId
    _id: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, { message: errorMessages._id })
        .optional(),
//     email should be a valid email address
    email: z.string().trim().email({message: errorMessages.email}).optional(),
});

const getFilteredUsersSchema = z.object({
//     id should be a valid mongoDB ObjectId and in form of array
    _id: z.array(
        z.string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, { message: errorMessages._id }) ,{message: 'id should be in array of valid mongoDB ObjectId'}).max(10, {message: 'id should not exceed 10'}).optional(),

});

const getUsersByNameSchema = z.object({
//     name should be a string
    name: z.string().trim().min(3, {message: 'Name must be at least 3 characters'}).max(20, {message: 'Name must not exceed 20 characters'}).optional(),
    page: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Page should be a positive number."}).transform(Number).optional(),
    limit: z.string().refine(value => !isNaN(value) && Number(value) > 0, {message: "Limit should be a positive number."}).transform(Number).optional(),
});


module.exports = {
    signUpSchema,
    logInSchema,
    updateUserSchema,
    getUserSchema,
    getFilteredUsersSchema,
    getUsersByNameSchema
}


