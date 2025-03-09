import { Card, CardContent, Typography, Avatar, Box, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import PropTypes from 'prop-types';

const NotificationCard = ({
                              notification={},
                              triggeredUser={},
                              cardStyles = {},
                              avatarStyles = {},
                              contentStyles = {},
                              badgeColor = 'inherit',
                              onClick,
                          }) => {
    const theme = useTheme();
    const {
        message,
        isRead ,
        createdAt ,
    } = notification;


    return (
        <Card
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isRead ? theme.palette.background.paper : theme.palette.action.hover,
                color: theme.palette.text.primary,
                padding: 2,
                marginBottom: 2,
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                cursor: 'pointer',
                '&:hover': {
                    boxShadow: theme.shadows[3],
                },
                ...cardStyles,
            }}
            onClick={() => onClick(notification?._id)}
        >
            <Badge
                color='info'
                variant="dot"
                invisible={isRead}
                overlap="circular"
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{ marginRight: 2,
                    color: badgeColor,
                }}
                >
                <Avatar
                    src={triggeredUser?.image}
                    alt={triggeredUser?.name}
                    sx={{
                        width: 48,
                        height: 48,
                        marginRight: 2,
                        ...avatarStyles,
                    }}
                />
            </Badge>

            <CardContent sx={{ flex: '1 1 auto', padding: 0, ...contentStyles }}>
                <Typography variant="body2" color="text.primary">
                    {message}
                </Typography>
                <Box display="flex" alignItems="center" marginTop={0.5}>
                    <Typography variant="caption" color="text.secondary">
                        {moment(createdAt).fromNow()}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

NotificationCard.propTypes = {
    notification: PropTypes.object.isRequired,
    triggeredUser: PropTypes.object.isRequired,
    cardStyles: PropTypes.object,
    avatarStyles: PropTypes.object,
    contentStyles: PropTypes.object,
    badgeColor: PropTypes.string,
    onClick: PropTypes.func,
};

export default NotificationCard;