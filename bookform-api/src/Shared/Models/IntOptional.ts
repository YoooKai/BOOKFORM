import ValidationError from "../Errors/ValidationError";

export class IntOptional {

    constructor(public readonly value: number | null) {
        this.validate();
    }

    private validate(): void {
        if (this.value === null) {
            return;
        }

        if (!Number.isInteger(this.value)) {
            throw new ValidationError('El valor de Int debe de ser un número entero.');
        }

    }

}
