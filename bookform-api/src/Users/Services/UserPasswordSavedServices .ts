import { injectable } from 'tsyringe';
import {genSalt, hash} from 'bcrypt';
import UserRepository from '../Repository/UserRepository';
import { Name } from '../../Shared/Models/Name';
import { Uuid } from '../../Shared/Models/Uuid';

@injectable()
export class UserPasswordSavedServices  {

    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(id: Uuid, password: Name): Promise<void> {

        try {

            const salt = await genSalt(10);
            const hashedPassword = await hash(password.value, salt);
            
            await this.userRepository.saveUserPassword(id, new Name(hashedPassword));

        } catch (error: any) {
            throw new Error(error.message);
        }
        
    }

}
