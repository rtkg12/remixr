import React from 'react';
import { Layout} from 'antd';

import Home from "./components/Home";
import Playlist from "./components/Playlists";
import Results from "./components/Results";
import Footer from "./components/Footer";

import "./App.less";

import {
    Route,
    HashRouter
} from "react-router-dom";

const { Content } = Layout;

function App() {
  return (
      <div className="body">
          <HashRouter>
              <Route exact path="/" component={Home}/>

              <Layout>
                  <Content
                      style={{ width: '90%', margin: 'auto', height: "100%", marginBottom: "2em" }}
                  >
                      <Route path="/playlists" component={Playlist}/>
                      <Route path="/results" component={Results}/>
                  </Content>

                  <Footer/>
              </Layout>
          </HashRouter>
      </div>

  );
}

export default App;
