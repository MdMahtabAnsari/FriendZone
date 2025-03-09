import { Search } from '@mui/icons-material';
import { Box } from '@mui/material';
import { CustomIconButton, CustomInput } from '../index.js';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SearchBar = forwardRef(function SearchBar({ placeholder, onChange, onSearch, value }, ref) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                padding: 1,
                backgroundColor: 'background.default',
                borderRadius: 1
            }}
        >
            <CustomInput
                inputRef={ref}
                placeholder={placeholder}
                onChange={onChange}
                value={value}
                sx={{
                    width: '100%'
                }}
            />
            <CustomIconButton
                label={'Search'}
                onClick={onSearch}
                icon={<Search />}
                color={'inherit'}
            />
        </Box>
    );
});

SearchBar.propTypes = {
    placeholder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
};

export default SearchBar;