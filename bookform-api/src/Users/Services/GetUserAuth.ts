import { Name } from "../../Shared/Models/Name";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import UserRepository from "../Repository/UserRepository";

export class GetUserAuth {

    private failMessage = 'El usuario o el password no es correcto.';

    constructor(
        private userRepository: UserRepository,
    ) {}

    async execute(userEmail: Name, userPassword: Name): Promise<any> {

        const user = await this.userRepository.getUserByEmail(userEmail, new UuidOptional(null));
        
        if (!user || !user.status) {
            throw new Error(this.failMessage);
        }
     
        //Comparamos el hash obtenido con el password pasado
        const passwordMatch = await this.userRepository.checkPassword(user.id, userPassword);
        
        if (passwordMatch) {
            throw new Error(this.failMessage);
        }

        await this.userRepository.updateLastLogin(user.id);

        const accessToken = await this.userRepository.createdAccessToken(user.id);
        
        if (!accessToken) {
            throw new Error(this.failMessage);
        }
        
        return {
            user: user.getPrimitives(),
            accessToken: accessToken.value,
        };

    }

}
