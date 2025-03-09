const Bull = require('bull');
const {REDIS_SECURE,REDIS_SERVICE_URL,REDIS_HOST} = require('../../configs/server-config');
const SentimentService = require('../sentiment-service');

class SentimentQueueService {
    static #SentimentQueue = null;

    constructor() {
        if (!SentimentQueueService.#SentimentQueue) {
            SentimentQueueService.#SentimentQueue = new Bull('sentiment-queue',REDIS_SERVICE_URL,{
                redis:{
                    tls:REDIS_SECURE ? {
                        servername: REDIS_HOST
                    } : null,
                }
            });

        }

        this.SentimentQueue = SentimentQueueService.#SentimentQueue;
        this.SentimentQueue.on('error', (error) => {
            console.log('sentiment Queue Error: ', error);
        });
        this.sentimentService = new SentimentService();
    }

    async addJob(jobData) {
        try {
            await this.SentimentQueue.add(jobData, {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: true,


            });
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log('Image Queue Error: ', error);

        }
    }

    async sentimentUploadEvent({commentId,comment}) {
        try {
            await this.addJob({commentId,comment});
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log(error);
        }
    }

    async processSentimentJob() {
        await this.SentimentQueue.process(async (job, done) => {
            try {
                const {commentId,comment} = job.data;
               await this.sentimentService.analyzeSentiment({commentId,comment});


                console.log('Image Job Done');
                done();

            } catch (error) {
                console.log('Sentiment Job Error: ', error);
                done(error);
            }
        });

    }

    async disconnect() {
        try {
            if (SentimentQueueService.#SentimentQueue) {
                await SentimentQueueService.#SentimentQueue.close();
                SentimentQueueService.#SentimentQueue = null;
            }
        } catch (error) {
            console.log('Image Queue Error: ', error);
        }
    }

}

const disconnectSentimentQueue = async () => {
    const sentimentQueueService = new SentimentQueueService();
    await sentimentQueueService.disconnect();
    console.log('Image Queue Disconnected');
    process.exit(0);
}

process.on('SIGINT', disconnectSentimentQueue);

process.on('SIGTERM', disconnectSentimentQueue);

process.on('exit', disconnectSentimentQueue);

module.exports = SentimentQueueService;