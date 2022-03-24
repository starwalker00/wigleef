import omitDeep from 'omit-deep';
import jwt_decode from "jwt-decode";

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

export const isJwtExpired = (jwtToken: string) => {
    let decoded = jwt_decode(jwtToken);
    //@ts-ignore
    let exp = decoded.exp;
    //1648066579
    const now = Date.now();
    //1648065183474
    return now > exp * 1000;
};

export const capitalize = (value: string) => {
    return value.charAt(0).toUpperCase().concat(value.slice(1).toLowerCase());
}
