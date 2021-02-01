import { ValidationOptions } from 'joi';
import { JoiObjectId } from '../startup/validation';
import { Document, Model } from 'mongoose';
import lodash from 'lodash';

export const validationOptions: ValidationOptions = {
  errors: { wrap: { label: "'" } },
  allowUnknown: true
};

export const validateObjectId = (objectId: string) => {
  return JoiObjectId().validate(objectId);
};

export const updateDocument = <T extends Document>(
  doc: Document,
  SchemaTarget: Model<T>,
  data: any
) => {
  for (const field in SchemaTarget.schema.paths) {
    if (field !== '_id' && field !== '__v') {
      const newValue = getObjValue(field, data);
      if (newValue !== undefined) {
        setObjValue(field, doc, newValue);
      }
    }
  }
  return doc;
};

function getObjValue(field: string, data: any) {
  return lodash.reduce(
    field.split('.'),
    function (obj, f) {
      if (obj) return obj[f];
    },
    data
  );
}

function setObjValue(field: string, data: any, value: string) {
  const fieldArr = field.split('.');
  return lodash.reduce(
    fieldArr,
    function (o, f, i) {
      if (i == fieldArr.length - 1) {
        o[f] = value;
      } else {
        if (!o[f]) o[f] = {};
      }
      return o[f];
    },
    data
  );
}
