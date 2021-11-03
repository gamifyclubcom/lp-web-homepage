function get<T>(url: string): Promise<T> {
  const requestOptions = {
    method: 'GET',
  };
  return fetch(url, requestOptions).then(handleResponse);
}

function post<T, U>(url: string, body: T): Promise<U> {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions).then(handleResponse);
}

function put<T, U>(url: string, body: T): Promise<U> {
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  return fetch(url, requestOptions).then(handleResponse);
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete<T>(url: string): Promise<T> {
  const requestOptions = {
    method: 'DELETE',
  };
  return fetch(url, requestOptions).then(handleResponse);
}

// helper functions
function handleResponse(response: any): any {
  return response.text().then((text: string) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

const fetchWrapper = {
  get,
  post,
  put,
  delete: _delete,
};

export default fetchWrapper;
