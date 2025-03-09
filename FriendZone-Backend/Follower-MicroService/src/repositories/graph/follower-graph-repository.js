const neo4j = require('neo4j-driver');
const BadRequestError = require('../../utils/errors/bad-request-error');
const NotFoundError = require('../../utils/errors/not-found-error');
const InternalServerError = require('../../utils/errors/internal-server-error');
const AppError = require('../../utils/errors/app-error');
const {NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD} = require('../../configs/server-config');


class FollowerGraphRepository {
    static #driver = null;
    static #session = null;

    constructor() {
        if (!FollowerGraphRepository.#driver) {
            FollowerGraphRepository.#driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
        }
        if (!FollowerGraphRepository.#session) {
            FollowerGraphRepository.#session = FollowerGraphRepository.#driver.session();
        }

        this.session = FollowerGraphRepository.#session;


    }

    async createFollower({followerId, followingId}) {
        try {
            // first check relationship exists or not
            const isFollowing = await this.isFollowing({followerId, followingId});
            if (isFollowing) {
                throw new BadRequestError('Already following');
            }
            // if not exists then create relationship
            const query = `MATCH (a:User {id: $followerId}), (b:User {id: $followingId}) CREATE (a)-[r:FOLLOW]->(b) RETURN r`;
            const result = await this.session.run(query, {followerId, followingId});
            if (result.records.length === 0) {
                throw new NotFoundError('User');
            }
            // if relationship created successfully then return the result
            return {followerId, followingId, follow: true};

        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new BadRequestError('Already following');
            } else if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }


