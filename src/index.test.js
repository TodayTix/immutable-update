import test from 'ava';
import _ from 'lodash';

import immutableUpdate from './index';

function assertNoSharedReferences(t, orig, copy) {
  if (!_.isPlainObject(orig) && !_.isArray(orig)) {
    return;
  }
  t.not(orig, copy);

  if (_.isPlainObject(orig)) {
    _.forOwn(orig, (val, key) => {
      assertNoSharedReferences(t, val, copy[key]);
    });
  }
}

function assertDeepCopy(t, orig, copy) {
  t.deepEqual(orig, copy);
  assertNoSharedReferences(t, orig, copy);
}

test("doesn't overwrite unchanged fields", t => {
  const prev = {
    foo: 'bar',
    baz: 'blork',
  };
  const updates = {
    baz: 'hork',
  };
  const state = immutableUpdate(prev, updates);

  t.is(state.foo, prev.foo);
});

test("doesn't mutate the old state object", t => {
  const prev = {
    foo: {
      nested1: 'hi',
      nested2: {
        foo: 'bar',
      },
    },
  };
  const backup = _.cloneDeep(prev);
  const updates = {
    foo: {
      nested2: {
        foo: 'hork',
      },
    },
  };
  const state = immutableUpdate(prev, updates);

  // Confirm that the old state hasn't changed from our backup.
  t.deepEqual(prev, backup);

  // Make sure we actually did change something.
  t.is(state.foo.nested2.foo, updates.foo.nested2.foo);
});

test("doesn't copy subtrees that didn't change", t => {
  const prev = {
    foo: {
      bar: 'baz',
    },
    hi: {
      there: 'person',
    },
  };
  const updates = {
    hi: {
      there: 'fella',
    },
  };
  const state = immutableUpdate(prev, updates);

  // We're asserting here that we *didn't* make a copy.
  t.is(prev.foo, state.foo);
});

test('overwrites arrays', t => {
  const prev = {
    arr: [1, 2, 3, 4, 5],
  };
  const updates = {
    arr: [2, 3],
  };
  const state = immutableUpdate(prev, updates);

  // NOTE(Jeremy):
  // I'm not doing assertDeepCopy because arrays are copied by reference,
  // because we're overwriting (not merging), so we don't have to worry about
  // mutations being a thing.
  t.deepEqual(state, updates);

  // We still want to make sure that we did in fact make a new object, though.
  t.not(state, updates);
});

test('makes a deep copy of new objects', t => {
  const prev = {};
  const updates = {
    foo: {
      bar: {
        baz: {
          qux: 'hork',
        },
      },
    },
  };
  const state = immutableUpdate(prev, updates);

  assertDeepCopy(t, state, updates);
});

test('creates an array when the original state was an array', t => {
  const prev = [1, 2, 3];
  const updates = [1, 2, 3, 4];
  const state = immutableUpdate(prev, updates);

  t.true(Array.isArray(state), 'Generated state is not an array.');
  assertDeepCopy(t, updates, state);
});

test('allows hard overwrites on specified fields', t => {
  const prev = {
    foo: {
      bar: 'baz',
    },
  };
  const updates = {
    foo: {
      hi: 'hello',
    },
  };
  const state = immutableUpdate(prev, updates, ['foo']);

  assertDeepCopy(t, state, updates);
});

test('correctly overwrites deeply nested fields with overwrite param', t => {
  const prev = {
    foo: {
      bar: {
        baz: 'qux',
      },
      other: 'val',
    },
  };
  const updates = {
    foo: {
      bar: {
        hi: 'hello',
      },
    },
  };
  const state = immutableUpdate(prev, updates, ['foo.bar']);

  assertDeepCopy(t, state.foo.bar, updates.foo.bar);
  t.is(state.foo.other, prev.foo.other);
});

test('overwrites objects with given scalar values', t => {
  // For example, a given `null` should override a stored object.
  const prev = {
    blah: 'hiya',
    foo: {
      bar: 'baz',
    },
  };
  const updates = {
    foo: null,
  };
  const state = immutableUpdate(prev, updates);

  t.deepEqual(state, {
    blah: 'hiya',
    foo: null,
  });
});
