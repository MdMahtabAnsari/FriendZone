const neo4j = require('neo4j-driver');
const InternalServerError = require('../../utils/errors/internal-server-error');
const {NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD} = require('../../configs/server-config');


class PostLikeGraphRepository {
    static #driver = null;
    static #session = null;

    constructor() {
        if (!PostLikeGraphRepository.#driver) {
            PostLikeGraphRepository.#driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
        }
        if (!PostLikeGraphRepository.#session) {
            PostLikeGraphRepository.#session = PostLikeGraphRepository.#driver.session();
        }

        this.session = PostLikeGraphRepository.#session;
    }

    async likePost({postId, userId}) {
        try {
            const cypherQuery = `
                MERGE (u:User {id: $userId})
                MERGE (p:Post {id: $postId})
                MERGE (u)-[:LIKES]->(p)
                WITH u, p
                OPTIONAL MATCH (u)-[r:DISLIKES]->(p)
                DELETE r
                RETURN u, p
            `;

            const result = await this.session.run(cypherQuery, {userId, postId});
            return result.records.length > 0;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async dislikePost({postId, userId}) {
        try {
            const cypherQuery = `
                MERGE (u:User {id: $userId})
                MERGE (p:Post {id: $postId})
                MERGE (u)-[:DISLIKES]->(p)
                WITH u, p
                OPTIONAL MATCH (u)-[r:LIKES]->(p)
                DELETE r
                RETURN u, p
            `;

            const result = await this.session.run(cypherQuery, {userId, postId});
            return result.records.length > 0;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeLike({postId, userId}) {
        try {
            const cypherQuery = `
                MATCH (u:User {id: $userId})-[r:LIKES]->(p:Post {id: $postId})
                DELETE r
                RETURN u, p
            `;

            const result = await this.session.run(cypherQuery, {userId, postId});
            return result.records.length > 0;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async removeDislike({postId, userId}) {
        try {
            const cypherQuery = `
                MATCH (u:User {id: $userId})-[r:DISLIKES]->(p:Post {id: $postId})
                DELETE r
                RETURN u, p
            `;

            const result = await this.session.run(cypherQuery, {userId, postId});
            return result.records.length > 0;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

}

module.exports = PostLikeGraphRepository;