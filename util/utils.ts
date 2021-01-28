import { ValidationOptions } from 'joi';

export const validationOptions: ValidationOptions = {
  errors: { wrap: { label: "'" } }
};
