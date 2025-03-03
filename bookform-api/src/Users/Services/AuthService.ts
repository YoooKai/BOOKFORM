import { v4 as v4uuid } from 'uuid';
import { User } from '../Model/User';
import UserRepository from '../Repository/UserRepository';
import { Name } from '../../Shared/Models/Name';

export class AuthService {

    private authFailMessage = 'No tiene permiso para realizar esta acción.';

    constructor(
        private userRepository: UserRepository,
    ) {}

    async checkAccessToken(accessToken: string | undefined): Promise<User> {

        const token = this.extractToken(accessToken);
        
        try {
            const user = await this.userRepository.getUserByAccessToken(token);

            if (!user) {
                throw new Error(this.authFailMessage);
            }
    
            return user;
        } catch (error) {
            throw new Error(this.authFailMessage);
        }

    }

    createAccessToken(): string {
        return v4uuid();
    }
    

    private extractToken(bearerHeader: string | undefined): Name {

        if (typeof bearerHeader !== 'string') {
            throw new Error('El encabezado debe ser una cadena de texto.');
        }
    
        // Divide el string por espacios
        const parts = bearerHeader.split(' ');
    
        // Comprueba si el formato es correcto
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Formato de encabezado de autorización inválido.');
        }
    
        const token = parts[1]
        
        // .replace(/"/g, '');
        
        // Retorna el token
        return new Name(token);

    }
}
