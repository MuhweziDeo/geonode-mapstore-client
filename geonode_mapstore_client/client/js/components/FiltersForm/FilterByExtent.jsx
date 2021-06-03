
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Form } from 'react-bootstrap-v1';
import BaseMap from '@mapstore/framework/components/map/BaseMap';
import mapType from '@mapstore/framework/components/map/enhancers/mapType';
import Message from '@mapstore/framework/components/I18N/Message';
import { reprojectBbox } from '@mapstore/framework/utils/CoordinatesUtils';
import {
    boundsToExtentString,
    getFeatureFromExtent
} from '@js/utils/GNCoordinatesUtils';

const Map = mapType(BaseMap);
Map.displayName = 'Map';

function ZoomTo({
    map,
    extent
}) {
    const once = useRef();
    useEffect(() => {
        if (map && extent && !once.current) {
            const [
                aMinx, aMiny, aMaxx, aMaxy,
                bMinx, bMiny, bMaxx, bMaxy
            ] = extent.split(',');
            const projection = map.getView().getProjection().getCode();
            let bounds;
            const aBounds = reprojectBbox([aMinx, aMiny, aMaxx, aMaxy], 'EPSG:4326', projection);
            if (bMinx !== undefined && bMiny !== undefined && bMaxx !== undefined && bMaxy !== undefined) {
                const bBounds = reprojectBbox([bMinx, bMiny, bMaxx, bMaxy], 'EPSG:4326', projection);
                // if there is the second bbox we should shift the minimum x value to correctly center the view
                // the x of the [A] bounds needs to be shifted by the width of the [B] bounds
                const minx = aBounds[0] - (bBounds[2] - bBounds[0]);
                bounds = [minx, aBounds[1], aBounds[2], aBounds[3]];
            } else {
                bounds = aBounds;
            }
            map.getView().fit(bounds, {
                size: map.getSize(),
                duration: 300
            });
            // ensure to avoid other fit action by setting once to true
            once.current = true;
        }
    }, [ extent ]);

    return null;
}

function FilterByExtent({
    id,
    queryExtent,
    extent,
    projection,
    onChange,
    vectorLayerStyle,
    layers
}) {

    const enabled = !!extent;
    const [tmpExtent, setTmpExtent] = useState();
    const isFirstMapViewChange = useRef(true);

    function handleOnSwitch(event) {
        onChange({
            extent: event.target.checked
                ? tmpExtent
                : undefined
        });
    }

    function handleOnMapViewChanges(center, zoom, bbox) {
        const { bounds, crs } = bbox;
        const newExtent = boundsToExtentString(bounds, crs);
        if (isFirstMapViewChange.current) {
            isFirstMapViewChange.current = false;
        } else if (enabled) {
            onChange({
                extent: newExtent
            });
        }
        setTmpExtent(newExtent);
    }

    return (
        <Form.Group
            key={id + '-extent'}
            controlId={id + '-extent'}
            className="gn-filter-by-extent"
        >
            <Form.Check
                checked={enabled}
                type="switch"
                id="gn-filter-by-extent-switch"
                label={<Message msgId="gnhome.extent"/>}
                onChange={handleOnSwitch}
            />
            <div
                className="gn-filter-by-extent-map"
                style={{
                    height: 300,
                    opacity: enabled ? 1 : 0.4,
                    pointerEvents: enabled ? 'auto' : 'none',
                    position: 'relative'
                }}
            >

                <Map
                    id="gn-filter-by-extent-map"
                    mapType="openlayers"
                    map={{
                        registerHooks: false,
                        projection
                    }}
                    styleMap={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%'
                    }}
                    eventHandlers={{
                        onMapViewChanges: handleOnMapViewChanges
                    }}
                    layers={[
                        ...(layers ? layers : []),
                        ...(queryExtent
                            ? [{
                                id: 'highlight',
                                type: 'vector',
                                features: [getFeatureFromExtent(queryExtent)],
                                style: vectorLayerStyle
                                    ? { ...vectorLayerStyle,  weight: 0.001 }
                                    : {
                                        color: '#397AAB',
                                        opacity: 0.8,
                                        fillColor: '#397AAB',
                                        fillOpacity: 0.4,
                                        weight: 0.001
                                    }
                            }]
                            : []
                        )
                    ]}
                >
                    <ZoomTo extent={queryExtent} />
                </Map>
            </div>
        </Form.Group>
    );
}

FilterByExtent.defaultProps = {
    projection: 'EPSG:3857'
};

export default FilterByExtent;
