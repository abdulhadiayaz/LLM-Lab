export function extractErrorMessage(error: any): string {
  if (error?.response?.data?.error) {
    const apiError = error.response.data.error;
    return apiError.details?.title || apiError.message || "An error occurred";
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}
