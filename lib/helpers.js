export const prettyJSON = (message, obj) => {
    console.log(message, JSON.stringify(obj, null, 2));
};