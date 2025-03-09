const commentMessageTemplate = ({action, triggeredBy}) => {
    switch (action) {
        case 'like':
            return `${triggeredBy} liked your comment`;
        case 'reply':
            return `${triggeredBy} replied to your comment`;
        case 'dislike':
            return `${triggeredBy} disliked your comment`;

        default:
            return 'Invalid event type';
    }
}

const postMessageTemplate = ({action, triggeredBy}) => {
    switch (action) {
        case 'like':
            return `${triggeredBy} liked your post`;
        case 'comment':
            return `${triggeredBy} commented on your post`;
        case 'dislike':
            return `${triggeredBy} disliked your post`;
        default:
            return 'Invalid event type';
    }
}


const userMessageTemplate = ({action, triggeredBy}) => {
    switch (action) {
        case 'follow':
            return `${triggeredBy} followed you`;
        default:
            return 'Invalid event type';
    }
}

module.exports = {
    commentMessageTemplate,
    postMessageTemplate,
    userMessageTemplate
};