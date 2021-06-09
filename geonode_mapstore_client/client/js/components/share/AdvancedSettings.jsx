import React, { useState } from 'react';
import SwitchPanel from '@mapstore/framework/components/misc/switch/SwitchPanel';
import {
    Glyphicon,
    Checkbox,
    FormControl,
    FormGroup,
    ControlLabel,
    Tooltip,
    OverlayTrigger
} from 'react-bootstrap';
import isNil from 'lodash/isNil';
import inRange from 'lodash/inRange';
import Message from '@mapstore/framework/components/I18N/Message';
import Editor from '@mapstore/framework/components/data/identify/coordinates/Editor';
import {set} from '@mapstore/framework/utils/ImmutableUtils';

const AdvancedSettings = (props = {}) => {
    // TODO handle point clicked and marker
    const setMarkerSetting = () => ({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    return (
        <SwitchPanel
            title={<Message msgId="share.advancedOptions"/>}
            expanded={showAdvanced}
            onSwitch={() => setShowAdvanced(!showAdvanced)}
        >
            {props.advancedSettings?.bbox && <Checkbox
                checked={props.settings?.bboxEnabled}
                onChange={() =>
                    props.onUpdateSettings({
                        ...props.settings,
                        bboxEnabled: !props.settings?.bboxEnabled,
                        centerAndZoomEnabled: false,
                        markerEnabled: false
                    })}>
                <Message msgId="share.addBboxParam" />
            </Checkbox>}
            {props.advancedSettings?.centerAndZoom && <Checkbox
                checked={props.settings && props.settings?.centerAndZoomEnabled}
                onChange={() => {
                    props.onUpdateSettings({
                        ...props.settings,
                        centerAndZoomEnabled: !props.settings?.centerAndZoomEnabled,
                        ...setMarkerSetting(),
                        bboxEnabled: false
                    });
                    props.settings?.centerAndZoomEnabled && props.hideMarker();
                }
                }>
                <Message msgId={props.settings?.markerEnabled ? "share.addMarkerAndZoomParam" : "share.addCenterAndZoomParam"} />
            </Checkbox>}
            {props.settings?.centerAndZoomEnabled && <div>
                <FormGroup id={"share-container"}>
                    <ControlLabel><Message msgId="share.coordinate" /></ControlLabel>
                    <OverlayTrigger placement="top" overlay={<Tooltip id="share-coordinate"><Message msgId="share.coordTooltip"/></Tooltip>}>
                        <Glyphicon style={{marginLeft: 5}} glyph="info-sign" />
                    </OverlayTrigger>
                    <Editor
                        removeVisible={false}
                        formatCoord={props.formatCoord}
                        coordinate={{lat: props.coordinate[1] || "", lon: props.coordinate[0] || ""}}
                        onSubmit={(val)=>{
                            const lat = !isNil(val.lat) && !isNaN(val.lat) ? parseFloat(val.lat) : 0;
                            const lng = !isNil(val.lon) && !isNaN(val.lon) ? parseFloat(val.lon) : 0;
                            let newPoint = set('latlng.lng', lng, set('latlng.lat', lat, props.point));
                            props.addMarker(newPoint);
                        }}
                        onChangeFormat={props.onChangeFormat}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel><Message msgId="share.zoom" /></ControlLabel>
                    <OverlayTrigger placement="top" overlay={<Tooltip id="share-zoom"><Message msgId="share.zoomToolTip"/></Tooltip>}>
                        <Glyphicon style={{marginLeft: 5}} glyph="info-sign" />
                    </OverlayTrigger>
                    <FormControl
                        type="number"
                        min={1}
                        max={35}
                        name={"zoom"}
                        value={props.zoom || 21}
                        onChange={({target}) => {
                            const zoom = inRange(parseInt(target.value, 10), 1, 36) ? target.value : 1;
                            props.setZoom(zoom);
                        }}/>
                </FormGroup>
            </div>
            }
        </SwitchPanel>
    );
};

AdvancedSettings.defaultProps = {
    advancedSettings: {
        centerAndZoomEnabled: true,
        homeButton: false,
        bbox: true,
        centerAndZoom: true
    },
    settings: {
        centerAndZoomEnabled: true
    },
    onUpdateSettings: () => {},
    hideMarker: () => {},
    onChangeFormat: () => {},
    coordinate: [],
    onSubmitClickPoint: () => {},
    addMarker: () => {},
    setZoom: () => {}
};
export default AdvancedSettings;
