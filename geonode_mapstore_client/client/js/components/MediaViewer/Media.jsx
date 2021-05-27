/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import MediaComponent from '@mapstore/framework/components/geostory/media';

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
    pdf: () => <div/>,
    unsupported: () => <div/>
};

const Media = ({resource, ...props}) => {
    console.log(props, resource);
    if (resource) {
        const mediaType = determineResourceType(resource.extension);
        const CMP =  mediaMap[mediaType];
        return (<CMP
            mediaType
            // mode="view"
            // inView
            // thumbnail={resource.thumbnail_url}
            src={resource.thumbnail_url}
            fit={mediaType === 'image' ? "cover" : undefined}
        />);
    }
    return null;
};

export default Media;

