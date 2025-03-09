const UserServices = require('../services/user-service');
const AppError = require('../utils/errors/app-error');
const serverConfig = require('../configs/server-config');
const userServices = new UserServices();

const logIn = async (req, res) => {
    try {
        const {email, password} = req.body;
        const response = await userServices.logIn(email, password);

        res.cookie(serverConfig?.AUTH_COOKIE_NAME, response?.token?.authTokens, {
            httpOnly: serverConfig?.COOKIE_SECURE,
            secure: serverConfig?.COOKIE_SECURE,
            expires: new Date(Date.now() + serverConfig?.AUTH_COOKIE_EXPIRES_IN),
            // sameSite: serverConfig?.COOKIE_SAME_SITE,
        }).cookie(serverConfig?.REFRESH_COOKIE_NAME, response?.token?.refreshToken, {
            httpOnly: serverConfig?.COOKIE_SECURE,
            secure: serverConfig?.COOKIE_SECURE,
            expires: new Date(Date.now() + serverConfig?.REFRESH_COOKIE_EXPIRES_IN),
            // sameSite: serverConfig?.COOKIE_SAME_SITE,
        }).status(200).json({
            message: "Successfully logged in",
            success: true,
            data: response?.user,
            error: {}
        });

    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const signUp = async (req, res) => {
    try {
        const userDetails = {
            name: req.body?.name,
            email: req.body?.email,
            password: req.body?.password,
            dateOfBirth: req.body?.dateOfBirth,
            gender: req.body?.gender,
            image: req.file?.path,
            timeZone: req.body?.timeZone,
            bio: req.body?.bio
        }
        console.log(req.file?.path)
        const response = await userServices.signUp({...userDetails});
        res.status(201).json({
            message: "Successfully signed up",
            success: true,
            data: response,
            error: {}
        });

    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
};

const logOut = async (req, res) => {
    try {
        res.clearCookie(serverConfig?.AUTH_COOKIE_NAME).clearCookie(serverConfig?.REFRESH_COOKIE_NAME).status(200).json({
            message: "Successfully logged out",
            success: true,
            data: {},
            error: {}
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false,
            data: {},
            error: "error",
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req?.user?._id;
        const email = req?.user?.email;
        const userDetails = {
            _id: id,
            name: req.body?.name,
            email: email,
            dateOfBirth: req.body?.dateOfBirth,
            gender: req.body?.gender,
            image: req.file?.path,
            password: req.body?.password,
            timeZone: req.body?.timeZone,
            bio: req.body?.bio
        }
        const response = await userServices.updateUser({...userDetails});

        res.clearCookie(serverConfig?.OTP_COOKIE_NAME).status(200).json({
            message: "Successfully updated user",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getUser = async (req, res) => {
    try {
        const id = req?.query?._id;
        const email = req?.query?.email;
        const response = await userServices.getUser({id, email});
        res.status(200).json({
            message: "Successfully fetched user",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getFilteredUser = async (req, res) => {
    try {
        const id = req?.body?._id;
        const response = await userServices.getFilteredUsers(id);
        res.status(200).json({
            message: "Successfully fetched user",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}

const getUserByName = async (req, res) => {
    try {
        const name = req?.query?.name;
        const page = req?.query?.page;
        const limit = req?.query?.limit;
        const response = await userServices.getUserByName({name, page, limit});
        res.status(200).json({
            message: "Successfully fetched user",
            success: true,
            data: response,
            error: {}
        });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                message: error.message,
                success: false,
                data: {},
                error: error.status
            });
        } else {
            console.log(error);
            res.status(500).json({
                message: "Internal Server Error",
                success: false,
                data: {},
                error: "error",
            });
        }
    }
}


module.exports = {
    logIn,
    signUp,
    logOut,
    updateUser,
    getUser,
    getFilteredUser,
    getUserByName
}

