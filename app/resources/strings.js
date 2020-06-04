const strings = require('./lang/index.js').strings;

/**
 * @description Formats and returns a resource
 * @author Alexandre Gallant <1alexandregallant@gmail.com>
 *
 * @param resourceName Name of the resource to return
 * @param params Parameters to use to format the resource
 * @returns {string} The resource
 */
exports.resource = function (resourceName, params = []) {
    const resourceNameParts = resourceName.split('.');
    let resource = strings;

    resourceNameParts.forEach(part => {
        resource = resource[part];
    });

    if (typeof(resource) != 'string') {
        throw new ReferenceError();
    }

    params.forEach(param => {
       resource = resource.replace('{{' + param['name'] + '}}', param['value']);
    });

    return resource;
};