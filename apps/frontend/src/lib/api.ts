const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : undefined
  };
}

export async function fetchApi(endpoint: string, options: any = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: any = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}
