import {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import { CustomInput, CustomButton, MediaInput, CustomSelect, CustomDatePicker } from '../../components';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'; // Use AdapterMoment for Moment.js
import { useNavigate } from 'react-router-dom';
import {updateProfile as updateUserProfile} from "../../store/slices/user/user.js";
import {setUser} from '../../store/slices/auth/auth-slice.js'
import {useDispatch,useSelector} from "react-redux";
import moment from 'moment-timezone';
import useTheme from '../../hooks/useTheme.js'
import routesConfig from "../../routes/routes.js";


const updateProfile = () => {
    const {register, handleSubmit, setValue, watch, formState: {errors}} = useForm();
    const theme = useTheme();
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {user} = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            setValue('name', user?.name);
            setValue('dateOfBirth', moment(user.dateOfBirth, 'DD/MM/YYYY')); // Convert to Moment object
            setValue('gender', user?.gender);
            setValue('bio', user?.bio);
        }
    }, [setValue, user]);
    const onSubmit = async (data) => {
        data.timeZone = moment.tz.guess(); // Get user's timezone
        data.dateOfBirth = moment(data.dateOfBirth).format('DD/MM/YYYY'); // Format dateOfBirth as 'DD/MM/YYYY'
        console.log("Signup data:", data);
        setError(null);
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        const response = await dispatch(updateUserProfile(formData));
        if (response?.payload?.success) {
            const data = response.payload.data;
            dispatch(setUser(data));
            navigate(routesConfig.profile.replace(':userId', data._id));
        } else {
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
        {value: 'Male', label: 'Male'},
        {value: 'Female', label: 'Female'},
        {value: 'Other', label: 'Other'},
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
                    <Typography variant="h5" sx={{marginBottom: '20px'}} color="inherit">
                        Update Profile
                    </Typography>

                    {/* Name Input */}
                    <CustomInput
                        label="Name"
                        {...register('name', {required: 'Name is required'})}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{marginBottom: '20px'}}
                    />

                    {/*Date of Birth Picker*/}
                    <CustomDatePicker
                        label="Date of Birth"
                        value={watch('dateOfBirth') || null} // Use Moment object or null
                        onChange={handleDateChange}
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth?.message}
                        sx={{marginBottom: '20px'}}
                    />
                    {/*Select Gender*/}
                    <CustomSelect
                        label="Gender"
                        options={genderOptions}
                        value={watch('gender') || ''} // Default to '' if undefined
                        onChange={(e) => setValue('gender', e.target.value)}
                        helperText={errors.gender?.message}
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
                        sx={{marginBottom: '20px'}}
                    />

                    {error && (
                        <Typography variant="body2" sx={{color: 'red', marginTop: '10px'}}>
                            {error}
                        </Typography>
                    )}
                    <CustomButton
                        text="Update Profile"
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{marginTop: '10px'}}
                    />

                </Box>
            </Box>
        </LocalizationProvider>
    );
}

export default updateProfile;











