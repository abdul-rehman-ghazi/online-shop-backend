type Response = {
  data: any;
  message: string;
};

export const baseResponse = (data?: any, message?: string) => {
  const response: Response = {
    data: data ?? null,
    message: message ?? 'Success'
  };
  return response;
};

export const baseErrorResponse = (message?: string) => {
  const response: Response = {
    data: null,
    message: message ?? 'Failed'
  };
  return response;
};
