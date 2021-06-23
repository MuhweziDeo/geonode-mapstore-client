/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import url from 'url';
import isUndefined from 'lodash/isUndefined';
import { createSelector } from 'reselect';
import BorderLayout from '@mapstore/framework/components/layout/BorderLayout';
import { getMonitoredState } from '@mapstore/framework/utils/PluginsUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import PluginsContainer from '@mapstore/framework/components/plugins/PluginsContainer';
import useLazyPlugins from '@js/hooks/useLazyPlugins';
import { requestGeoStoryConfig, requestNewGeostoryConfig } from '@js/actions/gnviewer';
import MetaTags from "@js/components/MetaTags";

const urlQuery = url.parse(window.location.href, true).query;

const ConnectedPluginsContainer = connect((state) => ({
    mode: urlQuery.mode || (urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'),
    monitoredState: getMonitoredState(state, getConfigProp('monitorState')),
    pluginsState: {
        ...state.controls
    }
}))(PluginsContainer);

function GeoStoryViewerRoute({
    name,
    pluginsConfig: propPluginsConfig,
    params,
    onUpdate,
    loaderComponent,
    lazyPlugins,
    plugins,
    match,
    onCreate = () => {},
    resource,
    siteName
}) {

    const { pk } = match.params || {};
    const pluginsConfig = propPluginsConfig && propPluginsConfig[name] || [];

    const [loading, setLoading] = useState(true);
    const { plugins: loadedPlugins } = useLazyPlugins({
        pluginsEntries: lazyPlugins,
        pluginsConfig
    });
    useEffect(() => {
        if (!loading) {
            pk === "new" ? onCreate() : onUpdate(pk);
        }
    }, [loading, pk]);

    useEffect(() => {
        if (pk === "new" && !isUndefined(resource?.canEdit) && !(resource?.canEdit)) {
            window.location.replace('/account/login');
        }
    }, [pk, resource]);
    const Loader = loaderComponent;

    return (
        <>
            {resource &&  <MetaTags
                logo={resource.thumbnail_url}
                siteName={siteName + " " + resource.title}
                contentURL={resource.detail_url}
                content={resource.abstract}
            />}
            <ConnectedPluginsContainer
                key="page-geostory-viewer"
                id="page-geostory-viewer"
                className="page page-geostory-viewer"
                component={BorderLayout}
                pluginsConfig={pluginsConfig}
                plugins={{ ...loadedPlugins, ...plugins }}
                params={params}
                onPluginsLoaded={() => setLoading(false)}
            />
            {loading && Loader && <Loader />}
        </>
    );
}

GeoStoryViewerRoute.propTypes = {
    onUpdate: PropTypes.func
};

const ConnectedGeoStoryViewerRoute = connect(
    createSelector([
        state => state?.gnresource?.data,
        state => state?.localConfig?.siteName || "Geonode"
    ], (resource, siteName) => ({resource, siteName})),
    {
        onUpdate: requestGeoStoryConfig,
        onCreate: requestNewGeostoryConfig
    }
)(GeoStoryViewerRoute);

ConnectedGeoStoryViewerRoute.displayName = 'ConnectedGeoStoryViewerRoute';

export default ConnectedGeoStoryViewerRoute;
