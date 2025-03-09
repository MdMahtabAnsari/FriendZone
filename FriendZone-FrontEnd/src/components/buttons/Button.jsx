// CustomButton.js
import React from 'react';
import Button from '@mui/material/Button';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

// Styled MUI Button with custom styling options
const StyledButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'buttonColor', // Prevent 'buttonColor' from reaching the DOM
})(({ theme, buttonColor }) => ({
    backgroundColor: buttonColor,
    color: theme.palette.getContrastText(buttonColor),
    padding: theme.spacing(1, 3),
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

// CustomButton Component
const CustomButton = ({ text, onClick, color, variant = 'contained', disabled, size = 'medium', ...props }) => {
    const theme = useTheme();

    // Use a valid color, defaulting to theme's primary if color is invalid or not provided
    const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(color) || color?.includes('rgb') || color?.includes('hsl');
    const buttonColor = isValidColor ? color : theme.palette.primary.main;

    return (
        <StyledButton
            variant={variant}
            disabled={disabled}
            size={size}
            buttonColor={buttonColor} // Pass the color prop to StyledButton
            onClick={onClick}
            {...props} // Spread other props here
        >
            {text}
        </StyledButton>
    );
};

// Prop types for documentation and error-checking
CustomButton.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    color: PropTypes.string,
    variant: PropTypes.oneOf(['text', 'contained', 'outlined']),
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
};

export default CustomButton;
