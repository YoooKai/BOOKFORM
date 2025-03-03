import { Bool } from "../../Shared/Models/Bool";
import { NameOptional } from "../../Shared/Models/NameOptional";
import { UuidOptional } from "../../Shared/Models/UuidOptional";


export default interface UserRepository {

    saveUser(user: User): Promise<void>;

    saveUserPassword(id: Uuid, password: Name): Promise<void>;    

    getUsers(name: NameOptional, email: NameOptional, status: Bool): Promise<User[]>;
    
    getUserById(id: Uuid): Promise<User>;

    getUserByEmail(email: Name, id: UuidOptional): Promise<User | null>;

    getUserByAccessToken(token: Uuid): Promise<User>;

    createdAccessToken(id: Uuid): Promise<Uuid>;

    updateLastLogin(id: Uuid): Promise<void>;

    activeRemoveUser(id: Uuid): Promise<void>;

    checkPassword(password: Name, hash: Name): Promise<boolean>;

}
