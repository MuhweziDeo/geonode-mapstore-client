/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import { Spinner, Button } from 'react-bootstrap-v1';
import HTML from '@mapstore/framework/components/I18N/HTML';
import ResourceCard from '@js/components/home/ResourceCard';
import FaIcon from '@js/components/home/FaIcon';
const Cards = ({
    resources,
    formatHref,
    isCardActive,
    width,
    buildHrefByTemplate,
    options,
    size,
    margin,
    count
}) => {
    const cardWidth = width >= size + margin * 2
        ? Math.floor((width - margin * count) / count)
        : '100%';

    const ulPadding = Math.floor(margin / 2);
    const isSingleCard = count === 0 || count === 1;

    const gridLayoutSpace = (idx) => {

        const gridSpace = isSingleCard
            ? {
                width: width - margin,
                margin: ulPadding
            }
            : {
                width: cardWidth,
                marginRight: (idx + 1) % count === 0 ? 0 : margin,
                marginTop: margin
            };

        return gridSpace;
    };

    const containerStyle = isSingleCard
        ? {
            paddingBottom: margin
        }
        : {
            paddingLeft: ulPadding,
            paddingBottom: margin
        };
    return (
        <ul
            style={containerStyle}
        >
            {resources.map((resource, idx) => {
                return (
                    <li
                        key={resource?.pk}
                        style={(gridLayoutSpace(idx))}
                    >
                        <ResourceCard
                            active={isCardActive(resource)}
                            data={resource}
                            formatHref={formatHref}
                            options={options}
                            buildHrefByTemplate={buildHrefByTemplate}
                            layoutCardsStyle="grid"
                        />
                    </li>
                );
            })}
        </ul>
    );
};

const FeaturedList = ({
    resources,
    loading,
    isNextPageAvailable,
    formatHref,
    isCardActive,
    containerStyle,
    header,
    cardOptions,
    pageSize,
    buildHrefByTemplate,
    isPreviousPageAvailable,
    loadFeaturedResources,
    width,
    onLoad
}) => {

    const margin = 24;
    const size = 320;
    const count = Math.floor(width / (size + margin));

    useEffect(() => {
        onLoad(undefined, count);
    }, [count]);


    const nextIconStyles = {
        fontSize: '2rem',
        ...(!isNextPageAvailable || loading ? {color: 'grey', cursor: 'not-allowed'} : {cursor: 'pointer'})
    };

    const previousIconStyles = {
        fontSize: '2rem',
        ...(!isPreviousPageAvailable || loading ? {color: 'grey', cursor: 'not-allowed'} : {cursor: 'pointer'})};

    return (
        <>
            {resources?.length  && <div className="gn-card-grid">
                {header}
                <div style={{
                    display: 'flex',
                    ...(pageSize === 'sm' && {
                        flexDirection: 'column'
                    })
                }}>
                    <div style={{ flex: 1 }}>
                        <div className="gn-card-grid-container" style={containerStyle}>
                            <h3><HTML msgId={`gnhome.featuredList`}/></h3>
                            <Cards
                                resources={resources}
                                formatHref={formatHref}
                                isCardActive={isCardActive}
                                options={cardOptions}
                                buildHrefByTemplate={buildHrefByTemplate}
                                size={size}
                                margin={margin}
                                width={width}
                                count={count}
                            />
                            <div className="gn-card-grid-pagination featured-list">

                                <Button size="sm" onClick={() => loadFeaturedResources("previous", count)} disabled={!isPreviousPageAvailable || loading}
                                    aria-hidden="true">
                                    <FaIcon  style={previousIconStyles} name="caret-left"/>
                                </Button>

                                <div>
                                    { loading && <Spinner size="sm"  animation="border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </Spinner>}
                                </div>
                                <Button size="sm" onClick={() => loadFeaturedResources("next", count)} disabled={!isNextPageAvailable || loading}
                                    aria-hidden="true">
                                    <FaIcon style={nextIconStyles} name="caret-right"/>

                                </Button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </>
    );
};

FeaturedList.defaultProps = {
    page: 1,
    resources: [],
    isNextPageAvailable: false,
    loading: false,
    formatHref: () => '#',
    isCardActive: () => false,
    isPreviousPageAvailable: false,
    onLoad: () => { }
};

export default FeaturedList;
