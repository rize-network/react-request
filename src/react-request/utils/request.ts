import { stringify } from 'qs';

export async function checkStatus(response: any, url: string) {
  if (response) {
    const status =
      response.info !== undefined && typeof response.info == 'function'
        ? response.info().status
        : response.status;

    let json;
    try {
      json = await response.json();
    } catch (e) {
      console.warn(`${url} =>`, e);
      if (status >= 200 && status < 300) {
        return response;
      } else {
        throw new Error(`Erreur ${response.status}`);
      }
    }

    if (json) {
      if (status >= 200 && status < 300) {
        return json;
      } else {
        let error = new Error(`Erreur ${response.status}`);
        if (json.message) {
          error = new Error(json.message);
        }

        throw error;
      }
    }

    //console.info(`[${url}]`, json);

    return response;
  }

  // if (isBrowser()) {
  //   console.log(`${url} =>`, json);
  // }
}

// });

/**
 * apis a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to api
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */

interface RequestProps {
  url: string;
  method?: string;
  params?: any;
  headers?: any;
  json?: boolean;
  cacheControl?: boolean;
}

export const request = ({
  url,
  method = 'GET',
  params = {},
  headers = {},
  json = true,
  cacheControl = true,
}: RequestProps) => {
  let body;

  if (method === 'GET') {
    const query = stringify(params);
    url = `${url}?${query}`;
  } else if (json) {
    body = JSON.stringify(params);
  } else {
    body = params;
  }

  if (url.indexOf('http') === -1) {
    if (json && headers.Accept == undefined)
      headers.Accept = 'application/json';
    if (json && headers['Content-Type'] == undefined)
      headers['Content-Type'] = 'application/json';

    if (
      cacheControl &&
      method !== 'GET' &&
      headers['Cache-Control'] == undefined
    ) {
      headers['Cache-Control'] = 'no-cache';
    }
  }

  // // if (isBrowser()) {
  // console.info(`[${method}] ${url} => `, body, headers);
  // //}

  return fetch(url, {
    method,
    headers,
    body,
  }).then((response) => checkStatus(response, url));
};
