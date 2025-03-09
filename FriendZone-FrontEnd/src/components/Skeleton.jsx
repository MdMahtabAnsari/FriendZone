import React from 'react';
import PropTypes from 'prop-types';
import { Skeleton, Box} from '@mui/material';
import useTheme from "../hooks/useTheme.js";

const CustomSkeleton = ({ variant = 'rectangular', width = '100%', height = '100%', count = 1, sx }) => {
    const theme = useTheme();
    const backgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', ...sx }}>
            {Array?.from({ length: count }).map((_, index) => (
                <Skeleton
                    key={index}
                    variant={variant}
                    width={width}
                    height={height}
                    sx={{ borderRadius: '4px', backgroundColor }} // Apply background color based on theme
                />
            ))}
        </Box>
    );
};

// Prop types for documentation and error-checking
CustomSkeleton.propTypes = {
    variant: PropTypes.oneOf(['text', 'circular', 'rectangular', 'rounded']), // Skeleton variants
    width: PropTypes.string, // Width of the skeleton
    height: PropTypes.string, // Height of the skeleton
    count: PropTypes.number, // Number of skeletons to render
    sx: PropTypes.object, // Additional styles
};

export default CustomSkeleton;
