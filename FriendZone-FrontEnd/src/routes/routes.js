

const routesConfig = {
   login:'/auth/login',
    signup:'/auth/signup',
    logout:'/auth/logout',
    home:'/',
    profile:'/users/profile/:userId',
    search:'/search',
    create:'/create',
    notifications:'/notifications',
    forgotPassword:'/auth/forgot-password',
    updatePost:'/posts/update/:postId',
    post:'/posts/:postId',
    updateProfile:'/profile/update',
    followerSuggestions: '/followers/suggestions',

}

export default routesConfig;