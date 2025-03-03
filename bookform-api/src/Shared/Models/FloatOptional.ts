import ValidationError from "../Errors/ValidationError";

export class FloatOptional {

    constructor(public readonly value: number | null) {
        this.validate();
    }

    private validate(): void {

        if (this.value === null) {
            return;
        }

        if (typeof this.value !== 'number') {
            throw new ValidationError('El valor de Int debe de ser un número entero.');
        }

    }

}
