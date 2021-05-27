/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import MediaComponent from '@mapstore/framework/components/geostory/media';
import HTML from '@mapstore/framework/components/I18N/HTML';

// Determines if a resource is an image video or pdf
const imageExtensions = ['jpg', 'jpeg', 'png'];
const videoExtensions = ['mp4', 'mpg', 'avi', 'm4v'];

const determineResourceType = extension => {
    if (extension === 'pdf') return 'pdf';
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unsupported';
};

const mediaMap = {
    image: MediaComponent,
    video: MediaComponent,
    pdf: (props) => <iframe type="application/pdf"
        frameBorder="0"
        scrolling="auto"
        height="100%"
        width="100%" {...props}/>,
    unsupported: MediaComponent
};

const mediaDefaultProps = {
    video: {
        mode: "view",
        inView: true
    },
    image: {
        fit: "contain",
        enableFullscreen: true
    },
    pdf: {
        src: "http://192.168.0.106:8000/uploaded/documents/document/QkQ57wUWT8ardQcQ-5mQag.pdf",
        style: {
            height: '80vh'
        }
    },
    unsupported: {
        showCaption: true,
        caption: <h1><HTML msgId={'viewer.document.unSupportedMedia'}/></h1>
    }
};

const Media = ({resource}) => {
    if (resource) {
        const mediaType = determineResourceType(resource.extension);
        const CMP =  mediaMap[mediaType];
        return (<CMP
            mediaType={mediaType}
            {...mediaDefaultProps[mediaType]}
            description={resource.abstract}
            id={resource.pk}
            thumbnail={resource.thumbnail_url}
            src={mediaType === 'unsupported' ? resource.thumbnail_url : resource.href}
        />);
    }
    return null;
};

export default Media;

