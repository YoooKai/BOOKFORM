import { Bool } from "../../Shared/Models/Bool";
import { Name } from "../../Shared/Models/Name";
import { Uuid } from "../../Shared/Models/Uuid";
import { UserPrimitives } from "./UserPrimitives";

export class User {

    static fromPrimitives(data: UserPrimitives): User {
        const id = new Uuid(data.id);
        const name = new Name(data.name);
        const status = new Bool(data.status);
        const email = new Name(data.email);

        return new User(id, name, status, email);
    }
    constructor(
        public readonly id: Uuid,
        public readonly name: Name,
        public readonly status: Bool,
        public readonly email: Name,
    ){}

    getPrimitives(): UserPrimitives {
        return {
            id: this.id.value,
            name: this.name.value,
            status: this.status.value,
            email: this.email.value,
        }
    }
}