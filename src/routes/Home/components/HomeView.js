import React from 'react'
import classes from './HomeView.scss'
import Loader from 'react-loader';

import { Table, Column, Cell } from 'fixed-data-table';

const initialForm = {
  newTodoName: '',
  newTodoDescription: ''
};

export class HomeView extends React.Component {
  constructor() {
    super();
    this.state = initialForm;
  }
  componentWillMount() {
    this.props.init();
  }
  newTodo(e) {
    e.preventDefault();
    const { newTodoName: name, newTodoDescription: description } = this.state;
    this.props.newTodo({name, description});
    this.setState(initialForm);
  }
  render() {
    const todos = this.props.todos.filter(todo => todo.name || todo.description); // as they don't being deleted from concord let's 'emulate' it
    return <div>
      <h2>Todos</h2>
      <div>
        <h4>Add todo</h4>
        <Loader loaded={!this.props.todoAdding}>
          <form onSubmit={this.newTodo.bind(this)}>
            <div className="form-group">
              <label for="name">Name</label>
              <input value={this.state.newTodoName} onChange={e => this.setState({
              newTodoName: e.target.value
            })} type="text" className="form-control" id="name" placeholder="Item name"/>
            </div>
            <div className="form-group">
              <label for="description">Description</label>
              <input value={this.state.newTodoDescription} onChange={e => this.setState({
              newTodoDescription: e.target.value
            })} type="text" className="form-control" id="description" placeholder="Item description"/>
            </div>
            <button type="submit" className="btn btn-default">Create</button>
          </form>
        </Loader>

      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Desc</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
        {todos.map(todo => <tr>
          <td>{todo.name}</td>
          <td>{todo.description}</td>
          <td>
            <Loader loaded={this.props.todoRemoving.indexOf(todo.id) === -1}>
              <button className="btn btn-danger" onClick={() => this.props.removeTodo(todo.id)}>Remove</button>
            </Loader>
          </td>
        </tr>)}
        </tbody>
      </table>
    </div>;
  }
}

HomeView.propTypes = {
  init: React.PropTypes.func.isRequired,
  newTodo: React.PropTypes.func.isRequired,
  removeTodo: React.PropTypes.func.isRequired,
  initializing: React.PropTypes.bool.isRequired,
  loggedIn: React.PropTypes.bool.isRequired,
  todoAdding: React.PropTypes.bool.isRequired,
  todos: React.PropTypes.array.isRequired,
  todoRemoving: React.PropTypes.array.isRequired
}

export default HomeView
