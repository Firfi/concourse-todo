import { connect } from 'react-redux'
import { init, newTodo, removeTodo } from '../modules/home'

import Home from '../components/HomeView'


const mapActionCreators = {
  init, newTodo, removeTodo
};

const mapStateToProps = (state) => state.home;

export default connect(mapStateToProps, mapActionCreators)(Home)
