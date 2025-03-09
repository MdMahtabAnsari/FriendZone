import { SlUserFollow, SlUserUnfollow } from "react-icons/sl";
import { Link } from "react-router-dom";
import { CustomIconButton } from './index.js';
import routesConfig from "../routes/routes.js";
import { Box, Typography, Avatar, useTheme } from "@mui/material";
import PropTypes from "prop-types";

const FollowerCard = ({ follower, isFollow = false, onFollow, onUnFollow,isUser=false }) => {
    const theme = useTheme();
    const id = follower?.id || follower?._id;
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2} borderBottom={1} borderColor="divider"  >
            <Box display="flex" alignItems="center">
                <Avatar src={follower?.image} alt={follower?.name} sx={{ width: 50, height: 50 }} />
                <Link to={routesConfig.profile.replace(':userId', id)}
                      style={{ textDecoration: 'none', color: theme.palette.text.primary }}
                >
                    <Typography variant="h6" sx={{ marginLeft: 2 }}>
                        {follower?.name}
                    </Typography>
                </Link>
            </Box>
            {!isUser &&(
            <CustomIconButton
                onClick={() => isFollow ? onUnFollow(id) : onFollow(id)}
                icon={isFollow ? <SlUserUnfollow /> : <SlUserFollow />}
                label={isFollow ? "Unfollow" : "Follow"}
            />
            )}
        </Box>
    );
};

FollowerCard.propTypes = {
    follower: PropTypes.object.isRequired,
    isFollow: PropTypes.bool.isRequired,
    onFollow: PropTypes.func.isRequired,
    onUnFollow: PropTypes.func.isRequired,
    isUser: PropTypes.bool.isRequired
};

export default FollowerCard;