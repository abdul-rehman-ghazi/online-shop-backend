type Response = {
  response: any;
  message: string;
};

export const baseResponse = (data?: any, message?: string) => {
  const response: Response = {
    response: data ?? null,
    message: message ?? 'Success'
  };
  return response;
};

export const baseErrorResponse = (message?: string) => {
  const response: Response = {
    response: null,
    message: message ?? 'Failed'
  };
  return response;
};
