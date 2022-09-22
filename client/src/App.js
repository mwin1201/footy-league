import logo from './logo.svg';
import { 
  ApolloProvider, // React component to provide data to other components
  ApolloClient,  // constructor function to help initialize the connection to the GraphQL API server
  InMemoryCache,  // enables Apollo Client instance to cache API response data - perform requests more efficiently
  createHttpLink  // allows us control over how the Apollo Client makes a request
} from "@apollo/client";
import {BrowserRouter as Router, Link, Route, Routes } from "react-router-dom";

import Homepage from "./pages/Homepage";

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>

    <Router>
      <Routes>
            <Route path="/" element={<Homepage/>}/>
      </Routes>
    </Router>
  );
}

export default App;
