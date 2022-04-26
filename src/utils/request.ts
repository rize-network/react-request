import { stringify } from 'qs';

export async function checkStatus(response: any, url: string) {
  if (response) {
    const status =
      response.info !== undefined && typeof response.info == 'function'
        ? response.info().status
        : response.status;
    const json = await response.json();

    if (status >= 200 && status < 300) {
      try {
        if (json.data !== undefined) {
          //console.info(`[${url}]`, json.data);
          return json.data;
        } else {
          //console.info(`[${url}]`, json);

          return json;
        }
      } catch (e) {
        console.warn(`${url} =>`, e);
      }
    }

    // if (isBrowser()) {
    //   console.log(`${url} =>`, json);
    // }

    if (json) {
      const error = json.message
        ? new Error(json.message)
        : new Error(`Erreur ${response.status}`);
      throw error;
    }
  }
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
}

export const request = ({
  url,
  method = 'GET',
  params = {},
  headers = {},
}: RequestProps) => {
  let body;

  if (method === 'GET') {
    const query = stringify(params);
    url = `${url}?${query}`;
  } else if (typeof params === 'object') {
    body = JSON.stringify(params);
  } else {
    body = params;
  }

  if (url.indexOf('http') === -1) {
    if (headers.Accept == undefined) headers.Accept = 'application/json';
    if (headers['Content-Type'] == undefined)
      headers['Content-Type'] = 'application/json';

    if (method !== 'GET' && headers['Cache-Control'] == undefined) {
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
