import { injectable } from 'tsyringe';
import UserRepository from '../Repository/UserRepository';
import { User } from '../Model/User';
import { UuidOptional } from '../../Shared/Models/UuidOptional';
import { Bool } from '../../Shared/Models/Bool';

@injectable()
export class UserCreateServices {

    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(user: User, newUser: Bool): Promise<void> {

        try {

            const preUser = await this.userRepository.getUserByEmail(user.email, new UuidOptional(user.id.value ? user.id.value : null));

            if (preUser && newUser.value) {
                throw new Error('El email ya existe');
            }

            await this.userRepository.saveUser(user);

        } catch (error: any) {
            throw new Error(error.message);
        }
        
    }

}
