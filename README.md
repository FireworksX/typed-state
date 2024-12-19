<div align="center">

[![npm](https://img.shields.io/npm/v/@graph-state/core?style=flat-square)](https://www.npmjs.com/package/@graph-state/core)
![npm type definitions](https://img.shields.io/npm/types/@graph-state/core?style=flat-square)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@graph-state/core?style=flat-square)](https://bundlephobia.com/result?p=@graph-state/core)

<br/>
<br/>
</div>

# @graph-state


> graph-state is **graph based** state manager, designed for both simple and complex applications.
> Focused on work with many deep and dependence data.

## Packages

| Package                                                                                                     | Version                                                                                                                                       | Docs                                                                                                     | Size                                                                                                                                                                        |
|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`@graph-state/core`](https://github.com/FireworksX/graph-state/tree/master/packages/core#readme)           | [![npm](https://img.shields.io/npm/v/@graph-state/core?style=flat-square)](https://www.npmjs.com/package/@graph-state/core)                   | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/core)  | [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@graph-state/core?style=flat-square)](https://bundlephobia.com/result?p=@graph-state/core)                   |
| [`@graph-state/react`](https://github.com/FireworksX/graph-state/tree/master/packages/react/#readme)        | [![npm](https://img.shields.io/npm/v/@graph-state/react?style=flat-square)](https://www.npmjs.com/package/@graph-state/react)                 | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/packages/react) | [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@graph-state/react?style=flat-square)](https://bundlephobia.com/result?p=@graph-state/react)                 |
| [`@graph-state/plugin-logger`](https://github.com/FireworksX/graph-state/tree/master/plugins/logger#readme) | [![npm](https://img.shields.io/npm/v/@graph-state/plugin-logger?style=flat-square)](https://www.npmjs.com/package/@graph-state/plugin-logger) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/plugins/logger) | [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@graph-state/plugin-logger?style=flat-square)](https://bundlephobia.com/result?p=@graph-state/plugin-logger) |
| [`@graph-state/plugin-ws`](https://github.com/FireworksX/graph-state/tree/master/plugins/ws#readme)         | [![npm](https://img.shields.io/npm/v/@graph-state/plugin-ws?style=flat-square)](https://www.npmjs.com/package/@graph-state/plugin-ws)         | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/plugins/ws)     | [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@graph-state/plugin-ws?style=flat-square)](https://bundlephobia.com/result?p=@graph-state/plugin-ws)         |
| [`@graph-state/plugin-extend`](https://github.com/FireworksX/graph-state/tree/master/plugins/extend#readme) | [![npm](https://img.shields.io/npm/v/@graph-state/plugin-extend?style=flat-square)](https://www.npmjs.com/package/@graph-state/plugin-extend) | [![](https://img.shields.io/badge/API%20Docs-markdown-lightgrey.svg?style=flat-square)](/plugins/extend) | [![npm bundle size](https://img.shields.io/bundlephobia/minzip/@graph-state/plugin-ws?style=flat-square)](https://bundlephobia.com/result?p=@graph-state/plugin-extend)     |

## Examples

- Base functional [CodeSandbox](https://codesandbox.io/p/devbox/pq5l3h)

## Get started


### Install

```sh
npm i @graph-state/core @graph-state/react
```

or

```sh
yarn add @graph-state/core @graph-state/react
```

### Usage

**App.tsx**

```jsx
import { useGraph } from '@graph-state/react'
import { createState } from '@graph-state/core'

const grapState = createState({
  initialState: {
    value: 150
  }
})

const App = () => {
  const [state, setState] = useGraph(grapState, grapState.key)

  return <div>
    <h1>{state.value}</h1>
    <input type="text" value={state.value} onChange={(e) => setState({ value: e.target.value })}/>
  </div>
}
```

## Base state
```js
const state = createState({
  initialState: {
    modal: 'about',
    layers: []
  }
})

state.subscribe(state, (data) => {
  // state updates
})

state.resolve(state) // { modal: 'about', layers: [] }
// or state.resolve(state) or state.resolve(state.key)

state.mutate({
  layers: [19]
})

state.resolve(state) // { modal: 'about', layers: [19] }
```

## Concept

Graph state had few abstractions

- **Graph** - payload of state, as atom. Required `_type` field.
- **Graph key** - its string as `_type:_id` of graph
- **State** - graph manager. It`s a **graph**. You can create compositions with nested **states** which had isolate scope of graphs

---

## Graph
Is plain object with `_type`
```jsx
const baseGraph = {
  _type: 'Graph',
  _id: 'any uniq id' // or id or use keying config
}
```

## State
Is a manager of graphs with reactive updates.

```jsx
import { createState } from '@graph-state/core'

const graphState = createState()

console.log(graphState)
/**
 * _id: 'State uniq id'
 * _type: 'Instance'
 * ...other methods
 */
```

### State mutate method
Signature

- `mutate(updatedGraph)`
- `mutate(graphKey, updatedGraph)`
- `mutate(graphKey, (prevGraph) => updatedGrap)`

```jsx
import { createState } from '@graph-state/core'

const graphState = createState()

const user = {
  _type: 'User',
  _id: 'usernameOne',
  name: 'James'
}

graphState.mutate(user)

// Now graphState has user, you can read him
graphState.resolve(user).name // James

// Change name
graphState.mutate({
  ...user,
  name: 'Not James'
})
graphState.resolve(user).name // Not James

// Change by key
graphState.mutate('User:usernameOne', {
  name: 'Alie',
  gender: 'female' // Add new property
})

graphState.resolve(user)
/**
 * _type: 'User'
 * _id: 'usernameOne'
 * name: 'Alie'
 * gender: 'female'
 */

// Mutate with conditional
graphState.mutate('User:usernameOne', prev => ({
  someProp: prev.gender === 'female' ? 'value one' : 'value two'
}))

```

> By default, state deep merged. You don`t need spread every update.
> You can use {replace: true} on mutation for replace state.

You can create link between graphs
```js
const state = createState({
  initialState: {
    posts: []
  }
})

// Now graph Post:1 have not links, he`s abstract 
state.mutate({
  _type: 'Post',
  _id: 1
})

// Let`s make link
state.mutate(state, {
  posts: ['Post:1'] // or { _type: 'Post', _id: 1 }
})

state.resolve(state)
/**
 * _type: State
 * _id: ID
 * posts: [Post:1]
 */

```

> **Attention**
If you use `replace: true` on mutate when pass LinkKey, link will
parse into graph { _type: Type, _id: ID } and replace current value.
> Use function on replace for control level.


```js
const state = createState({
  initialState: {
    user: {
      _type: 'User',
      _id: '0',
      age: 25,
      skills: [
        { _type: 'Skill', _id: 'ts', level: 80 }, 
        { _type: 'Skill', _id: 'go', level: 40 }
      ]
    }
  }
})

state.mutate('User:0', prev => ({
  ...prev
  /**
   * If replace:true then skills replace to
   * { _type: 'Skill', _id: 'ts' },
   * { _type: 'Skill', _id: 'go' }
   * without self fields.
   */
  skills: ['Skill:go', 'Skill:ts'] 
}), {
  replace: (graph) => graph._type === 'User' 
})

state.resolve('Skill:ts')
/**
 * _type: Skill
 * _id: ts
 * level: 80
 * All fields saved
 */


```

### Mutate options

 - `replace` - force replace object or array (default: false)
 - `dedup` - skip duplicate links in array (default: true)
```js
state.mutate(
  { ...some data }, 
  {
    replace: true,
    dedup: false
  }
)
```


---

### State resolve value and inspect fields
```jsx
import { createState } from '@graph-state/core'

const userOne = {
  _type: 'User',
  _id: 'id',
  name: 'James'
}

const userTwo = {
  _type: 'User',
  _id: 'id2',
  name: 'Barb'
}
const graphState = createState({initialState: [userOne, userTwo]})

graphState.resolve(userOne).name // James
graphState.resolve('User:id2').name // Barb

graphState.inspectFields('User')
/**
 * User:id
 * User:id2
 */
```

### Resolve options
- `deep` - resolve all nested graphs (default: false)
- `safe` - save link for empty graph (default: false)

### Observe updates

#### Simple variant
```jsx

import { createState } from '@graph-state/core'

const userGraph = {
  _type: 'User',
  _id: 'id',
  name: 'James'
}

const graphState = createState({initialState: userGraph})

graphState.subscribe(userGraph, (nextState) => {
  /**
   * _type
   * _id
   * name: Stef
   */
})

graphState.mutate({
  ...userGraph,
  name: 'Stef'
})


```

#### Subscribe on all state
```js
import { createState } from '@graph-state/core'

const userGraph = {
  _type: 'User',
  _id: 'id',
  name: 'James'
}

const graphState = createState({initialState: userGraph})

graphState.subscribe(nextState => {
  // Call every state update
})

graphState.mutate({
  ...userGraph,
  name: 'Stef'
})
```


#### Nested graph

```jsx
import { createState } from '@graph-state/core'

const user = {
  _type: 'User',
  _id: 'id',
  name: 'Vlad'
}

const post = {
  _type: 'Post',
  _id: 'id',
  title: 'Some post title',
  auhtor: user
}

const graphState = createState({initialState: post})

graphState.subscribe(user, (nextState) => {
  /**
   * user will be updated if parent was chnaged
   * 
   * _type
   * _id
   * name: Stef
   */
})

graphState.mutate({
  ...post,
  title: 'Some different title'
})
```

### Unsubscribe
For unsubscribe call returned function from **.subscribe** method,
or use **AbortController**

```jsx

import { createState } from '@graph-state/core'

const abortController = new AbortController()
const graphState = createState({ initialState: {} })

const unsubscribe = graphState.subscribe(userGraph, callback,{
  signal: abortController.signal
})

unsubscribe() 
// or 
abortController.abort()
```

#### Nested graph state

An example above we create nested graph. You can use any nested 
level for your state. Inside state will be created link for graphs.
```yaml
Document
  posts
    post (_id one)
      author (_id someUser)
    post
      author (_id otherUser)
    post
      author (_id someUser) // Same user
```

You can mutate user in one place and him will update in all posts.


## Invalidate
You have few ways to remove graph from state.

- **graphState.invalidate(link: LinkKey)** - remove graph form state
- **graphState.mutate()** - use automatic Garbage Collector

```ts
const state = createState({
  type: 'State',
  initialState: {
    author: {
      _type: 'User',
      _id: 0,
      age: { _type: 'Age', _id: 0, value: 27 },
      skills: ['js', 'ts', { _type: 'Skill', _id: 'Python' }],
    },
  },
});

state.resolve('Age:0') // { _type, _id, value: 27 }
state.resolve('Skill:Python') // { _type, _id, value: 27 }

state.invalidate('Skill:Python')
state.resolve('Skill:Python') // null
state.resolve('User:0').skills // ['js', 'ts']

// Lets use GB
state.mutate('User:0', {
  name: 'Johana'
}, {
  replace: true // replace full graph
})

// Age:0 lost dep from User:0 after mutate
// and GB remove them
state.resolve('Age:0') // null
```

## Garbage collector
GB control links graph by graph. If some graphs have not links
to other graph GB remove them.

```ts
const state = createState({
  type: 'State',
  initialState: {
    author: {
      _type: 'User',
      _id: 0,
      age: { _type: 'Age', _id: 0, value: 27 },
      skills: ['js', 'ts', { _type: 'Skill', _id: 'Python' }],
    },
  },
});

// It will remove Age:0
state.mutate('User:0', {
  age: 'OtherGraph:1'
})

```

## Plugins

```jsx
import { createState } from '@graph-state/core'

const loggerPlugin = (graphState) => {
  graphState.subscribe(nextState => {
    const graphKey = graphState.keyOfEntity(nextState as Entity);

    if (graphKey && !isPartialKey(graphKey)) {
      console.log(`Graph ${entityKey} was updated.`)
    }
  });
}

const graphState = createState({
  plugins: [loggerPlugin]
})

```

You can add override for mutate method.

```ts
import { createState } from '@graph-state/core'

const toUppercase = (_, { mutateOverride }) => {
  mutateOverride((next, ...args) => {
    // next - call for go to next mutate
    // args - arguments from mutate (use getArgumentsForMutate for get safe args)

    const { graphKey, data, options } = state.getArgumentsForMutate(...args)
    next(graphKey, {
      ...data,
      name: data.name.toUpperCase()
    }, options)
  })
}

const graphState = createState({
  plugins: [toUppercase]
})

graphState.mutate({
  name: 'test'
})

graphState.resolve().name // TEST

```

## Skip
Sometimes we need skip recursive iterate and save link on initial data.
```jsx
const Title = <h1>Hello</h1>

const state = createState({
  initialState: {
    jsxNode: Title
  },
  skip: [() => /*check if jsx*/]
})

state.resolve(state).jsxNode === Title // true
```


## Utility 

#### keyOfEntity
```js
graphState.keyOfEntity({
  _type: 'User',
  _id: 'id'
}) // User:id
```

#### entityOfKey
```js
graphState.entityOfKey('User:id')
/**
 * _type: 'User',
 * _id: 'id'
 */
```


#### getArgumentsForMutate
```js
graphState.getArgumentsForMutate('User:id', { name: 'Any' }, {raplace: true})
// graphKey - User:id
// data - { name: 'Any' }
// options - { raplace: true }
```

## Typescript
In case you use TS 5+ everything will work automatically.

```ts
import { createState } from '@graph-state/core'

interface User {
  _type: 'User' // TS version under 5+ add 'as const'
  age: number
}

interface Post {
  _type: 'Post'
  text: string
}


const state = createState<User|Post>({
  initialState: {
    value: 'hello'
  }
})

state.resolve('User:100') // User
state.resolve({_type: 'Post'}) // Post
state.resolve({_type: 'Layer'}) // unknown

state.mutate('User:100', {
  age: 20
  name: 'test' // invalid
})


```

### Types for self store
```ts
interface Instance {
  _type: 'Instance'
  text: string
}

// Need pass Type as second param of generic
const state = createState<Instance, 'Instance'>({
  type: 'Instance',
  id: 200,
  initialState: {
    value: 'hello'
  }
})

state.resolve(state) // Instance
```
