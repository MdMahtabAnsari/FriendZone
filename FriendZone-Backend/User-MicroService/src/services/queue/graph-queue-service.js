const Bull = require('bull');
const {REDIS_HOST, REDIS_SECURE,REDIS_SERVICE_URL} = require('../../configs/server-config');
const UserGraphRepository = require('../../repositories/graph/user-graph-repository');

class GraphQueueService {
    static #graphQueue = null;

    constructor() {
        if (!GraphQueueService.#graphQueue) {
            GraphQueueService.#graphQueue = new Bull('user-graph-queue',REDIS_SERVICE_URL,{
                redis:{
                    tls:REDIS_SECURE ? {
                        servername: REDIS_HOST
                    } : null,
                }
            });

        }

        this.graphQueue = GraphQueueService.#graphQueue;
        this.userGraphRepository = new UserGraphRepository();
        this.graphQueue.on('error', (error) => {
            console.log('Graph Queue Error: ', error);
        });
    }

    async addJob(jobData) {
        try {
            await this.graphQueue.add(jobData, {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: true,


            });
            console.log('Graph Job Added to Queue');
        } catch (error) {
            console.log('Graph Queue Error: ', error);

        }
    }

    async graphUploadEvent({id, name, email, dateOfBirth, gender, image,action,timeZone,createdAt,bio}) {
        try {

            await this.addJob({id, name, email, dateOfBirth, gender, image,action,timeZone,createdAt,bio});
        } catch (error) {
            console.log(error);
        }
    }

    async processGraphJob() {
        await this.graphQueue.process(async (job, done) => {
            const {id, name, email, dateOfBirth, gender, image,action,timeZone,createdAt,bio} = job.data;
            try {
                if(action === 'create') {
                    await this.userGraphRepository.createUser({_id: id, name, email, dateOfBirth, gender, image,createdAt,bio});
                    if(timeZone){
                        const [region,city] = timeZone.split('/');
                        await this.userGraphRepository.makeRelationWithRegionAndCity({userId:id,regionName:region,cityName:city});
                    }
                }
                else if(action === 'update') {
                    await this.userGraphRepository.updateUser({_id: id, name, email, dateOfBirth, gender, image,createdAt,bio});
                    if(timeZone) {
                        const [region, city] = timeZone.split('/');
                        await this.userGraphRepository.makeRelationWithRegionAndCity({
                            userId: id,
                            regionName: region,
                            cityName: city
                        });
                    }
                }

                console.log('Graph Job Completed');
                done();
            } catch (error) {
                console.log('Graph Job Error: ', error);
                done(error);
            }
        });

    }

    async disconnect() {
        try {
            if (GraphQueueService.#graphQueue) {
                await GraphQueueService.#graphQueue.close();
                GraphQueueService.#graphQueue = null;
            }
        } catch (error) {
            console.log('Graph Queue Error: ', error);
        }
    }

}

const disconnectGraphQueue = async () => {
    const graphQueueService = new GraphQueueService();
    await graphQueueService.disconnect();
    console.log('Graph Queue Disconnected');
    process.exit(0);
}

process.on('SIGINT', disconnectGraphQueue);

process.on('SIGTERM', disconnectGraphQueue);

process.on('exit', disconnectGraphQueue);

module.exports = GraphQueueService;