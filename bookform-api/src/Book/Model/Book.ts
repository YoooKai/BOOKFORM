import { Uuid } from "../../Shared/Models/Uuid";
import { Name } from "../../Shared/Models/Name";
import { Bool } from "../../Shared/Models/Bool";
import { BookPrimitives } from "./BookPrimitives";

export class Book{
    static fromPrimitives(data: BookPrimitives): Book {
        const id = new Uuid(data.id);
        const title = new Name(data.title);
        const author = new Name(data.author);
        const available = new Bool(data.available)
    
    return new Book(id, title, author, available);
}
    constructor(
        public readonly id: Uuid,
        public readonly title: Name,
        public readonly author: Name,
        public readonly available: Bool

    ){}

    getPrimitives(): BookPrimitives {
        return {
            id: this.id.value,
            title: this.title.value,
            author: this.author.value,
            available: this.available.value,
        }
    }
}