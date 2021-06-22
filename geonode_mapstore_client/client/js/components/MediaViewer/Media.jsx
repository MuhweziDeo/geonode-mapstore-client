/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React  from 'react';
import MediaComponent from '@mapstore/framework/components/geostory/media';
import HTML from '@mapstore/framework/components/I18N/HTML';
import PdfViewer from '@js/components/MediaViewer/PdfViewer';
import { determineResourceType } from '@js/utils/FileUtils';
import Loader from '@mapstore/framework/components/misc/Loader';
import MetaTags from "@js/components/MetaTags";


const mediaMap = {
    image: MediaComponent,
    video: MediaComponent,
    pdf: PdfViewer,
    unsupported: MediaComponent
};

const loaderComponent = () => <div className="pdf-loader"><Loader size={70}/></div>;

const mediaDefaultProps = {
    video: {
        mode: "view",
        inView: true
    },
    image: {
        fit: "contain",
        enableFullscreen: true,
        loaderComponent
    },
    pdf: {},
    unsupported: {
        showCaption: true,
        caption: <h3 className="unsupported-media-caption"><HTML msgId={'viewer.document.unSupportedMedia'}/></h3>,
        enableFullscreen: false
    }
};

const Media = ({resource, siteName}) => {
    if (resource) {
        const mediaType = determineResourceType(resource.extension);
        const MediaViewer =  mediaMap[mediaType];
        return (<>
            <MetaTags
                logo={resource.thumbnail_url}
                siteName={siteName + " " + resource.title}
                contentURL={resource.detail_url}
                content={resource.abstract}
            />
            <MediaViewer
                mediaType={mediaType}
                {...mediaDefaultProps[mediaType]}
                description={resource.abstract}
                id={resource.pk}
                thumbnail={resource.thumbnail_url}
                src={mediaType === 'unsupported' ? resource.thumbnail_url : resource.href}
            />
        </>);
    }
    return null;
};

export default Media;

