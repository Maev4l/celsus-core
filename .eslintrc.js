module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    node: true,
    mocha: true,
  },
  rules: {
    'class-methods-use-this': ['off'],
  },
};
