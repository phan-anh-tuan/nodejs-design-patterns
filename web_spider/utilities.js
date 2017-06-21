'use strict';
module.exports.promisify = function(callbackBasedAPI) {
    return function promisified() {
        return new Promise((resolve,reject) => {
            const args = [].slice.call(arguments);
            args.push((error,result) => {
                let callbackBasedAPIArguments = arguments;
                if (error) { return reject(error); }
                if (callbackBasedAPIArguments.length <= 2) {
                    resolve(result);
                } else {
                    resolve([].slice.call(callbackBasedAPIArguments,1));
                }
            });
            callbackBasedAPI.apply(null,args);
        });
    }
}