import axios from '@mapstore/framework/libs/ajax';

export const getFileFromDownload = (downloadURL, type = 'application/pdf') => {
    return axios.get(downloadURL, {
        responseType: 'blob'
    }).then(({data}) => {
        const file = new Blob([data], {type});
        const fileURL = URL.createObjectURL(file);
        return fileURL;
    });
};
