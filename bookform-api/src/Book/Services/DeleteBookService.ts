import BookRepository from '../Repository/BookRepository';
import { Uuid } from '../../Shared/Models/Uuid';

export class DeleteBookService {
    constructor(
        private bookRepository: BookRepository
    ){}
    async execute(id: Uuid): Promise<void> {
        await this.bookRepository.removeBook(id);
    }
}