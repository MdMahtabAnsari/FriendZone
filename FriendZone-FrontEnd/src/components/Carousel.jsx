import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const Carousel = ({ items, itemWidth = '100%', itemHeight = '300px', sx }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!items?.length) {
        return <Box sx={{ ...sx, height: itemHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No items to display</Box>;
    }

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    };

    return (
        <Box sx={{ position: 'relative', width: itemWidth, height: itemHeight, overflow: 'hidden', ...sx }}>
            <Box
                sx={{
                    display: 'flex',
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${currentIndex * 100}%)`,
                    height: '100%',
                }}
            >
                {items?.map((item, index) => (
                    <Box
                        key={index}
                        sx={{ minWidth: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {item}
                    </Box>
                ))}
            </Box>
            <IconButton
                onClick={handlePrev}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '10px',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                }}
            >
                <ArrowBack />
            </IconButton>
            <IconButton
                onClick={handleNext}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    zIndex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    },
                }}
            >
                <ArrowForward />
            </IconButton>
        </Box>
    );
};

// Prop types for documentation and error-checking
Carousel.propTypes = {
    items: PropTypes.arrayOf(PropTypes.node).isRequired, // Items to display in the carousel
    itemWidth: PropTypes.string, // Width of the carousel items
    itemHeight: PropTypes.string, // Height of the carousel items
    sx: PropTypes.object, // Additional styles
};

export default Carousel;
