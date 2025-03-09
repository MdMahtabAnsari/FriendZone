import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const IconButtonComponent = ({ icon, label, onClick, color = 'default' }) => {
    return (
        <Tooltip title={label}>
            <IconButton onClick={onClick} color={color}>
                {icon}
            </IconButton>
        </Tooltip>
    );
};

IconButtonComponent.propTypes = {
    icon: PropTypes.element.isRequired, // Expects a JSX element
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func, // Now optional with a default no-op function
    color: PropTypes.oneOf(['default', 'inherit', 'primary', 'secondary']),
};

export default IconButtonComponent;
