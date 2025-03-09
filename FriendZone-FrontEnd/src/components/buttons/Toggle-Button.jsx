// ToggleButtonComponent.js
import React from 'react';
import PropTypes from 'prop-types';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';

const ToggleButtonComponent = ({ options, selectedOption, onChange }) => {
    return (
        <ToggleButtonGroup
            value={selectedOption}
            exclusive
            onChange={(_, newOption) => onChange(newOption)}
            aria-label="toggle button group"
        >
            {options?.map((option) => (
                <Tooltip title={option.label} key={option.value}>
                    <ToggleButton
                        value={option.value}
                        aria-label={option.label}
                    >
                        {option.label}
                    </ToggleButton>
                </Tooltip>
            ))}
        </ToggleButtonGroup>
    );
};

// Prop types for documentation and error-checking
ToggleButtonComponent.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired, // Value for the toggle option
            label: PropTypes.string.isRequired, // Label to display
        })
    ).isRequired,
    selectedOption: PropTypes.string.isRequired, // Currently selected option
    onChange: PropTypes.func.isRequired, // Function to call when option changes
};

export default ToggleButtonComponent;
