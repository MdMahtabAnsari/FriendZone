const mongoose = require('mongoose');

const nfswSchema = new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'Post Id is required']
    },
    isNFSW:{
        type:Boolean,
        default:false
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true}
);


nfswSchema.index({postId:1});

const NFSW = mongoose.model('NFSW',nfswSchema);

module.exports = NFSW;