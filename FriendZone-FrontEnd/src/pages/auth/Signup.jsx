import React,{useState} from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import { CustomInput, CustomButton, MediaInput, CustomSelect, CustomDatePicker } from '../../components';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'; // Use AdapterMoment for Moment.js
import { useNavigate,Link } from 'react-router-dom';
import {signupUser} from "../../store/slices/auth/auth-slice.js";
import {useDispatch} from "react-redux";
import moment from 'moment-timezone';
import useTheme from '../../hooks/useTheme.js'
import routesConfig from "../../routes/routes.js";


const SignupForm = () => {
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
    const theme = useTheme();
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const onSubmit = async (data) => {

        data.timeZone = moment.tz.guess(); // Get user's timezone
        data.dateOfBirth = moment(data.dateOfBirth).format('DD/MM/YYYY'); // Format dateOfBirth as 'DD/MM/YYYY'
        console.log("Signup data:", data);
        setError(null);
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        const response = await dispatch(signupUser(formData));
        if(response?.payload?.success){
            navigate(routesConfig.home);
        }
        else {
            setError(response?.payload?.message);
        }
    };

    const handleDateChange = (date) => {
        setValue('dateOfBirth', date); // Set date as Moment object
    };

    const handleProfilePicChange = (file) => {
        setValue('image', file);
    };

    const genderOptions = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}> {/* Wrap in LocalizationProvider with Moment adapter */}
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
                        Sign Up
                    </Typography>

                    {/* Name Input */}
                    <CustomInput
                        label="Name"
                        {...register('name', { required: 'Name is required' })}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{ marginBottom: '20px' }}
                    />

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
                        helperText={errors.email?.message}
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
                            }
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        sx={{ marginBottom: '20px' }}
                    />

                    {/* Gender Select */}
                    <CustomSelect
                        label="Gender"
                        options={genderOptions}
                        value={watch('gender') || ''} // Default to '' if undefined
                        onChange={(e) => setValue('gender', e.target.value)}
                        helperText={errors.gender?.message}
                        sx={{ marginBottom: '20px' }}
                    />

                    {/* Date of Birth Picker */}
                    <CustomDatePicker
                        label="Date of Birth"
                        value={watch('dateOfBirth') || null} // Use Moment object or null
                        onChange={handleDateChange}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth?.message}
                        sx={{ marginBottom: '20px' }}
                    />

                    {/*Bio Input*/}
                    <CustomInput
                        label="Bio"
                        {...register('bio')}
                        error={!!errors.bio}
                        helperText={errors.bio?.message}
                        sx={{marginBottom: '20px'}}
                        multiline={true}
                    />

                    {/* Profile Picture Input */}
                    <MediaInput
                        label="Profile Picture"
                        onChange={handleProfilePicChange}
                        accept="image/*"
                        sx={{ marginBottom: '20px' }}
                    />
                    {error && (
                        <Typography variant="body2" sx={{ color: 'red', marginTop: '10px' }}>
                            {error}
                        </Typography>
                    )}
                    <CustomButton
                        text="Sign Up"
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: '10px' }}
                    />
                    {/*if user have already account    */}
                    <Typography variant="body2" sx={{ marginTop: '10px' }}>
                        Already have an account?
                        <Link to={routesConfig.login} style={{ color: theme.palette.primary.main }}>
                            Sign In
                        </Link>
                    </Typography>
                </Box>


            </Box>
        </LocalizationProvider>
    );
};

export default SignupForm;
