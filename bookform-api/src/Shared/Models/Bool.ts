import ValidationError from "../Errors/ValidationError";

export class Bool {

    constructor(
        public readonly value: boolean
    ) {
        this.validate();
    }

    protected validate(): void {
        if (typeof this.value !== 'boolean') {
            throw new ValidationError('El valor debe ser un boleano.');
        }

        if (!this.value && this.value !== false) {
            throw new ValidationError('El boleano no puede estar vacío.');
        }
    }

}
