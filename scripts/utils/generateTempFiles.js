const fs = require('fs-extra');
const path = require('path');
const tools = require('./tools');

const generateTempFiles = ({
                             compileConfig = {},
                             runtimeConfig = {},
                             mockConfig = {},
                             env
                           }) => {
  const pages = tools.resolveClients(compileConfig.dependencies);

};

module.exports = generateTempFiles;
