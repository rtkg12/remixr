import { hot } from 'react-hot-loader';
import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Layout } from 'antd';
import ReactGA from 'react-ga';

import Home from './components/Home';
import Playlist from './components/Playlists';
import Results from './components/Results';
import Footer from './components/Footer';

import './App.less';

import {createBrowserHistory} from 'history';

const { Content } = Layout;

ReactGA.initialize(process.env.REACT_APP_TRACKING_ID);
const history = createBrowserHistory();

function App() {
  return (
    <div className="body">
      <Router history={history}>
        <Route exact path="/" component={Home} />
        <Layout>
          <Content style={{ width: '90%', margin: 'auto', height: '100%', marginBottom: '2em' }}>
            <Route path="/playlists" component={Playlist} />
            <Route path="/results" component={Results} />
          </Content>
          <Footer />
        </Layout>
      </Router>
    </div>
  );
}

export default hot(module)(App);
