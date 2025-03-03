import { Bool } from "../../Shared/Models/Bool";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import UserRepository from "../Repository/UserRepository";

export class GetUsersService {

    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(name: NameOptional, email: NameOptional, status: Bool): Promise<any> {

        return await this.userRepository.getUsers(name, email, status);

    }

}
