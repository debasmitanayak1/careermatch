const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Gets authentication headers with JWT from localStorage
 */
const getAuthHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('careermatch_token');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

/**
 * Standard fetch wrapper handling authorization headers and JSON errors
 */
const request = async (endpoint, options = {}, isMultipart = false) => {
  const headers = getAuthHeaders(isMultipart);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const responseData = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (typeof responseData === 'object' && responseData !== null && responseData.error)
        ? responseData.error
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseData;
};

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
  upload: (endpoint, formData) =>
    request(
      endpoint,
      {
        method: 'POST',
        body: formData,
      },
      true
    ),
};
