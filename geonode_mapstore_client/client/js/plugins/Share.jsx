/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import {toggleControl} from '@mapstore/framework/actions/controls';
import Message from '@mapstore/framework/components/I18N/Message';
import { Glyphicon } from 'react-bootstrap';
import controls from '@mapstore/framework/reducers/controls';
import ShareEmbed from '@mapstore/framework/components/share/ShareEmbed';
import ShareLink from '@mapstore/framework/components/share/ShareLink';
import ResizableModal from '@mapstore/framework/components/misc/ResizableModal';
import { mapInfoSelector, mapSelector } from '@mapstore/framework/selectors/map';
import { clickPointSelector} from '@mapstore/framework/selectors/mapInfo';

import AdvancedSettings from '@js/components/share/AdvancedSettings';
import {getExtentFromViewport} from '@mapstore/framework/utils/CoordinatesUtils';
import ConfigUtils from '@mapstore/framework/utils/ConfigUtils';

import url from 'url';

function getShareUrl({
    resourceId,
    pathTemplate
}) {
    const {
        host,
        protocol
    } = url.parse(location.href);
    const pathname = pathTemplate.replace(/\{id\}/g, resourceId);
    return url.format({
        host,
        protocol,
        pathname,
        hash: "#"

    });
}

function Share({
    resourceId,
    pathTemplate,
    enabled,
    onClose,
    bbox,
    formatCoord,
    zoom,
    center,
    ...props
}) {
    const shareUrl = getShareUrl({
        resourceId,
        pathTemplate
    });

    const [shareApiUrl, setShareApiUrl] = React.useState(shareUrl);
    const [settings, setSettings] = React.useState({advancedSettings: {
        centerAndZoomEnabled: true,
        bbox: true,
        centerAndZoom: true
    }, settings: {
        bboxEnabled: false,
        centerAndZoomEnabled: false,
        markerEnabled: false
    }});

    const [currentFormatCoord, setCurrentFormatCoord] = React.useState(formatCoord);
    const [cordinates, setCoordinates] = React.useState([]);
    const [mapZoom, setZoom] = React.useState(zoom);

    const getLonLat = (point) => {
        const latlng = point && point.latlng || null;
        let lngCorrected = null;
        /* lngCorrected is the converted longitude in order to have the value between
             * the range (-180 / +180).
             * Precision has to be >= than the coordinate editor precision
             * especially in the case of aeronautical degree editor which is 12
        */
        if (latlng) {
            lngCorrected = latlng && Math.round(latlng.lng * 100000000000000000) / 100000000000000000;
            lngCorrected = lngCorrected - 360 * Math.floor(lngCorrected / 360 + 0.5);
        }
        return  [lngCorrected, latlng && latlng.lat];
    };

    const getCoordinates = () => {
        const lonLat = getLonLat(props.point);
        const {x, y} = center || {x: "", y: ""};
        const isValidLatLng = lonLat.filter(coord=> coord !== null);
        return isValidLatLng.length > 0 ? lonLat : [x, y];
    };

    React.useEffect(() => {
        setCoordinates(getCoordinates());
    }, [props.point]);

    console.log(props.point);

    React.useEffect(() => {
        if (settings.settings.bboxEnabled) {
            const bboxParam = bbox?.join(',');
            setShareApiUrl(shareUrl + `?bbox=${bboxParam}`);
        } else {
            setShareApiUrl(shareUrl);
        }
    }, [settings.settings.bboxEnabled, bbox]);

    React.useEffect(() => {
        if (settings.settings.centerAndZoomEnabled) {
            setShareApiUrl(shareUrl + `?center=${cordinates[0]},${cordinates[1]}&zoom=${mapZoom}`);
        } else {
            setShareApiUrl(shareUrl);
        }
    }, [settings.settings.centerAndZoomEnabled, mapZoom, cordinates]);

    return (
        <ResizableModal
            modalClassName="gn-share-modal"
            title={<Message msgId="share.title"/>}
            show={enabled}
            fitContent
            clickOutEnabled={false}
            onClose={() => onClose()}
        >
            <ShareLink
                shareUrl={shareApiUrl}
            />
            <ShareEmbed
                showTOCToggle={false}
                shareUrl={shareApiUrl}
            />

            <AdvancedSettings onUpdateSettings={(newSettings) => setSettings({...settings, settings: newSettings})}
                advancedSettings={settings.advancedSettings}
                settings={settings.settings}
                formatCoord={currentFormatCoord}
                zoom={mapZoom}
                coordinate={cordinates}
                onChangeFormat={(format) => setCurrentFormatCoord(format)}
                setZoom={setZoom}
                setCoordinates={setCoordinates}
            />
        </ResizableModal>
    );
}

Share.propTypes = {
    resourceId: PropTypes.oneOfType([ PropTypes.number, PropTypes.string ]),
    pathTemplate: PropTypes.string,
    enabled: PropTypes.bool,
    onClose: PropTypes.func
};

Share.defaultProps = {
    resourceId: null,
    pathTemplate: '/apps/{id}/embed',
    enabled: false,
    onClose: () => {}
};

const SharePlugin = connect(
    createSelector([
        state => state?.controls?.share?.enabled,
        state => state?.gnresource?.id,
        mapInfoSelector,
        state => state.controls && state.controls.share && state.controls.share.enabled,
        mapSelector,
        (state) => state.mapInfo && state.mapInfo.formatCoord || ConfigUtils.getConfigProp("defaultCoordinateFormat"),
        clickPointSelector
    ], (enabled, resourceId, mapInfo, isVisible, map, formatCoord, point) => ({
        enabled,
        resourceId: resourceId || mapInfo?.id,
        bbox: isVisible && map && map.bbox && getExtentFromViewport(map.bbox),
        formatCoord,
        zoom: map && map.zoom,
        center: map && map.center && ConfigUtils.getCenter(map.center),
        point
    })),
    {
        onClose: toggleControl.bind(null, 'share', null),
    }
)(Share);

export default createPlugin('Share', {
    component: SharePlugin,
    containers: {
        BurgerMenu: {
            name: 'share',
            position: 1000,
            text: <Message msgId="share.title"/>,
            icon: <Glyphicon glyph="share-alt"/>,
            action: toggleControl.bind(null, 'share', null),
            selector: createSelector(
                state => state?.gnresource?.isNew,
                state => state?.gnresource?.id,
                mapInfoSelector,
                (isNew, resourceId, mapInfo) => ({
                    style: !isNew && (resourceId || mapInfo?.id) ? { } : { display: 'none' }
                })
            )
        }
    },
    epics: {},
    reducers: {
        controls
    }
});
