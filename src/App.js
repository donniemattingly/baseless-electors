import React from 'react';
import StatePicker from "./StatePicker";
import SignIn from "./SignIn";
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";
import {Scoreboard} from "./Scoreboard";

export const AuthContext = React.createContext({signedIn: false});
const App = () => {
    return (
        <AuthContext.Provider value={{signedIn: false}}>
            <Router>
                <Switch>
                    <Route exact path='/picks'>
                        <StatePicker numPicks={10}/>
                    </Route>
                    <Route exact path='/'>
                        <SignIn/>
                    </Route>
                    <Route path='/scoreboard'>
                        <Scoreboard/>
                    </Route>
                </Switch>
            </Router>
        </AuthContext.Provider>
    )
}

export default App;