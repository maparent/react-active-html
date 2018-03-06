import React from 'react';

import HtmlSerializer from './HtmlSerializer';
import adapter from './adapter';

const debug = process.env.NODE_ENV !== 'production';

let _serializer = null;
let key = 0;

function getKey() {
    key = key + 1;
    return key;
}

function getSerializer() {
    if (_serializer === null) {
        _serializer = new HtmlSerializer();
        _serializer.setAttributesAdapter(adapter);
    }
    return _serializer;
}

function htmlTreeToComponents(tree, componentsMap) {

    return tree.map((item) => {

        if (item.node === 'text') {
            return item.text;
        }

        let componentProps = {
            key: getKey()
        };


        if (typeof item.attributes !== 'undefined') {
            componentProps = Object.assign(componentProps, item.attributes);
        }

        if (typeof item.children !== 'undefined') {
            componentProps = Object.assign(componentProps, {
                children: htmlTreeToComponents(item.children, componentsMap)
            });
        }

        if (typeof componentsMap[item.node] === 'undefined') {
            return React.createElement(item.node, componentProps);
        }

        if (typeof componentsMap[item.node] === 'function') {
            return componentsMap[item.node](componentProps);
        }

        if (debug) {
            console && console.warn("Component mapping should return a function, " + (typeof componentsMap[item.node]) + " was given.");
        }

        return componentsMap[item.node];
    });

}


export default function (htmlSting, componentsMap = {}, options = {}) {
    if (typeof htmlSting !== 'string') {
        if (debug) {
            console && console.error("Html should be string, " + (typeof htmlSting) + " was given.");
            return null;
        }
    }

    let removeEmptyStrings = (options && options.removeEmptyStrings === false) ? false : true;
    let serializer = getSerializer();
    serializer.removeEmptyStrings(removeEmptyStrings);

    const tree = serializer.parseHtml(htmlSting);

    if (typeof tree === 'object' && tree.length > 0) {
        return htmlTreeToComponents(tree, componentsMap);
    }

    return null;
}