    async deleteFollower({followerId, followingId}) {
        try {

            const isFollowing = await this.isFollowing({followerId, followingId});
            if (!isFollowing) {
                throw new BadRequestError('Not following');
            }

            const query = `MATCH (a:User {id: $followerId})-[r:FOLLOW]->(b:User {id: $followingId}) DELETE r`;
            await this.session.run(query, {followerId, followingId});
            return {followerId, followingId, follow: false};

        } catch (error) {
            console.log(error);
            if (error instanceof AppError) {
                throw error;
            } else if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new BadRequestError('Not following');
            } else if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getFollowersByUserId({userId, page = 1, limit = 10}) {
        try {
            const query = `MATCH (a:User)-[r:FOLLOW]->(b:User {id: $userId}) RETURN a SKIP toInteger($skip) LIMIT toInteger($limit)`;
            const response = await this.session.run(query, {userId, skip: (page - 1) * limit, limit});
            return response.records.map(record => {
                return record.get('a').properties;
            });
        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getFollowingByUserId({userId, page = 1, limit = 10}) {
        try {
            const query = `MATCH (a:User {id: $userId})-[r:FOLLOW]->(b:User) RETURN b SKIP toInteger($skip) LIMIT toInteger($limit)`;
            const result = await this.session.run(query, {userId, skip: (page - 1) * limit, limit});
            return result.records.map(record => {
                return record.get('b').properties;
            });
        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getFollowersCountByUserId(userId) {
        try {
            const query = `MATCH (a:User {id: $userId})-[r:FOLLOW]->(b:User) RETURN count(b) as followersCount`;
            const response = await this.session.run(query, {userId});
            return response.records[0].get('followersCount');
        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getFollowingCountByUserId(userId) {
        try {
            const query = `MATCH (a:User)-[r:FOLLOW]->(b:User {id: $userId}) RETURN count(a) as followingCount`;
            const result = await this.session.run(query, {userId});
            return result.records[0].get('followingCount');
        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async isFollowing({followerId, followingId}) {
        try {
            const query = `MATCH (a:User {id: $followerId})-[r:FOLLOW]->(b:User {id: $followingId}) RETURN r`;
            const result = await this.session.run(query, {followerId, followingId});
            return result.records.length !== 0;

        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getMutualFollowers({userId1, userId2, page = 1, limit = 10}) {
        try {
            const query = `MATCH (a:User {id: $userId1})-[:FOLLOW]->(b:User)<-[:FOLLOW]-(c:User {id: $userId2}) RETURN b SKIP toInteger($skip) LIMIT toInteger($limit)`;
            const result = await this.session.run(query, {userId1, userId2, skip: (page - 1) * limit, limit});
            return result.records.map(record => {
                return record.get('b').properties;
            });
        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async getFollowerSuggestions({userId, page = 1, limit = 10}) {
        try {
            const query = `MATCH (me:User {id: $userId})

        // 1. Mutual Followers Logic
        OPTIONAL MATCH (me)-[:FOLLOW]->(myFollowings:User)-[:FOLLOW]->(suggested:User)
        WHERE NOT (me)-[:FOLLOW]->(suggested) AND me <> suggested
        WITH suggested, COUNT(myFollowings) AS mutualFollowers, me

        // 2. Popular Users Logic
        OPTIONAL MATCH (suggested)<-[:FOLLOW]-(followers:User)
        WHERE NOT (me)-[:FOLLOW]->(suggested) AND me <> suggested
        WITH suggested, mutualFollowers, COUNT(followers) AS popularity, me

        // 3. Interaction-Based Suggestions (Users interacting with similar content)
        OPTIONAL MATCH (me)-[:LIKES|VIEWED]->(:Post)<-[:LIKES|VIEWED]-(suggested)
        WHERE NOT (me)-[:FOLLOW]->(suggested) AND me <> suggested
        WITH suggested, mutualFollowers, popularity, COUNT(DISTINCT suggested) AS sharedInteractions, me

        // 4. Demographic-Based Suggestions (Similar location or other criteria)
        OPTIONAL MATCH (me)-[:LIVES_IN|REGION]->(location)<-[:LIVES_IN|REGION]-(suggested)
        WHERE NOT (me)-[:FOLLOW]->(suggested) AND me <> suggested
        WITH suggested, mutualFollowers, popularity, sharedInteractions, COUNT(DISTINCT suggested) AS sharedTraits, me

        // 5. New Users (Onboarding Suggestions)
        OPTIONAL MATCH (suggested:User)
        WHERE NOT (me)-[:FOLLOW]->(suggested)
        AND me <> suggested
        AND suggested.createdAt > datetime() - duration('P7D')
        WITH suggested, mutualFollowers, popularity, sharedInteractions, sharedTraits, me

        // 6. Ensure we don't suggest isolated users unless no other suggestions
        OPTIONAL MATCH (isolated:User)
        WHERE NOT (isolated)-[:FOLLOW]->() AND NOT ()-[:FOLLOW]->(isolated) AND isolated <> me
        WITH coalesce(suggested, isolated) AS finalSuggestion, mutualFollowers, popularity, sharedInteractions, sharedTraits

        // Final ranking and result ordering
        RETURN finalSuggestion AS user, mutualFollowers, popularity, sharedInteractions, sharedTraits
        ORDER BY mutualFollowers DESC, sharedInteractions DESC, sharedTraits DESC, popularity DESC
        SKIP toInteger($skip) LIMIT toInteger($limit)`;

            const result = await this.session.run(query, {userId, skip: (page - 1) * limit, limit});
            if (result.records.length === 0) {
                return [];
            }
            return result.records.map(record => {
                const userNode = record.get('user');
                return userNode ? userNode.properties : null;
            }).filter(user => user !== null);
        } catch (error) {
            console.error(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User not found');
            } else {
                throw new InternalServerError();
            }
        }
    }


    async disconnect() {
        try {
            if (FollowerGraphRepository.#session) {
                await FollowerGraphRepository.#session.close();
                FollowerGraphRepository.#session = null;
            }
            if (FollowerGraphRepository.#driver) {
                await FollowerGraphRepository.#driver.close();
                FollowerGraphRepository.#driver = null;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

const disconnectAndExit = async () => {
    try {
        const followerRepository = new FollowerGraphRepository();
        await followerRepository.disconnect();
        console.log('Disconnected');
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

process.on('SIGINT', disconnectAndExit);
process.on('SIGTERM', disconnectAndExit);
process.on('exit', disconnectAndExit);

module.exports = FollowerGraphRepository;
