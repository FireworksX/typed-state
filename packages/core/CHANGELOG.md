# @graph-state/core

## 0.10.1

### Patch Changes

- 6f52fbd: added optional param updateSelector to control notify
- 6e9b263: Add onDebugEvent. Add new profiler plugin.

## 0.10.0

### Minor Changes

- 54446c3: Make state as Graph with \_type & \_id insted type & id
- cb71a1e: Add allow circular depends
- eea756e: Change signature for replace method.

### Patch Changes

- 78824a5: Added new hook useGraphEffect
- 05957f6: Add AbortSignal for unsubscribe
- 782659b: Fix skipping for arrays

## 0.9.3

### Patch Changes

- b198a49: Skip mutation for skiped fields.

## 0.9.2

### Patch Changes

- 7edfb91: Add function to replace. Pass options in react package.

## 0.9.1

### Patch Changes

- 8042bee: Make cache is public

## 0.9.0

### Minor Changes

- 0e20d07: Add notify after invalidate by GB

## 0.8.0

### Minor Changes

- 4f34182: Improve plugins
- 1b0a9aa: Make `safe` option false by default. Add options into React wrappers.
- 7a81754: Remove useless graphs from cache. Update logger.

### Patch Changes

- d6a9729: Fix shallowEquals for arrays
- d2077a3: Add prev state into subscribe
- df9c451: Fix shallowEqual for array order.
- 399af79: Add debug message

## 0.7.0

### Minor Changes

- 705b627: Add type decrations

## 0.6.7

### Patch Changes

- f87d2cf: Fix \_type on State

## 0.6.6

### Patch Changes

- 038da9c: Add type for CreateState. Skip get all fields of inputs. Add new checkers.
- Updated dependencies [038da9c]
  - @graph-state/checkers@0.1.2

## 0.6.5

### Patch Changes

- 284760c: Fix linkin parent if pass deep object.

## 0.6.4

### Patch Changes

- 02db1ee: Fix linking parent if pass LinkKey in mutate

## 0.6.3

### Patch Changes

- aca0522: Fix deep resolve after invalidate
- d4f87c2: Notify only parents while invalidation
- bdf1a97: Fix skip \_id if pass zero
- 86141e3: getArgumentsForMutate resolve LinkKey in data

## 0.6.2

### Patch Changes

- d8a39ab: Fix skips when invalidating graph. Add `safe` option to `resolve` method.

## 0.6.1

### Patch Changes

- 6a8c135: Add skip option

## 0.6.0

### Minor Changes

- 3619862: Added deep resolve options

### Patch Changes

- 0d1ba14: Use overrideMutateMethod option.
- 89ae6d3: Pass invalid entity to resolve for get null.

## 0.5.0

### Minor Changes

- 757f06c: Graph state have own state. Update useGraph hook.

### Patch Changes

- 388fbee: Removed the deletion of subscribers upon invalidation
- 9fe75c1: Implement deep detection updates for mutation.
- 4228c86: Add dedup option to mutate

## 0.4.0

### Minor Changes

- 043db75: Add GarbageCollector for links

### Patch Changes

- d4e81d0: Add extend plugin. Core method getArgumentsForMutate return computed data.

## 0.3.1

### Patch Changes

- 6c8b8d2: Remove link after invalidation. Fix re-render useInspectFields.
- a315338: Export utils
- 745f7f1: Fix inspectField to return new link

## 0.3.0

### Minor Changes

- 6cd0030: Update link base structure. Add batch update.

### Patch Changes

- 05f88d0: Add types for inspectFields
- 4abe615: Skip not changing mutation (primitives only)
- 2b8e8c7: useGraph:

  - Changed the structure of the useGraph hook, now it returns a tuple of `[value, setter]`.
  - Vitest configure & added base tests.

  Core:

  - Added new types

## 0.2.0

### Minor Changes

- dec27b3: Integrate ESLint. Update refs system for links.
- e9f5f73: Add keying map for entities

### Patch Changes

- e9f5f73: Remove link ref if her is empty
- b7ae94b: Make getArgumentsForMutate as static method.

## 0.1.8

### Patch Changes

- f2a43a7: Test full pipeline

## 0.1.4

### Patch Changes

- 05838cc: ddd

## 0.1.3

### Patch Changes

- 34c3395: 11

## 0.1.2

### Patch Changes

- 063d5cb: 11

## 0.1.1

### Patch Changes

- 1112c57: Upd
- 43ca9c8: 123
- 1437243: fdsfg
- b2b9a74: dff
- fec21e3: 111
- 6051d61: Fix tests and rename to GraphState
- a0fe12c: 123
