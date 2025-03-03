import { container as di } from 'tsyringe';
import { config as dotenvConfig } from 'dotenv'
import { USERS_REPOSITORY, BOOKS_REPOSITORY, LOANS_REPOSITORY } from './dependency-names';
import UserPrismaRepository from '../../Users/Infraestructure/UserPrismaRepository';
import BookPrismaRepository from '../../Book/Infraestructure/BookPrismaRepository';
import LoanPrismaRepository from '../../Loan/Infraestructure/LoanPrismaRepository';

dotenvConfig();

const userRepository = di.resolve(UserPrismaRepository)
di.register(USERS_REPOSITORY, { useValue: userRepository });

const bookRepository = di.resolve(BookPrismaRepository)
di.register(BOOKS_REPOSITORY, { useValue: bookRepository });

const loanRepository = di.resolve(LoanPrismaRepository)
di.register(LOANS_REPOSITORY, { useValue: loanRepository });

export { di };