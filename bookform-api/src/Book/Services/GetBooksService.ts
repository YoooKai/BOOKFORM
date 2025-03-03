import BookRepository from '../Repository/BookRepository';
import { Book } from '../Model/Book';
import { NameOptional } from '../../Shared/Models/NameOptional';

export class GetBooksService {
    constructor(
        private bookRepository: BookRepository,
    ) {}
    async execute(author: NameOptional): Promise<Book[]>{
        return await this.bookRepository.getBooks(author);
    }
}