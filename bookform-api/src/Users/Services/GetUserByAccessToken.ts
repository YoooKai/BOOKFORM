import { Uuid } from "../../Shared/Models/Uuid";
import UserRepository from "../Repository/UserRepository";

export class GetUserByAccessToken {

    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(accessToken: Uuid): Promise<any> {

        const user = await this.userRepository.getUserByAccessToken(accessToken);
        
        if (!user || !user.status) {
            throw new Error('El usuario no existe o no está activo.');
        }
        
        return user;

    }

}
