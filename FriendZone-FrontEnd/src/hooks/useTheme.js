import {useMemo} from 'react';
import {createTheme} from '@mui/material/styles';
import {useSelector} from 'react-redux';

const useTheme = () => {
    const mode = useSelector((state) => state.theme.mode); // Access mode from Redux

    return useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'dark'
                        ? {
                            background: {
                                default: '#000', // Dark background for the app
                                paper: '#121212', // Darker background for paper elements
                            },
                            text: {
                                primary: '#fff', // White primary text
                                secondary: '#B3B3B3', // Light grey secondary text
                            },
                        }
                        : {
                            background: {
                                default: '#fff', // Light background
                                paper: '#f5f5f5', // Lighter background for paper elements
                            },
                            text: {
                                primary: '#000', // Black primary text
                                secondary: '#4a4a4a', // Dark grey secondary text
                            },
                        }),
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                '--tag-color': mode === 'dark' ? '#90caf9' : '#1976d2', // Tag color for dark and light modes
                            },
                        },
                    },
                },
            }),
        [mode]
    );
};

export default useTheme;