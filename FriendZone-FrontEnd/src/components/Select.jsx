// CustomSelect.js
import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const CustomSelect = ({
                          options,
                          label,
                          value,
                          onChange,
                          helperText,
                          disabled = false,
                          fullWidth = false,
                          variant = 'outlined', // Default variant set to 'outlined'
                          sx,
                      }) => {
    return (
        <FormControl variant={variant} fullWidth={fullWidth} sx={{ ...sx }}>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                onChange={onChange}
                label={label}
                disabled={disabled}
                variant={variant} // Ensure variant is passed to Select
            >
                {options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

// Prop types for documentation and error-checking
CustomSelect.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired, // Option value
            label: PropTypes.string.isRequired, // Option label
        })
    ).isRequired,
    label: PropTypes.string.isRequired, // Label for the select
    value: PropTypes.string.isRequired, // Current selected value
    onChange: PropTypes.func.isRequired, // Function to handle change
    helperText: PropTypes.string, // Optional helper text
    disabled: PropTypes.bool, // Disable select state
    fullWidth: PropTypes.bool, // Full width select
    variant: PropTypes.oneOf(['outlined', 'filled', 'standard']), // Variant type
    sx: PropTypes.object, // Additional styles
};

export default CustomSelect;
