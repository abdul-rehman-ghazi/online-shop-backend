import { Document, DocumentQuery, Model } from 'mongoose';

interface PaginationRequest {
  limit: number;
  page: number;
}

interface PaginationResponse {
  total: number;
  page: number;
  lastPage: number;
}

export const paginationResponse = async <T extends Document>(
  model: Model<T>,
  documentQuery: DocumentQuery<T[], T>,
  queryMap: any
) => {
  let responseData: T[];
  let paginationResponse: PaginationResponse | null = null;
  if (queryMap.page || queryMap.limit) {
    const paginationRequest: PaginationRequest = {
      limit: parseInt(queryMap.limit) > 0 ? parseInt(queryMap.limit) : 10,
      page: parseInt(queryMap.page) > 0 ? parseInt(queryMap.page) : 1
    };
    responseData = await documentQuery
      .limit(paginationRequest.limit)
      .skip((paginationRequest.page - 1) * paginationRequest.limit);
    const totalDocumentsCount = await model.estimatedDocumentCount().exec();
    let lastPage = 1;
    if (totalDocumentsCount > paginationRequest.limit)
      lastPage = totalDocumentsCount / paginationRequest.limit;
    paginationResponse = {
      total: totalDocumentsCount,
      page: paginationRequest.page,
      lastPage: lastPage
    };
  } else {
    responseData = await documentQuery;
  }

  return { data: responseData, pagination: paginationResponse };
};

export const listPaginationResponse = <T>(data: T[], queryMap: any) => {
  let paginationResponse: PaginationResponse | null = null;
  if (queryMap.page || queryMap.limit) {
    const paginationRequest: PaginationRequest = {
      limit: parseInt(queryMap.limit) > 0 ? parseInt(queryMap.limit) : 10,
      page: parseInt(queryMap.page) > 0 ? parseInt(queryMap.page) : 1
    };

    const totalDocumentsCount = data.length;
    let lastPage = 1;
    if (totalDocumentsCount > paginationRequest.limit)
      lastPage = Math.ceil(totalDocumentsCount / paginationRequest.limit);
    paginationResponse = {
      total: totalDocumentsCount,
      page: paginationRequest.page,
      lastPage: lastPage
    };

    data = data.slice(
      paginationRequest.limit * (paginationRequest.page - 1),
      paginationRequest.limit * (paginationRequest.page - 1) +
        paginationRequest.limit
    );
  }

  return { data: data, pagination: paginationResponse };
};
