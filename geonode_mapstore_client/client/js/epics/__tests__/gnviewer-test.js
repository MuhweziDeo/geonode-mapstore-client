import expect from 'expect';
import { gnViewerRequestNewGeoStoryConfig, gnViewerRequestNewMapConfig } from '@js/epics/gnviewer';
import { requestNewGeostoryConfig, requestNewMapConfig  } from '@js/actions/gnviewer';
import MockAdapter from 'axios-mock-adapter';
import axios from '@mapstore/framework/libs/ajax';

import { testEpic } from '@mapstore/framework/epics/__tests__/epicTestUtils';


let mockAxios;

describe("gnviewer epics", () => {
    beforeEach(done => {
        mockAxios = new MockAdapter(axios);
        setTimeout(done);
    });
    afterEach(done => {
        delete global.__DEVTOOLS__;
        mockAxios.restore();
        setTimeout(done);
    });
    it("should call notifications incase user does not have permission", (done) => {
        mockAxios.onGet().reply(() => [200, {}]);
        const NUM_ACTIONS = 2;
        testEpic(
            gnViewerRequestNewGeoStoryConfig,
            NUM_ACTIONS,
            requestNewGeostoryConfig(),
            (actions) => {
                try {
                    expect(actions.map(({type}) => type )).toEqual(["GEOSTORY:SET_RESOURCE", "SHOW_NOTIFICATION"]);
                    done();
                } catch (error) {
                    done(error);
                }
            },
            {});

    });

    it("should call setNewResource, setResource, setResourceType, setGeoStoryResource when user has permissions", (done) => {
        mockAxios.onGet().reply(() => [200, {}]);
        const NUM_ACTIONS = 4;
        testEpic(
            gnViewerRequestNewGeoStoryConfig,
            NUM_ACTIONS,
            requestNewGeostoryConfig(),
            (actions) => {
                try {
                    expect(actions.map(({type}) => type )).toEqual(["GEONODE:SET_NEW_RESOURCE", "GEONODE:SET_RESOURCE", "GEONODE:SET_RESOURCE_TYPE", "GEOSTORY:SET_RESOURCE"]);
                    done();
                } catch (error) {
                    done(error);
                }
            },
            {security: {user: {perms: ["add_resource"]}}});

    });

    it("should call mapConfig", (done) => {
        mockAxios.onGet().reply(() => [200, {}]);
        const NUM_ACTIONS = 1;
        testEpic(
            gnViewerRequestNewMapConfig,
            NUM_ACTIONS,
            requestNewMapConfig(),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type)).toEqual(["MAP_CONFIG_LOADED"]);
                    done();
                } catch (error) {
                    done(error);
                }
            },
            { security: { user: { perms: ["add_resource"] } } });

    });
});
