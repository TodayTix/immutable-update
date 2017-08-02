import assignWith from 'lodash.assignwith';
import cloneDeep from 'lodash.clonedeep';
import forEach from 'lodash.foreach';
import get from 'lodash.get';
import isPlainObject from 'lodash.isplainobject';
import mergeWith from 'lodash.mergewith';
import set from 'lodash.set';

/**
 * Generate a new state from an existing state. Mostly a thin wrapper around
 * lodash.merge.
 * @param  {Object} state Current state.
 * @param  {newState} newStateProps New state props.
 * @param {string[]} overwrite
 *   Array of fields that should be overwritten, instead of merged.
 * @return {Object} New state.
 */
export default function newState(state, newStateProps, overwrite = []) {
  const merged = (Array.isArray(state) ? [] : {});

  if (isPlainObject(newStateProps)) {
    // Copy over (by reference) everything that's not in the new object.
    // This avoids making unnecessary copies of objects (which would invalidate
    // selector memoization).
    // The first attempt at this, doing
    // `if (prevValue === undefined) return newValue;`
    // led to objects being copied by reference when merging the empty object
    // and state, and then being mutated when that resulting object was merged
    // with the newStateProps object.
    assignWith(merged, state, (mergedVal, stateVal, key) => (
      newStateProps[key] === undefined ?
      // When we know this won't be merged/overridden, take the value from
      // state. Otherwise, it's left as undefined, so that the mergeWith call
      // below can handle it as needed. (Since merged is empty at this point,
      // mergedVal is always undefined).
      stateVal : mergedVal
    ));
  }

  mergeWith(merged, state, newStateProps,
    (prevValue, newValue) => {
      if (prevValue === newValue) {
        // Nothing changed. By default, lodash would make a copy anyways.
        // Don't do that.
        return prevValue;
      } if (Array.isArray(newValue)) {
        return newValue;
      } else if (newValue === undefined) {
        // Lodash makes unnecessary copies by default. We treat state as
        // immutable, so it's more efficient to preserve the reference.
        return prevValue;
      } else if (isPlainObject(prevValue) && isPlainObject(newValue)) {
        // Recurse down another level.
        return newState(prevValue, newValue);
      } else {
        // Signal to mergeWith to use default merge behavior.
        return undefined;
      }
    }
  );

  forEach(overwrite, (key) => {
    set(merged, key, cloneDeep(get(newStateProps, key)));
  });

  return merged;
}
