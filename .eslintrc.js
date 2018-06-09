module.exports = {
    "extends": "airbnb-base",
    "env": {
        "mocha": true,
        "node": true
    },
    "rules": {
        "class-methods-use-this": ["off"],
        "max-len": ["error", { "code": 200 }],
    }
};