import React, {useState}from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, useTheme } from '@mui/material';
import { CustomInput, CustomButton } from '../../components';
import {useDispatch}  from "react-redux";
import {loginUser} from "../../store/slices/auth/auth-slice.js";
import {useNavigate,Link} from "react-router-dom";
import routesConfig from "../../routes/routes.js";

const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();

    const onSubmit =async (data) => {
        console.log("Login data:", data);
       setError(null);
        const response = await dispatch(loginUser(data));
        if(response?.payload?.success){
            navigate(routesConfig.home);
        }
        else {
            setError(response?.payload?.message);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '400px',
                    width: '100%',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[3],
                    textAlign: 'center'
                }}
            >
                <Typography variant="h5" sx={{ marginBottom: '20px' }} color="inherit">
                    Login
                </Typography>

                {/* Email Input */}
                <CustomInput
                    label="Email"
                    type="email"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'Invalid email address'
                        }
                    })}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
                    sx={{ marginBottom: '20px' }}
                />

                {/* Password Input */}
                <CustomInput
                    label="Password"
                    type="password"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters long'
                        },
                    })}
                    error={!!errors.password}
                    helperText={errors.password ? errors.password.message : ''}
                    sx={{ marginBottom: '20px' }}
                />
                {error && (
                    <Typography variant="body2" sx={{ color: 'red', marginTop: '10px' }}>
                        {error}
                    </Typography>
                )}
                <CustomButton
                    text="Login"
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: '10px' }}
                />
            {/*    forgot your password*/}
                <Typography variant="body2" sx={{ marginTop: '10px' }}>
                    <Link to={routesConfig.forgotPassword} style={{ color: theme.palette.primary.main }}>
                        Forgot your password?
                    </Link>
                </Typography>
            {/*    you have no account*/}
                <Typography variant="body2" sx={{ marginTop: '10px' }}>
                    Don't have an account?{' '}
                    <Link to={routesConfig.signup} style={{ color: theme.palette.primary.main }}>
                        Sign Up
                    </Link>
                </Typography>

            </Box>
        </Box>
    );
};

export default LoginForm;
