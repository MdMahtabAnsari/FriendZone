const toxicity = require('@tensorflow-models/toxicity');
const { SENTIMENT_THRESHOLD,TOXICITY_LABELS } = require('../configs/server-config');
const InternalServerError = require('../utils/errors/internal-server-error');
const Producer = require('./rabbitmq/producer');


class SentimentService {
    static #model =null;
    constructor(){
        this.producer = new Producer();
    }

    static async #getModel() {
        if(!SentimentService.#model){
            try{
                SentimentService.#model = await toxicity.load(SENTIMENT_THRESHOLD,TOXICITY_LABELS)
            }catch (error){
                console.error('Model Loading Error: ', error);
                throw new InternalServerError('Failed to load the sentiment model.');
            }
        }
        return SentimentService.#model;

    }


    isCommentToxic(predictions){
        return predictions.some(prediction => prediction.results.some(result => result.match));
    }

    async analyzeSentiment({commentId,comment}){
        try{
            const model = await SentimentService.#getModel();
            const predictions = await model.classify(comment);
            const isToxic = this.isCommentToxic(predictions);
            console.log('Comment Toxicity: ', isToxic);
            if(isToxic) {
                await this.producer.sendToCommentQueue('toxic', {commentId, comment});
            }
        }catch (error){
            console.error('Sentiment Analysis Error: ', error);
           throw new InternalServerError('Failed to analyze the sentiment of the comment.');
        }
    }
}

module.exports = SentimentService;