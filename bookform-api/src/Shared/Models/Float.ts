import ValidationError from "../Errors/ValidationError";

export class Float {

    constructor(public readonly value: number) {
        this.validate();
    }

    private validate(): void {

        if (typeof this.value !== 'number') {
            console.log(this.value, 'float')
            throw new ValidationError('El valor de Int debe de ser un número entero.');
        }

    }

}
