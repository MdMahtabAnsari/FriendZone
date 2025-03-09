const neo4j = require('neo4j-driver');
const {NEO4J_PASSWORD, NEO4J_USER, NEO4J_URL} = require('../../configs/server-config');
const BadRequestError = require('../../utils/errors/bad-request-error');
const InternalServerError = require('../../utils/errors/internal-server-error');

class UserGraphRepository {
    static #driver = null;
    static #session = null;

    constructor() {
        if (!UserGraphRepository.#driver) {
            UserGraphRepository.#driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
        }
        if (!UserGraphRepository.#session) {
            UserGraphRepository.#session = UserGraphRepository.#driver.session();
        }

        this.session = UserGraphRepository.#session;

    }

    async createUser({_id, name, email, dateOfBirth, gender, image,createdAt,bio}) {
        try {
            // Ensure all properties are of primitive types or arrays of primitive types
            const result = await this.session.run(
                `CREATE (u:User {id: $_id, name: $name, email: $email, dateOfBirth: $dateOfBirth, gender: $gender, image: $image,createdAt:$createdAt,bio:$bio}) RETURN u`,
                {_id:typeof _id === 'string' ? _id:_id.toString(), name, email, dateOfBirth, gender, image,createdAt,bio}
            );
            return result.records[0].get(0).properties;
        } catch (error) {
            console.log(error);
            if (error.name === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                throw new BadRequestError('User already exists');
            } else {
                throw new InternalServerError();
            }
        }
    }

    async updateUser({_id, name, email, dateOfBirth, gender, image, createdAt, bio}) {
        try {
            const result = await this.session.run(
                `MATCH (u:User {id: $_id}) 
             SET u.name = $name, u.email = $email, u.dateOfBirth = $dateOfBirth, u.gender = $gender, u.image = $image, u.createdAt = $createdAt, u.bio = $bio 
             RETURN u`,
                {_id:typeof _id === 'string' ? _id:_id.toString(), name, email, dateOfBirth, gender, image, createdAt, bio}
            );
            return result.records[0].get(0).properties;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    // make relation with region and city
    async makeRelationWithRegionAndCity({userId, regionName, cityName}) {
        try {
            const result = await this.session.run(
                `MATCH (u:User {id: $userId})
                MERGE (r:Region {name: $regionName})
                MERGE (c:City {name: $cityName})
                MERGE (u)-[:LIVES_IN]->(c)
                MERGE (c)-[:LOCATED_IN]->(r)
                MERGE (u)-[:REGION]->(r)
                RETURN u, r, c`,
                {userId: typeof userId === 'string' ? userId : userId.toString(), regionName, cityName}
            );
            return result.records[0].get(0).properties;
        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }



    async disconnect() {
        try {
            if (UserGraphRepository.#session) {
                await UserGraphRepository.#session.close();
                UserGraphRepository.#session = null;
            }
            if (UserGraphRepository.#driver) {
                await UserGraphRepository.#driver.close();
                UserGraphRepository.#driver = null;
            }
        } catch (error) {
            console.log(error);

        }
    }


}

const disconnectGraph = async () => {
    const userGraphRepository = new UserGraphRepository();
    await userGraphRepository.disconnect();
    console.log('Disconnected from graph');
    process.exit();
}

process.on('SIGINT', disconnectGraph);
process.on('SIGTERM', disconnectGraph);
process.on('exit', disconnectGraph);

module.exports = UserGraphRepository;

