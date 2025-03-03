import { NameOptional } from "../../Shared/Models/NameOptional";
import { Uuid } from "../../Shared/Models/Uuid";

export default interface BookRepository {
    saveBook(book: Book): Promise<void>;
    getBookById(id: Uuid): Promise<Book>;
    getBookByTitle(title: Name): Promise<Book | null>;
    getBooks(author: NameOptional): Promise<Book[]>;
    removeBook(id: Uuid): Promise<void>;
}