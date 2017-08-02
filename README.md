# Immutable Update

[![NPM Version][npm-image]][npm-url]
[![Build Status][circle-image]][circle-url]
[![Downloads Stats][npm-downloads]][npm-url]
[![Coverage Status][coverage-image]][coverage-url]

## Description

A utility function for efficiently applying updates to objects that are being
treated as immutable data.

## Why?

Immutability is, in general, a useful pattern for state management patterns
using libraries like [Redux](http://redux.js.org/). However, not everybody wants
to use a large immutability library like [ImmutableJS](https://facebook.github.io/immutable-js/),
and using regular objects can lead to a lot of boilerplate.

This library allows you to turn this...

```javascript
function reducer(state, action) {
  switch (action.type) {
    case MY_ACTION: {
      return {
        ...state,
        subObject1: {
          ...state.subObject1,
          myChange: 'newVal',
        },
        subObject2: {
          ...state.subObject2,
          myOtherChange: 'otherNewVal',
        },
      }
    }
  }
}
```

into this...

```javascript
import immutableUpdate from 'immutable-update';

function reducer(state, action) {
  switch (action.type) {
    case MY_ACTION: {
      return immutableUpdate(state, {
        subObject1: { myChange: 'newVal' },
        subObject2: { myOtherChange: 'otherNewVal' },
      });
    }
  }
}
```

All references to objects that aren't changed are preserved, so any memoization
or React pure rendering things that are checking object identities will work as
expected, and no unnecessary copies are made.

## Installation

```sh
npm install --save immutable-update
```

## Usage

The `immutableState` function is exported as a UMD build, with the name in the
global namespace being `immutableState` if you're not using any module system.

### Override param

The function also accepts an optional 3rd parameter of an array of paths to
override, instead of merging.

For example:

```javascript
const state = {
  foo: {
    bar: 'baz',
    today: 'tix',
  },
};

// Returns { foo: { bar: 'hiya', today: 'tix' } }
immutableState(state, {
  foo: {
    bar: 'hiya',
  },
});

// Returns { foo: { bar: 'hiya' } }
immutableState(state, {
  foo: {
    bar: 'hiya',
  },
}, [
  'foo'
]);
```

The strings in this array can be of any format supported by
[lodash#set](https://lodash.com/docs/#set).

## Contributing

Please make sure your code passes our tests and linter. PRs/Issues welcome!

```sh
npm test
npm run lint
```

## Meta

Distributed under the MIT License. See ``LICENSE`` for more information.

Developers:

_[Jeremy Tice](https://github.com/jetpacmonkey)_
[@jetpacmonkey](https://twitter.com/jetpacmonkey)

[npm-image]: https://img.shields.io/npm/v/immutable-update.svg?style=flat-square
[npm-url]: https://npmjs.org/package/immutable-update
[npm-downloads]: https://img.shields.io/npm/dm/immutable-update.svg?style=flat-square
[circle-image]: https://img.shields.io/circleci/project/github/TodayTix/immutable-update.svg?style=flat-square
[circle-url]: https://circleci.com/gh/TodayTix/immutable-update
[coverage-image]: https://coveralls.io/repos/github/TodayTix/immutable-update/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/TodayTix/immutable-update?branch=master

