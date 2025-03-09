const neo4j = require('neo4j-driver');
const InternalServerError = require('../../utils/errors/internal-server-error');
const BadRequestError = require('../../utils/errors/bad-request-error');
const NotFoundError = require('../../utils/errors/not-found-error');
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

    async createViewPost({userId, postId}) {
        try {
            //     make a query to increment the count of views of the post
            //     and create a relationship between the user and the post
            //     if the relationship already exists, increment the count of views
            //     if the relationship does not exist, create the relationship
            //     return the count of views of the post
            const query = `MATCH (u:User {id: $userId})
            MATCH (p:Post {id: $postId})
            MERGE (u)-[v:VIEWED]->(p)
            ON CREATE SET v.count = 1
            ON MATCH SET v.count = v.count + 1
            RETURN v.count as count`;
            const result = await this.session.run(query, {userId: userId.toString(), postId: postId.toString()});
            return result.records[0].get('count').low || 0; // return the count of views of the post or 0 if the count is not found in the result records

        } catch (error) {
            console.log(error); // log the error for debugging
            if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new NotFoundError('User or Post');
            } else if (error.code === 'Neo.ClientError.Statement.SyntaxError') {
                throw new BadRequestError('Invalid User Id or Post Id');
            } else {

                throw new InternalServerError();
            }
        }
    }


}

module.exports = PostLikeGraphRepository;