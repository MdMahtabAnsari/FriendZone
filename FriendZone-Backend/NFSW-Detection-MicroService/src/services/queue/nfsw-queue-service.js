const Bull = require('bull');
const {REDIS_SECURE,REDIS_SERVICE_URL,REDIS_HOST} = require('../../configs/server-config');
const NfswDetectionService = require('../nfsw-detection-service');
const NFSWRepository = require('../../repositories/nfsw-repository');
const Producer = require('../rabbitmq/producer');
const fs = require('fs');


class NfswQueueService {
    static #NfswQueue = null;

    constructor() {
        if (!NfswQueueService.#NfswQueue) {
            NfswQueueService.#NfswQueue = new Bull('nfsw-image-queue',REDIS_SERVICE_URL,{
                redis:{
                    tls:REDIS_SECURE ? {
                        servername: REDIS_HOST
                    } : null,
                }
            });

        }

        this.nfswQueue = NfswQueueService.#NfswQueue;
        this.nfswQueue.on('error', (error) => {
            console.log('NFSW Queue Error: ', error);
        });
        this.nfswDetectionService = new NfswDetectionService();
        this.nfswRepository = new NFSWRepository();
        this.producer = new Producer();
    }

    async addJob(jobData) {
        try {
            await this.nfswQueue.add(jobData, {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: true,


            });
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log('Image Queue Error: ', error);

        }
    }

    async NFSWUploadEvent({postId,path,type,parentPath}) {
        try {
            await this.addJob({postId,path,type,parentPath});
            console.log('Image Job Added to Queue');
        } catch (error) {
            console.log(error);
        }
    }

    async processNFSWJob() {
        await this.nfswQueue.process(async (job, done) => {
            try {
                const {postId,path,type,parentPath} = job.data;
                const nfswDetectionResult = await this.nfswRepository.getNFSWByPostId(postId);
               if(type === 'image') {
                   if(nfswDetectionResult.isNFSW) {
                      await fs.promises.unlink(path)
                       done();
                       return;

                   }
                const isNFSW = await this.nfswDetectionService.detectNFSWImage(path);
                if(isNFSW) {
                    await this.nfswRepository.updateNFSW({postId, isNFSW: true});
                    await this.producer.sendToQueue('nfsw-process-output', {postId:postId});
                }
               }
                else {
                    if(nfswDetectionResult.isNFSW) {
                        if(!nfswDetectionResult.isDeleted) {
                            await fs.promises.rm(parentPath, { recursive: true, force: true });
                            await this.nfswRepository.deleteNFSW(postId);
                        }
                        done();
                        return;
                    }
                    const isNFSW = await this.nfswDetectionService.detectNFSWImage(path);
                    if(isNFSW) {
                        await this.nfswRepository.updateNFSW({postId, isNFSW: true});
                        await this.producer.sendToQueue('nfsw-process-output', {postId:postId});
                    }
               }
                const files = await fs.promises.readdir(parentPath);
                if (files.length === 0) {
                await fs.promises.rm(parentPath, { recursive: true, force: true });
                }

                console.log('Image Job Done');
                done();

            } catch (error) {
                console.log('NFSW Job Error: ', error);
                done(error);
            }
        });

    }

    async disconnect() {
        try {
            if (NfswQueueService.#NfswQueue) {
                await NfswQueueService.#NfswQueue.close();
                NfswQueueService.#NfswQueue = null;
            }
        } catch (error) {
            console.log('Image Queue Error: ', error);
        }
    }

}

const disconnectNFSWQueue = async () => {
    const nfswQueueService = new NfswQueueService();
    await nfswQueueService.disconnect();
    console.log('Image Queue Disconnected');
    process.exit(0);
}

process.on('SIGINT', disconnectNFSWQueue);

process.on('SIGTERM', disconnectNFSWQueue);

process.on('exit', disconnectNFSWQueue);

module.exports = NfswQueueService;