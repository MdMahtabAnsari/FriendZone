import React from 'react';
import PropTypes from 'prop-types';
import { Switch, FormControlLabel } from '@mui/material';

const CustomSwitch = ({
                          label,
                          checked,
                          onChange,
                          color = 'primary',
                          disabled = false,
                          sx
                      }) => {
    return (
        <FormControlLabel
            control={
                <Switch
                    checked={checked}
                    onChange={onChange}
                    color={color}
                    disabled={disabled}
                    sx={sx}
                />
            }
            label={label}
        />
    );
};

// Prop types for documentation and error-checking
CustomSwitch.propTypes = {
    label: PropTypes.string.isRequired, // Label for the switch
    checked: PropTypes.bool.isRequired, // Checked state of the switch
    onChange: PropTypes.func.isRequired, // Function to call on change
    color: PropTypes.oneOf(['default', 'primary', 'secondary']), // Color of the switch
    disabled: PropTypes.bool, // Disable the switch
    sx: PropTypes.object, // Additional styles
};

export default CustomSwitch;
