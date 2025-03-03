import ValidationError from "../Errors/ValidationError";

export class Int {

    constructor(public readonly value: number) {
        this.validate();
    }

    private validate(): void {

        if (!Number.isInteger(this.value)) {
            console.log(this.value, 'int')
            throw new ValidationError('El valor de Int debe de ser un número entero.');
        }

    }

}
