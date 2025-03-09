import { CustomInput, CustomButton } from '../../components/index.js';
import { Box, Typography, useTheme } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { Link,useNavigate } from "react-router-dom";
import routesConfig from "../../routes/routes.js";
import { sendOtp, verifyOtp, resetPassword } from "../../store/slices/auth/auth-slice.js";
import { useDispatch } from "react-redux";
import validator from "validator";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSendOtp = useCallback(async () => {
        if (email === '') {
            setError('Email is required');
            return;
        }
        if (!validator?.isEmail(email)) {
            setError('Invalid Email');
            return;
        }
        const response = await dispatch(sendOtp(email));
        if (response?.payload?.success) {
            setError(null);
            setIsOtpSent(true);
            setTimer(10 * 60); // Set timer for 10 minutes
        } else {
            setError(response?.payload?.message);
        }
    }, [dispatch, email]);

    const handleVerifyOtp = useCallback(async () => {
        if (otp.length !== 6) {
            setError('Invalid OTP');
            return;
        }
        if (email === '') {
            setError('Email is required');
            return;
        }
        if (!validator?.isEmail(email)) {
            setError('Invalid Email');
            return;
        }
        const response = await dispatch(verifyOtp({ email, otp }));
        if (response?.payload?.success) {
            setError(null);
            setIsOtpVerified(true); // Mark OTP as verified
        } else {
            setError(response?.payload?.message);
        }
    }, [dispatch, email, otp]);

    const handleResetPassword = useCallback(async () => {
        if (password === '') {
            setError('Password is required');
            return;
        }
        const response = await dispatch(resetPassword(password));
        if (response?.payload?.success) {
            setError(null);
            navigate(routesConfig.login);
        } else {
            setError(response?.payload?.message);
        }
    }, [dispatch, navigate, password]);

    // Countdown logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0 && isOtpSent) {
            setIsOtpSent(false);
        }
        return () => clearInterval(interval);
    }, [timer, isOtpSent]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                marginY: '10vh',
            }}
        >

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: theme.palette.background.paper,
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    maxWidth: '400px',
                    width: '100%',
                }}
            >
                <Typography variant="h4">Forgot Password</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                    }}
                >
                    <CustomInput
                        placeholder="Email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {isOtpSent ? (
                        <CustomButton
                            text={`Resend OTP in ${formatTime(timer)}`}
                            disabled
                            sx={{ width: '150px' }}
                        />
                    ) : (
                        <CustomButton
                            text="Send OTP"
                            onClick={handleSendOtp}
                            sx={{ width: '150px' }}
                        />
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                    }}
                >
                    <CustomInput
                        placeholder="OTP"
                        label="OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <CustomButton
                        text={isOtpVerified ? "Verified" : "Verify OTP"}
                        onClick={handleVerifyOtp}
                        disabled={isOtpVerified}
                        sx={{ width: '150px' }}
                    />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 2,
                    }}
                >
                    <CustomInput
                        placeholder="Password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <CustomButton
                        text="Reset Password"
                        onClick={handleResetPassword}
                        sx={{ width: '150px' }}
                    />
                </Box>
                {error && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.error.main,
                        }}
                    >
                        {error}
                    </Typography>
                )}
                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.text.secondary,
                    }}
                >
                    Remember your password? <Link to={routesConfig.login} style={{ color: theme.palette.primary.main }}>Login</Link>
                </Typography>
            </Box>

        </Box>
    );
};

export default ForgotPassword;
