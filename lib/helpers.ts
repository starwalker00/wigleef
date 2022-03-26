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

export function isaValidHandleFormat(candidateHandle: string) {
    let regExp = /^[a-z0-9.]*$/
    return regExp.test(candidateHandle)
}

export const truncateEthAddress = (address: string) => {
    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = address.match(truncateRegex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
};
