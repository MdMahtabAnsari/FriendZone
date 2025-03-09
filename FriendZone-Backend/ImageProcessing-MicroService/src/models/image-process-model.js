const mongoose = require('mongoose');

const imageProcessSchema = new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'Post Id is required']
    },
    imageTags:{
        type:[String],
        default:[]
    },
    videoTags:{
        type:[String],
        default:[]
    },
    totalMedia:{
        type:Number,
        default:0,
        required:[true,'Total Media is required']
    },
    totalProcessed:{
        type:Number,
        default:0
    },
    isProcessed:{
        type:Boolean,
        default:false
    },
},{timestamps:true}
);


imageProcessSchema.index({postId:1});
imageProcessSchema.index({isProcessed:1});

const ImageProcess = mongoose.model('ImageProcess',imageProcessSchema);

module.exports = ImageProcess;