import React from 'react';
import { Helmet } from 'react-helmet';

export const MetaTags = ({siteName, content, logo}) => {
    return (<Helmet>
        <title>{siteName}</title>
        <meta name="description" content={content} />
        <meta property="og:title" content={siteName + " " +  content} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:description" content={content} />
        <meta property="og:image" content={window.location.origin + logo?.src} />

        <meta name="twitter:site" content={siteName} />
        <meta name="twitter:card" content="" />
        <meta name="twitter:title" content={siteName} />
        <meta name="twitter:description" content={content} />
        <meta name="twitter:image:src" content={window.location.origin + logo?.src}/>
    </Helmet>);
};

MetaTags.defaultProps = {
    content: "Sharing geospatial data and maps",
    siteName: "GeoNode"
};
export default MetaTags;
