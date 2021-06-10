/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import castArray from 'lodash/castArray';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import BrandNavbar from '@js/components/home/BrandNavbar';
import { getParsedGeoNodeConfiguration } from "@js/selectors/config";
import { withResizeDetector } from 'react-resize-detector';
import {
    getPageSize
} from '@js/utils/AppUtils';


function BrandNavbarPlg({
    config,
    width
}) {

    const {
        navbarItemsAllowed,
        theme
    } = config;
    const pageSize = getPageSize(width);

    return (
        <div
            style={{
                top: 0,
                left: 0,
                width: '100%',
                height: 64
            }}>
            <BrandNavbar
                logo={castArray(config?.navbar?.logo || [])
                    .map((logo) => ({
                        ...logo,
                        ...logo[pageSize]
                    }))}

                navItems={navbarItemsAllowed}
                style={{
                    ...theme?.navbar?.style

                }}

            >
            </BrandNavbar>
        </div>
    );
}

const BrandNavbarPlugin = connect(
    createSelector([
        getParsedGeoNodeConfiguration
    ], (config) => ({
        config
    })),
    {}
)(withResizeDetector(BrandNavbarPlg));

export default createPlugin('BrandNavbar', {
    component: BrandNavbarPlugin,
    containers: {
        ViewerLayout: {
            priority: 1,
            target: 'header'
        }
    },
    epics: {},
    reducers: {}
});
