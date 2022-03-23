import omitDeep from 'omit-deep';

export const namedConsoleLog = (variableName, variableValue) => {
    console.log(`${variableName}:::::`);
    console.log(variableValue);
};

export const prettyJSON = (message, obj) => {
    console.log(message, JSON.stringify(obj, null, 2));
};

export const omit = (object: any, name: string) => {
    return omitDeep(object, name);
};
