import ValidationError from "../Errors/ValidationError";

export class Name {

    constructor(public readonly value: string) {
        this.validate();
    }

    private validate(): void {

        if (typeof this.value !== 'string') {
            throw new ValidationError('El nombre debe de ser un string.');
        }

        if (!this.value) {
            throw new ValidationError('El nombre no puede estar vacío.');
        }

    }

}
