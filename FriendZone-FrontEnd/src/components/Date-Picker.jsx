import React from 'react';
import { MobileDatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

const CustomDatePicker = ({ label, value, onChange, error, helperText, ...props }) => {
    return (
        <MobileDatePicker
            label={label}
            value={value}
            onChange={onChange}
            // Instead of renderInput, use the textField prop
            textField={(params) => (
                <TextField {...params} error={error} helperText={helperText} fullWidth />
            )}
            {...props}
        />
    );
};

CustomDatePicker.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.any, // Use appropriate type based on your date management (moment, Date, etc.)
    onChange: PropTypes.func.isRequired,
    error: PropTypes.bool,
    helperText: PropTypes.string,
};

export default CustomDatePicker;
