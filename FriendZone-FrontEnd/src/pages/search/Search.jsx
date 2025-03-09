import { CustomSearch } from '../../components/index.js';
import { Box, TextField } from '@mui/material';
import {useEffect, useState} from 'react';

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [search,setSearch] = useState(false);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };


    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: '100%',
                padding: 2
            }}
        >
            <TextField
                className="search-input"
                onChange={handleSearchChange}
                placeholder="Search..."
                variant="outlined"
                fullWidth
                sx={{
                    maxWidth: '500px',

                }}
            />

            <CustomSearch searchQuery={searchTerm} />

        </Box>
    );
};

export default Search;