import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000' });

export const uploadImage = (data) => API.post('/upload/', data);
export const uploadPost = (data) => API.post('/post', data);
export const getImageKitAuth = () => API.get('/post/imagekit/auth');

export const uploadToImageKit = async (file) => {
    const { data: authParams } = await getImageKitAuth();
    const { token, expire, signature, publicKey } = authParams;

    const effectivePublicKey = process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY || publicKey;
    if (!effectivePublicKey) {
        throw new Error('ImageKit public key is missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', `${Date.now()}_${file.name}`);
    formData.append('publicKey', effectivePublicKey);
    formData.append('signature', signature);
    formData.append('expire', expire);
    formData.append('token', token);
    formData.append('folder', '/posts');

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'ImageKit upload failed');
    }

    return result;
};