import { Uuid } from "../../Shared/Models/Uuid";
import UserRepository from "../Repository/UserRepository";

export class GetUserService {

    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(id: Uuid): Promise<any> {

        return await this.userRepository.getUserById(id);

    }

}
