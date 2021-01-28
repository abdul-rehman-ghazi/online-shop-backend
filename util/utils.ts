import { ValidationOptions } from 'joi';
import { JoiObjectId } from '../startup/validation';

export const validationOptions: ValidationOptions = {
  errors: { wrap: { label: "'" } },
  allowUnknown: true
};

export const validateObjectId = (objectId: string) => {
  return JoiObjectId().validate(objectId);
};
