# AudiComp

## Setup Local Development Environment

Build scripts do not fail with node v5.8.0 and npm 5.3.0.
Make sure everything is set up accordingly or use the *node version manager* (nvm, https://github.com/nvm-sh/nvm)

    nvm install
    nvm use
    nvm install-latest-npm

## Run Local Build

This project has been developed using Flow (https://github.com/flow-typed/flow-typed see `.flowconfig`).
Running flow is part of a babel-build-process (see `.babelrc`). To run the build run:

    npm run build

## Run Local Development Environment

To run a local server, serving all files including livereload do the following:

## Ongoing

- use webpack to create one file from the library
- IDGenerator exported 2 times Counter
- circular dependency on AGObject (leading to TDZ, see https://github.com/webpack/webpack/issues/9173)