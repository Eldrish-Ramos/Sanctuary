import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShrineBuilder from './pages/ShrineBuilder';
// import ExplorePage from './pages/ExplorePage';
// import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow app-main-content">
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/shrine-builder" component={ShrineBuilder} />
          </Switch>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;