# SPAUI

## Install nwb

SPAUI utilizes a development CLI tool for React apps called "nwb".

`npm install -g nwb`

## Install all dependencies

Once you have nwb installed globally, `npm install`.

## Commands

- `npm start` starts a development server at localhost:3000 with Hot Module Replacement (HMR)
- `npm build` creates a static build within /dist/ that contains the bundled code from the /src/ folder along with all static assets from /public/
- `npm test` runs all tests, currently set up to look for any tests within the /tests/ folder ending in *.test.js
- `npm test:watch` runs all tests and continually watches and re-runs tests when code within the /src/ folder changes
