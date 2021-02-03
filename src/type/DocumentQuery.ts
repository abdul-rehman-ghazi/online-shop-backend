import { Document, DocumentQuery } from 'mongoose';

declare module 'mongoose' {
  interface DocumentQuery<T, DocType extends Document, QueryHelpers = {}> {
    paginate(queryMap: any): DocumentQuery<T, DocType, QueryHelpers>;
  }
}

DocumentQuery.prototype.paginate = function (queryMap: any) {
  return this.limit(queryMap.limit).skip(queryMap.page * queryMap.limit);
};
