/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import MockAdapter from 'axios-mock-adapter';
import axios from '@mapstore/framework/libs/ajax';
import { testEpic } from '@mapstore/framework/epics/__tests__/epicTestUtils';
import {
    SAVING_RESOURCE,
    SAVE_SUCCESS,
    SAVE_ERROR,
    saveContent,
    updateResourceBeforeSave
} from '@js/actions/gnsave';
import {
    UPDATE_RESOURCE_PROPERTIES,
    RESOURCE_LOADING,
    SET_RESOURCE,
    RESOURCE_ERROR,
    SET_USER_RESOURCE_PERMISSIONS
} from '@js/actions/gnresource';
import {
    gnSaveContent,
    gnUpdateResource,
} from '@js/epics/gnsave';
import {checkFeatureAndEditorPermissions} from '@js/epics';
import { SET_PERMISSION } from '@mapstore/framework/actions/featuregrid'
import {SET_EDIT_PERMISSION} from '@mapstore/framework/actions/styleeditor'
import { selectNode } from '@mapstore/framework/actions/layers';


let mockAxios;

describe('gnsave epics', () => {
    beforeEach(done => {
        global.__DEVTOOLS__ = true;
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        delete global.__DEVTOOLS__;
        mockAxios.restore();
        setTimeout(done);
    });
    it('should create new map with success (gnSaveContent)', (done) => {
        const NUM_ACTIONS = 3;
        const metadata = {
            title: 'Title',
            description: 'Description',
            thumbnail: 'thumbnail.jpeg'
        };
        mockAxios.onPost().reply(() => [200, {}]);
        testEpic(
            gnSaveContent,
            NUM_ACTIONS,
            saveContent(undefined, metadata, false),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            SAVING_RESOURCE,
                            SAVE_SUCCESS,
                            UPDATE_RESOURCE_PROPERTIES
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            {}
        );
    });
    it('should update existing map with success (gnSaveContent)', (done) => {
        const NUM_ACTIONS = 3;
        const id = 1;
        const metadata = {
            title: 'Title',
            description: 'Description',
            thumbnail: 'thumbnail.jpeg'
        };
        mockAxios.onPatch().reply(() => [200, {}]);
        testEpic(
            gnSaveContent,
            NUM_ACTIONS,
            saveContent(id, metadata, false),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            SAVING_RESOURCE,
                            SAVE_SUCCESS,
                            UPDATE_RESOURCE_PROPERTIES
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            {}
        );
    });
    it('should save content with error (updateResourceBeforeSave)', (done) => {
        const NUM_ACTIONS = 2;
        const metadata = {
            title: 'Title',
            description: 'Description',
            thumbnail: 'thumbnail.jpeg'
        };
        testEpic(
            gnSaveContent,
            NUM_ACTIONS,
            saveContent(undefined, metadata),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            SAVING_RESOURCE,
                            SAVE_ERROR
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            {}
        );
    });
    it('should update resource before save (gnUpdateResource)', (done) => {
        const NUM_ACTIONS = 2;
        const id = 1;
        mockAxios.onGet().reply(() => [200, {}]);
        testEpic(
            gnUpdateResource,
            NUM_ACTIONS,
            updateResourceBeforeSave(id),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            RESOURCE_LOADING,
                            SET_RESOURCE
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            {}
        );
    });
    it('should update resource before save with error (gnUpdateResource)', (done) => {
        const NUM_ACTIONS = 2;
        const id = 1;
        testEpic(
            gnUpdateResource,
            NUM_ACTIONS,
            updateResourceBeforeSave(id),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            RESOURCE_LOADING,
                            RESOURCE_ERROR
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            {}
        );
    });

    it("should trigger permission actions for style and edit", (done) => {
        mockAxios.onGet(new RegExp(`layers/*`)).reply(() => [200, 
                {data: {layers: [{perms: ['change_layer_style', 'change_layer_data']}]}}]);
        const NUM_ACTIONS = 3;
        testEpic(checkFeatureAndEditorPermissions, 
            NUM_ACTIONS, selectNode(1, "layer"),(actions) => {
            try {
                expect(actions.map(({type}) => type)).toEqual([SET_PERMISSION,SET_USER_RESOURCE_PERMISSIONS, SET_EDIT_PERMISSION]);
                done();
            } catch (error) {
                done(error);
            }
        }, {layers:{flat: [{name: "testLayer", id: "test_id"}], selected: ["test_id"]}})

    })
});
