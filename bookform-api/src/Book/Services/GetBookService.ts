import BookRepository from '../Repository/BookRepository';
import { Uuid } from '../../Shared/Models/Uuid';
import { Book } from '../Model/Book';

export class GetBookService {
    constructor(
        private bookRepository: BookRepository
    ){}
    async execute(id: Uuid): Promise<Book> {
        return await this.bookRepository.getBookById(id);
    }
}