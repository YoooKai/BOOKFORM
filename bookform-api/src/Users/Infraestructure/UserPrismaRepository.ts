import { inject, injectable } from "tsyringe";
import { LogService } from "../../Shared/Infraestructure/Services/LogService";
import UserRepository from "../Repository/UserRepository";
import { User } from "../Model/User";
import { Uuid } from "../../Shared/Models/Uuid";
import { prisma } from "../../Shared/Prisma/prisma";
import { Name } from "../../Shared/Models/Name";
import { UuidOptional } from "../../Shared/Models/UuidOptional";
import { v4 as uuidv4 } from 'uuid';
import { compare } from "bcrypt";
import { Bool } from "../../Shared/Models/Bool";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { createUser } from "../../Shared/Services/CreateObjectsModel";

@injectable()
export default class UserPrismaRepository implements UserRepository {

    constructor(
        private logService: LogService,
    ) {}

    async saveUser(user: User): Promise<void>{

        if (await this.getUserById(user.id)) {

            await prisma.users.update({
                where: {
                    id: user.id.value
                },
                data: {
                    name: user.name.value,
                    email: user.email.value,
                    status: user.status.value,
                }

            });

            return;

        }

        const email = await this.getUserByEmail(user.email, new UuidOptional(null));

        if (email) {
            throw new Error('El email ya existe');
        }

        await prisma.users.create({
            data: {
                id: user.id.value,
                name: user.name.value,
                email: user.email.value,
                acess_token: uuidv4(),
            }
        });

    };

    async saveUserPassword(id: Uuid, password: Name): Promise<void>{

        await prisma.users.update({
            where: {
                id: id.value
            },
            data: {
                password: password.value,
            }
        });

    };

    async activeRemoveUser(id: Uuid): Promise<void>{

        await prisma.users.update({
            where: {
                id: id.value
            },
            data: {
                remove: true
            }
        });

    };

    async getUsers(name: NameOptional, email: NameOptional, status: Bool): Promise<User[]>{

        const users = await prisma.users.findMany({
            where: {
                AND: [
                    name.value ? {
                        OR: [
                            { name: { startsWith: name.value } },
                            { name: { endsWith: name.value } }
                        ],
                    } : {},
                    email.value ? {
                        OR: [
                            { email: { startsWith: email.value } },
                            { email: { endsWith: email.value } }
                        ],
                    } : {},
                    { status: { equals: status.value ? true : false } },
                    { remove: { equals: false } }
                ]
            },
        });

        return users.map(user => createUser(user));

    }
    
    async getUserByAccessToken(token: Uuid): Promise<User>{

        const user = await prisma.users.findFirstOrThrow({
            where: {
                acess_token: token.value,
                remove: false,
                status: true
            },
        });

        return createUser(user);

    }

    async getUserByEmail(email: Name, id: UuidOptional): Promise<User | null> {
        const user = await prisma.users.findFirst({
            where: {
                email: email.value,
                ...(id.value && { id: id.value }), // Aplica el filtro de ID solo si se proporciona
            },
        });
    
        if (!user) {
            return null;
        }
    
        return createUser(user);
    }

    async getUserById(id: Uuid): Promise<User | null>{

        const user = await prisma.users.findUnique({
            where: {
                id: id.value
            },
        });

        return user ? createUser(user) : null;

    }

    async updateLastLogin(id: Uuid): Promise<void>{
        await prisma.users.update({
            where: {
                id: id.value
            },
            data: {
                last_login: new Date()
            }
        });
    }

    async createdAccessToken(id: Uuid): Promise<Uuid>{

        const token = new Uuid(uuidv4())
            
        await prisma.users.update({
            where: {
                id: id.value
            },
            data: {
                acess_token: token.value
            }
        });

        return token;

    }

    async checkPassword(userId: Uuid, hash: Name): Promise<boolean>{

        try {
            const user = await prisma.users.findUnique({
                where: {
                    id: userId.value
                }
            });
            
            if (!user || !user.password) {
                throw new Error('Contraseña no valida.');
            }

            return await compare(user.password, hash.value);
        } catch (error) {
            throw new Error('Contraseña incorrecta.');
        }
    }

}