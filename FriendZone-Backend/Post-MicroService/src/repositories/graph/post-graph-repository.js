const neo4j = require('neo4j-driver');
const BadRequestError = require('../../utils/errors/bad-request-error');
const NotFoundError = require('../../utils/errors/not-found-error');
const InternalServerError = require('../../utils/errors/internal-server-error');
const AppError = require('../../utils/errors/app-error');
const {NEO4J_URL, NEO4J_USER, NEO4J_PASSWORD} = require('../../configs/server-config');

class PostGraphRepository {
    static #driver = null;
    static #session = null;

    constructor() {
        if (!PostGraphRepository.#driver) {
            PostGraphRepository.#driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
        }
        if (!PostGraphRepository.#session) {
            PostGraphRepository.#session = PostGraphRepository.#driver.session();
        }

        this.session = PostGraphRepository.#session;


    }

    async createPost({_id, userId, content, images = [], videos = [], tags = [], createdAt, updatedAt}) {
        // image and videos are optional and in the form of array of strings
        try {
            // const result = await this.session.run(
            //     `CREATE (p:Post {id: $_id,userId: $userId, content: $content, images: $images, videos: $videos,tags:$tags}) RETURN p`,
            //     {_id:_id.toString(),userId:userId.toString(), content, images, videos,tags}
            // );
            // create post node and make relationship with user node POSTED
            const result = await this.session.run(
                `MATCH (u:User {id: $userId})
                CREATE (p:Post {id: $_id, content: $content, images: $images, videos: $videos,tags:$tags, createdAt: $createdAt, updatedAt: $updatedAt,userId: $userId})
                CREATE (u)-[:POSTED]->(p)
                RETURN p`,
                {_id: _id.toString(), userId: userId.toString(), content, images, videos, tags, createdAt, updatedAt}
            );
            return true
        } catch (error) {
            console.log(error);
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing') {
                throw new BadRequestError('Post id is required');
            }
            if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new BadRequestError('Post already exists');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async updatePost({ _id, content, images = [], videos = [], tags = [], updatedAt }) {
        try {
            // Ensure the post exists before updating
            const existingPost = await this.session.run(
                `MATCH (p:Post {id: $_id}) RETURN p`,
                { _id }
            );

            if (existingPost.records.length === 0) {
                throw new NotFoundError('Post not found');
            }

            // Perform the update
            const result = await this.session.run(
                `MATCH (p:Post {id: $_id}) 
             SET p.content = $content, 
                 p.images = $images, 
                 p.videos = $videos, 
                 p.tags = $tags, 
                 p.updatedAt = $updatedAt 
             RETURN p`,
                { _id, content, images, videos, tags, updatedAt }
            );

            // Return the updated post properties
            return result.records[0].get('p').properties;
        } catch (error) {
            console.error('Error updating post:', error);
            if(error instanceof AppError){
                throw error;
            }
            throw new InternalServerError('An error occurred while updating the post');
        }
    }


    async deletePost(_id) {
    try {
        // Check if the post exists
        const existingPost = await this.session.run(
            `MATCH (p:Post {id: $_id}) RETURN p`,
            { _id }
        );

        if (existingPost.records.length === 0) {
            throw new NotFoundError('Post not found');
        }

        // Delete the post
        await this.session.run(
            `MATCH (p:Post {id: $_id}) DETACH DELETE p`,
            { _id }
        );

        return true;
    } catch (error) {
        console.log(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new InternalServerError();
    }
}


    async PostTag({_id, tags}) {
        try {
            const existingPost = await this.session.run(
                `MATCH (p:Post {id: $_id}) RETURN p`,
                { _id }
            );

            if (existingPost.records.length === 0) {
                throw new NotFoundError('Post not found');
            }
            await this.session.run(
                `MATCH (p:Post {id: $_id})
                UNWIND $tags as tag
                MERGE (t:Tag {name: tag})
                MERGE (p)-[:TAGGED_WITH]->(t)
                RETURN p`,
                {_id, tags}
            );
            return true;
        } catch (error) {
            console.log(error);
            if (error.code === 'Neo.ClientError.Statement.ParameterMissing') {
                throw new BadRequestError('Post id is required');
            }
            throw new InternalServerError();
        }
    }

    async deletePostTag({_id, tags}) {
        try {
            const result = await this.session.run(
                `MATCH (p:Post {id: $_id}) UNWIND $tags as tag MATCH (t:Tag {name: tag}) MATCH (p)-[r:TAGGED_WITH]->(t) DELETE r`,
                {_id, tags});
            return result.summary.counters._stats.relationshipsDeleted;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    async getEnhancedRecommendations({ userId, page = 1, limit = 10 }) {
        try {
            const offset = (page - 1) * limit;

            // Check user activity
            const userActivityQuery = `
            MATCH (u:User {id: $userId})-[:LIKES|VIEWED]->(p:Post)
            RETURN COUNT(p) AS activityCount
        `;
            const userActivityResult = await this.session.run(userActivityQuery, { userId });
            const userHasActivity = userActivityResult.records[0]?.get('activityCount').toInt() > 0;

            if (userHasActivity) {
                console.log('User activity: true\nExecuting personalized query');

                // Personalized query to avoid duplicates
                const personalizedQuery = `
                MATCH (u:User {id: $userId})-[:LIKES|VIEWED]->(p:Post)-[:TAGGED_WITH]->(t:Tag)
                <-[:TAGGED_WITH]-(suggestedPost:Post)
                WHERE NOT (u)-[:LIKES|VIEWED]->(suggestedPost)
                WITH DISTINCT suggestedPost  // Ensure unique posts
                RETURN suggestedPost, COUNT(*) AS interactionCount
                ORDER BY interactionCount DESC
                SKIP toInteger($offset) LIMIT toInteger($limit)
            `;
                const personalizedResult = await this.session.run(personalizedQuery, { userId, offset, limit });

                const personalizedPosts = personalizedResult.records.map(record =>
                    record.get('suggestedPost').properties
                );

                if (personalizedPosts.length > 0) return personalizedPosts;
            }

            console.log('No personalized recommendations found, switching to fallback query.');

            // Fallback query to avoid duplicate posts
            const fallbackQuery = `
            MATCH (p:Post)
            OPTIONAL MATCH (p)<-[likes:LIKES]-(u:User)
            OPTIONAL MATCH (p)<-[views:VIEWED]-(u2:User)
            OPTIONAL MATCH (p)<-[d:DISLIKES]-(disliker:User)
            WITH p, 
                 COUNT(DISTINCT likes) AS likeCount, 
                 COUNT(DISTINCT views) AS viewCount, 
                 COUNT(d) AS dislikeCount
            WITH p, likeCount, viewCount, dislikeCount, 
                 CASE 
                     WHEN (likeCount + viewCount) > 0 
                     THEN (dislikeCount * 1.0 / (likeCount + viewCount))
                     ELSE 0 
                 END AS dislikeRatio
            WHERE dislikeRatio < 0.3
            WITH DISTINCT p, (likeCount * 1.5 + viewCount) AS popularityScore
            ORDER BY popularityScore DESC
            SKIP toInteger($offset) LIMIT toInteger($limit)
            RETURN p AS post, popularityScore
        `;
            const fallbackResult = await this.session.run(fallbackQuery, { offset, limit });

            return fallbackResult.records.map(record => ({
                ...record.get('post').properties,
                popularityScore: record.get('popularityScore') // Remove .toInt()
            }));

        } catch (error) {
            console.error('Error fetching recommendations:', error.message);
            throw new Error('Failed to fetch recommendations.');
        }
    }




    async disconnect() {
        try {
            if (PostGraphRepository.#session) {
                await PostGraphRepository.#session.close();
                PostGraphRepository.#session = null;
            }
            if (PostGraphRepository.#driver) {
                await PostGraphRepository.#driver.close();
                PostGraphRepository.#driver = null;
            }
        } catch (error) {
            console.log(error);

        }
    }


}

const disconnectGraph = async () => {
    const postGraphRepository = new PostGraphRepository();
    await postGraphRepository.disconnect();
    console.log('Gracefully shutting down Post graph connection');
    process.exit(0);
}

process.on('SIGINT', disconnectGraph);
process.on('SIGTERM', disconnectGraph);
process.on('exit', disconnectGraph);

module.exports = PostGraphRepository;