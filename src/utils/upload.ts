import { isBrowser } from 'src/utils/env';

interface UploadRequestProps {
  url: string;
  file: any;
  params?: any;
  onProgress?: Function;
  onSuccess?: Function;
  onFailure?: Function;
  access_token?: string;
}

export const upload = async ({
  file,
  url,
  onProgress,
  onSuccess,
  onFailure,
  access_token,
}: UploadRequestProps) => {
  let xhr;
  if (isBrowser()) {
    xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      const progress = Math.round((e.loaded * 100.0) / e.total);

      if (onProgress) {
        onProgress(progress);
      }

      console.log(`fileuploadprogress data.loaded: ${e.loaded},
  data.total: ${e.total}`);
    });

    xhr.onreadystatechange = function onreadystatechange() {
      if (xhr.readyState === 4) {
        console.log('readyState', xhr.readyState);

        let response;
        try {
          response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            // File uploaded successfully
            // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
            // Create a thumbnail of the uploaded image, with 150px width

            if (response.success) {
              if (onSuccess) {
                onSuccess(response);
              }
              console.log('success', response);
            }
          } else {
            if (onFailure) {
              onFailure(response);
            }
            console.log('failure', response);
          }
        } catch (e) {
          if (onFailure) {
            onFailure(response);
          }
          console.log('failure', response);
        }
      }
    };
  }

  if (access_token) {
    xhr.open('POST', `${url}?accessToken=${access_token}`, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Authorization', `Bearer ${access_token}`);

    const formData = new FormData();

    formData.append('accessToken', access_token);
    formData.append('file', file);
    console.log('formData', formData);

    xhr.send(formData);
  }
};
