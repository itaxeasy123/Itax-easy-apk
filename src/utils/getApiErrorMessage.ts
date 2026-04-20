type ApiErrorBody = {
  data?: {
    message?: string;
  } | string;
  error?: string;
  message?: string;
};

type ApiErrorResponse = {
  data?: ApiErrorBody | string;
  error?: string;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  statusMessages?: Partial<Record<number, string>>
) : string {
  const axiosError = error as {
    isAxiosError?: boolean;
    message?: string;
    response?: {
      data?: ApiErrorResponse | string;
      status?: number;
      statusText?: string;
    };
  };

  if (axiosError?.isAxiosError) {
    const response = axiosError.response;
    const data = response?.data;

    if (response?.status && statusMessages?.[response.status]) {
      return statusMessages[response.status] ?? fallback;
    }

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    const responseData = data && typeof data !== 'string' ? data : undefined;
    const nestedPayload =
      responseData && responseData.data && typeof responseData.data !== 'string'
        ? responseData.data
        : undefined;
    const nestedMessage = nestedPayload?.message;
    const message = responseData?.message;
    const errorMessage = responseData?.error;

    return (
      nestedMessage ||
      message ||
      errorMessage ||
      response?.statusText ||
      axiosError.message ||
      fallback
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
