
let initialFile = null;

const toBase64 = file => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => resolve(reader.result);
	reader.onerror = error => reject(error);
});

let blob = null
var input = document.getElementById('fileUpload');
var video = document.getElementById('video');
const fileReader = new FileReader();
const button = document.getElementById('button');
let finalFile = null
const endpoint = 'https://app.staging.starsona.com/api/'

let base64Data = null
const fileToBlob = async (file) => new Blob([new Uint8Array(await file.arrayBuffer())], {type: file.type });
let finalBlob = null
function inputListener(e) {
  var file = e.target.files[0];
  // finalFile = file
  initialFile = file
  fileToBlob(file).then(blob => finalBlob = blob)
  // finalFile = getBase64(file)
  fileReader.readAsDataURL(file);
  const objectURL = window.URL.createObjectURL(file);
  console.log('file', file, objectURL);
  video.src = objectURL;
  video.style.display = 'block';
  video.style.height = '300px';
  video.style.width = '300px';
  toBase64(file).then(base64 => base64Data = base64)
  var reader = new FileReader();
  reader.onload = function(e) {
      var contents = e.target.result;
      finalFile = contents
      blob = new Blob([new Uint8Array(e.target.result)], {type: file.type });
      // do something with the contents

  };
  reader.readAsText(file);
}

function getAWSCredentials(url, file) {
	return axios.get(url, {
    headers: {
      device: 'web',
      authorization: 'token 9e1271fd992b5a02d02eede828944a993ea5e712',
      'entity-id': 'MYFANPARK-INDIA-1',
      'entity-token': '7e449da9-a164-4995-b46b-b884cb60b5f9',
      'accept-language': 'en-US',
      'accept': 'application/json',
      version: '4.4'
    }
  }).then(async (response) => {


			let filename = response.data.data.fields.key.split('/');
			filename = filename[2];
			const formData = new FormData();
			formData.append('success_action_status', response.data.data.fields.success_action_status);
			formData.append('signature', response.data.data.fields.signature);
			formData.append('x-amz-security-token', response.data.data.fields['x-amz-security-token']);
			formData.append('acl', response.data.data.fields.acl);
			formData.append('Content-Disposition', 'attachment');
			formData.append('Access-Control-Allow-Origin', response.data.data.fields['Access-Control-Allow-Origin']);
			formData.append('policy', response.data.data.fields.policy);
			formData.append('key', response.data.data.fields.key);
			formData.append('AWSAccessKeyId', response.data.data.fields.AWSAccessKeyId);
			formData.append('file', initialFile);
			return { formData, url: response.data.data.url, filename, response: response.data.data };
		});
}
function showLink(filename) {
  const link = document.getElementById('videoURL');
  link.style.display = 'block';
  link.setAttribute('href', `https://s3-accelerate.amazonaws.com/stargram_videos/${filename}`);
  link.innerHTML = `https://s3-accelerate.amazonaws.com/stargram_videos/${filename}`;
}

const b64toBlob = async (b64Data, contentType='', sliceSize=512) => {
  const res = await b64Data.arrayBuffer()
  return res;
}

async function buttonListener(e) {
  const stagingUrl = `${endpoint}v1/user/signed_url/?extension=mp4&key=stargram_videos&file_type=video`
  const response = await getAWSCredentials(stagingUrl, finalFile);

  if (response && response.filename) {
    axios
      .post(
        response.url.replace('s3.', 's3-accelerate.'),
        response.formData
      )
      .then(() => {
        showLink(response.filename);
      })
      .catch(() => {
        updateToast(dispatch, {
          value: true,
          message: t('purchase_flow.upload_failed'),
          variant: 'error',
          global: true
        });
        generalLoader(dispatch, false);
      });
  }
}
input.addEventListener('change', inputListener);
button.addEventListener('click', buttonListener);