import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const CustomInput = forwardRef(function CustomInput({ label, type = 'text', value, onChange, inputRef, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);

    const handleToggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <TextField
            ref={ref}
            inputRef={inputRef}
            label={label}
            type={showPassword && type === 'password' ? 'text' : type}
            value={value}
            onChange={onChange}
            slotProps={{
                input: {
                    endAdornment: type === 'password' && (
                        <InputAdornment position="end">
                            <IconButton onClick={handleToggleShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
            {...props}
        />
    );
});

CustomInput.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]),
};

export default CustomInput;