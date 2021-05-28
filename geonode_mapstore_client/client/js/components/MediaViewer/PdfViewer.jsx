import React, { useState, useEffect } from 'react';
import Loader from '@mapstore/framework/components/misc/Loader';

import { getFileFromDownload } from '@js/utils/FileUtils';

const PdfViewer = ({resource}) => {
    const [filePath, setFilePath] = useState(null);
    const [loading, setLoading] = useState('');

    useEffect(() => {
        setLoading(true);
        getFileFromDownload(resource.href)
            .then((fileURL) => {
                setLoading(false);
                setFilePath(fileURL);
            }).finally(() => {
                setLoading(false);
            });
        return () => {
            setFilePath(null);
        };
    }, []);

    if (loading) {
        return (<div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Loader size={70}/>
        </div>);
    }

    return (<iframe type="application/pdf"
        frameBorder="0"
        scrolling="auto"
        height="100%"
        width="100%" src={filePath}/>);
};

export default PdfViewer;
