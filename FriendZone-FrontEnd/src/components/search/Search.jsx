import {CustomUserByName,CustomPostByTag,CustomPostByContent,CustomButton} from "../index.js"
import {Box} from '@mui/material'
import {useEffect, useState} from 'react'
import PropTypes from 'prop-types'



const Search = ({searchQuery}) => {

    const [option, setOption] = useState(0);
    const [search,setSearch] = useState(false);

    useEffect(() => {
        setSearch(false);
        const timer = setTimeout(() => {
            setSearch(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);


    return(
        <Box
            key={searchQuery} // Add key prop here
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                width: '100%'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    width: '100%'
                }}
            >
                <CustomButton text={'User'} onClick={() => setOption(0)} sx={{
                    backgroundColor: option === 0 ? 'grey.300' : 'primary.main',

                }}/>
                <CustomButton text={'Tag'} onClick={() => setOption(1)}
                              sx={{
                                  backgroundColor: option === 1 ? 'grey.300' : 'primary.main',
                              }}/>
                <CustomButton text={'Content'} onClick={() => setOption(2)}
                              sx={{
                                  backgroundColor: option === 2 ? 'grey.300' : 'primary.main',
                              }}/>
            </Box>
            {search && searchQuery.length > 2  && (
                <>
            {option === 0 && <CustomUserByName   userName={searchQuery}/>}
            {option === 1 && <CustomPostByTag   tags={searchQuery}/>}
            {option === 2 && <CustomPostByContent   content={searchQuery}/>}
              </>
            )}
        </Box>

    )

}

Search.propTypes = {
    searchQuery: PropTypes.string.isRequired
}

export default Search;