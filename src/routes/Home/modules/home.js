import Promise from 'bluebird';

export const INIT = 'INIT';
export const INITIALIZED = 'INITIALIZED';
export const LOGIN = 'LOGIN';
export const LOGGED_IN = 'LOGIN';
export const TODO_ADDING = 'TODO_ADDING';
export const TODO_ADDED = 'TODO_ADDED';
export const TODO_REMOVING = 'TODO_REMOVING';
export const TODO_REMOVED = 'TODO_REMOVED';


class Request {
  constructor(relativePath) {
    this.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    this.path = relativePath;
    this.method = 'GET';
  }
  post(data) {
    this.method = 'POST';
    this.postData = data;
    return this;
  }
  delete() {
    this.method = 'DELETE'
    return this;
  }
  authenticated(token) {
    this.headers['X-Auth-Token'] = token;
    return this;
  }
  then(...args) {
    return this.exec().then(...args);
  }
  exec() {
    return fetch(`/db${this.path || '/'}`, {
      method: this.method,
      headers: this.headers,
      body: this.method === 'POST' ? JSON.stringify(this.postData) : undefined
    })
  }
}
const request = relPath => new Request(relPath);

// ------------------------------------
// Action Handlers
// ------------------------------------

const ACTION_HANDLERS = {
  [INIT]: state => Object.assign({}, state, {initializing: true}),
  [LOGIN]: state => Object.assign({}, state, {loggedIn: false}),
  [LOGGED_IN]: (state, action) => Object.assign({}, state, {loggedIn: true, token: action.payload}),
  [INITIALIZED](state, action) {
    return Object.assign({}, state, {
      initializing: false,
      todos: action.payload
    })
  },
  [TODO_ADDING]: (state) => Object.assign({}, state, {todoAdding: true}),
  [TODO_ADDED]: (state, action) => Object.assign({}, state, {todoAdding: false, todos: state.todos.concat([action.payload])}),
  [TODO_REMOVING]: (state, action) => ({...state, todoRemoving: state.todoRemoving.concat([action.payload])}),
  [TODO_REMOVED]: (state, action) => (console.warn(action, state.todos.filter(todo => console.warn(todo.id, action.payload) || todo.id !== action.payload)) || {
    ...state,
    todoRemoving: state.todoRemoving.filter(id => id !== action.payload),
    todos: state.todos.filter(todo => todo.id !== action.payload)
  })
};

export const init = () => {
  return (dispatch, getState) => {
    dispatch({type: INIT});
    dispatch({type: LOGIN});
    return request('/login').post({
      username: 'admin',
      password: 'admin'
    }).then(response => {
      const token = response.json().token;
      dispatch({
        type: LOGGED_IN,
        payload: token
      });
      return request('/').authenticated(token).then(r => r.json()).then(initialTodos => {
        return Promise.all(initialTodos.map(id => request(`/${id}`).authenticated(token).exec().then(r => r.json()).then(todo => {
          return {...todo, id};
        }))).then(todos => {
          dispatch({type: INITIALIZED, payload: todos});
        });

      })
    }).catch(e => console.error(e));
  }
};

export const newTodo = (todo) => {
  return (dispatch, getState) => {
    dispatch({type: TODO_ADDING});
    return request('/').post(todo).authenticated(getState().token).then(r => r.json()).then(id => {
      dispatch({type: TODO_ADDED, payload: {...todo, id}});
    }).catch(e => console.error(e));
  }
};

export const removeTodo = (id) => {
  return (dispatch, getState) => {
    dispatch({type: TODO_REMOVING, payload: id});
    return request(`/${id}`).delete().authenticated(getState().token).then(r => r.json()).then(_ => {
      dispatch({type: TODO_REMOVED, payload: id});
    }).catch(e => console.error(e));
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  initializing: true,
  loggedIn: false,
  todos: [],
  todoAdding: false,
  todoRemoving: []
};
export default function reducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state
}
