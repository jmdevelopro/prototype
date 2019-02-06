import React from 'react';
import ReactDOM from 'react-dom';

import App from './Components/App';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register'
import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css'
import firebase from './firebase';
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom';

import { createStore } from 'redux';
import { Provider, connect} from 'react-redux';
import { composeWithDevTools} from 'redux-devtools-extension';
import rootReducer from './reducers';
import { setUser} from './actions';
import Spinnner from './Spinner';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {

componentDidMount(){
    firebase.auth().onAuthStateChanged(user =>{
        if(user){

            this.props.setUser(user);
            this.props.history.push('/');

        }
    })
}



  render(){
return this.props.isLoading? <Spinnner></Spinnner>:(

  
      <Switch>
            <Route path='/login' component={Login}></Route>
            <Route path='/register' component={Register}/>
            <Route path="/" component={App}></Route>
        </Switch>
 

);
}}

const mapStateFromProps = state =>({
    isLoading: state.user.isLoading
});

const RootWithAuth = withRouter(connect(null, {setUser})(Root));


ReactDOM.render(
    <Provider store={store}>
        <Router>
            <RootWithAuth />
        </Router>
    </Provider>
    , document.getElementById('root'));
registerServiceWorker();
