import {useCallback, useEffect, useState} from 'react';
import { Link,useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
    useMediaQuery, Avatar
} from '@mui/material';
import { Home, Search, Menu as MenuIcon, Login, Logout, AppRegistration as Signup, Notifications, AddCircleOutline as Create,People } from '@mui/icons-material';
import { CustomSwitch, CustomIconButton } from '../index.js';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode } from '../../store/slices/theme-slice.js';
import useTheme from '../../hooks/useTheme.js';
import routesConfig from "../../routes/routes.js";
import { Badge } from '@mui/base/Badge';
import { getUnreadNotificationCount } from "../../store/slices/notification/notification.js";
import {logoutUser} from '../../store/slices/auth/auth-slice.js'

const Navbar = () => {
    const dispatch = useDispatch();
    const mode = useSelector((state) => state.theme.mode);
    const theme = useTheme();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useSelector((state) => state.auth.user);
    const { unreadNotificationCount } = useSelector((state) => state.notifications);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const navigate = useNavigate();

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const menuItems = user ? [
        { text: 'Home', to: routesConfig.home, icon: <Home /> },
        { text: 'FollowerSuggestion', to: routesConfig.followerSuggestions, icon: <People /> },
        { text: 'Search', to: routesConfig.search, icon: <Search /> },
        { text: 'Create', to: routesConfig.create, icon: <Create /> },
        { text: 'Notifications', to: routesConfig.notifications, icon: <Notifications /> },
        { text: 'Profile', to: routesConfig.profile.replace(':userId', user?._id), icon: <Avatar src={user?.image} alt={user?.name} sx={{ width: 25, height: 25 }} /> } ,
        { text: 'Logout', to: routesConfig.logout, icon: <Logout /> },
    ] : [
        { text: 'Signup', to: routesConfig.signup, icon: <Signup /> },
        { text: 'Login', to: routesConfig.login, icon: <Login /> },
    ];

    useEffect(() => {
        if (user) {
            dispatch(getUnreadNotificationCount())
            }

    }, [user, dispatch]);

    useEffect(() => {
        if(notificationsCount!==unreadNotificationCount) {
            setNotificationsCount(unreadNotificationCount); // Ensure count is a number
        }
    }, [notificationsCount, unreadNotificationCount]);

    const handleLogout = useCallback(async () => {
        const response = await dispatch(logoutUser());
        if (response?.payload?.success) {
            navigate(routesConfig.login);
        }
    }, [dispatch, navigate]);

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                color: mode === 'dark' ? '#fff' : '#000',
            }}
        >
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Instagram
                </Typography>

                {isSmallScreen ? (
                    <IconButton onClick={toggleDrawer} sx={{ color: 'inherit' }}>
                        <MenuIcon />
                    </IconButton>
                ) : (
                    <Box display="flex">
                        {menuItems.map((item) => {
                            if (item.text === 'Notifications') {
                                return (
                                    <Link
                                        key={item.text}
                                        to={item.to}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                    <Badge
                                        badgeContent={notificationsCount}
                                        color="primary"
                                        key={item.text}
                                        sx={{ mx: 1 }}
                                    >
                                        <CustomIconButton
                                            icon={item.icon}
                                            label={item.text}
                                            color="inherit"
                                            sx={{ color: 'inherit' }}
                                        />
                                    </Badge>
                                    </Link>
                                );
                            } else if(item.text === 'Logout') {
                                return (
                                    <CustomIconButton
                                        key={item.text}
                                        icon={item.icon}
                                        label={item.text}
                                        color="inherit"
                                        onClick={handleLogout}
                                        sx={{color: 'inherit'}}
                                    />
                                );
                            }
                            else {
                                return (
                                    <Link
                                        key={item.text}
                                        to={item.to}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <CustomIconButton
                                            icon={item.icon}
                                            label={item.text}
                                            color="inherit"
                                            sx={{ color: 'inherit', mx: 1 }}
                                        />
                                    </Link>
                                );
                            }
                        })}
                    </Box>
                )}

                <CustomSwitch
                    label="Dark/light"
                    color="primary"
                    checked={mode === 'dark'}
                    onChange={() => dispatch(toggleMode())}
                />
            </Toolbar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: mode === 'dark' ? theme.palette.grey[900] : theme.palette.background.paper,
                        color: mode === 'dark' ? '#fff' : '#000',
                    },
                }}
            >
                <List>
                    {menuItems?.map((item, index) => (
                        <ListItem
                            component={Link}
                            to={item.to}
                            onClick={toggleDrawer}
                            key={index}
                            sx={{
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
};

export default Navbar;