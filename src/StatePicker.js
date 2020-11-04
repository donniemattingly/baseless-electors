import React, {useEffect, useState} from "react";
import USAMap from "react-usa-map";
import {pickOptions} from "./pickOptions";
import firebase from "firebase";
import { useHistory } from "react-router-dom";
import styled from 'styled-components';

/* mandatory */
const mapHandler = (event) => {
    console.log(event);
};

/* optional customization of filling per state and calling custom callbacks per state */
const statesCustomConfig = {
    "NJ": {
        fill: "navy",
        clickHandler: (event) => console.log('Custom handler for NJ', event.target.dataset.name)
    },
    "NY": {
        fill: "#CC0000"
    }
}

const usePicks = () => {
}

export const makeColors = (picks) => {
    return Object.keys(pickOptions).reduce((acc, val) => {
        let color;
        if (picks[val]) {
            color = picks[val] === 'biden' ? 'blue' : 'red';
        } else {
            color = '#D3D3D3';
        }

        return {...acc, [val]: {fill: color}}
    }, {});
}



const PicksContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 10px;
  text-transform: capitalize;
`

const SavedMessage = styled.span`
  color: darkgreen;
  background-color: lightgreen;
`

const StatePicker = ({numPicks}) => {
    const [picks, setPicks] = useState({});
    const [saved, setSaved] = useState(false);
    const [user, setUser] = useState({});
    const history = useHistory();
    const savePicks = (picks) => {
        const user = firebase.auth().currentUser;
        if(!user.uid){
            return
        }

        firebase.firestore().collection("picks").doc(user.uid).set(
            {
                picks,
                user: {
                    name: user.displayName,
                    email: user.email,
                }
            }
        )
            .then(function() {
                setSaved(true);
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
    }

    useEffect(() => {
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                firebase.firestore().collection('picks').doc(user.uid).get().then((doc) => {
                    if(doc.exists){
                        setPicks(doc.data().picks)
                    }
                })
                setUser(user);
            } else {
                history.push('/')
            }
        });
    }, [user])

    const handler = (event) => {
        const state = event.target.dataset.name;
        const canAddPicks = numPicks > (Object.values(picks).filter(v => v).length)
        if (picks[state]) {
            if (picks[state] === 'biden') {
                setPicks({...picks, [state]: 'trump'})
            } else {
                setPicks({...picks, [state]: null})
            }
        } else {
            if(canAddPicks){
                setPicks({...picks, [state]: 'biden'})
            }
        }
    };

    const summary = getPicksSummary(picks);

    return (
        <div className="App">

            <div>
                <h1> Picks </h1> Points possible: {summary.total} Picks Remaining: {numPicks - summary.count}
            </div>
            <br/>
            <div>
                Select the winner for up to 10 states, if the person you select wins that state, you'll get the points
                indicated. The less likely an outcome is, the more points you get. Blue indicates a pick for Biden and red
                indicates a pick for Trump.
            </div>
            <br/>
            <div>
                $20 to me, winner takes the entire pool. The points are the inverse of 538's, so you should use <a href="https://projects.fivethirtyeight.com/2020-election-forecast/?cid=rrpromo"> their website </a>
                for research, as it's much easier to use.
            </div>
            <br/>
            <PicksContainer>
                {Object.entries(picks).filter(([k, v]) => v).map(([p, v]) => <div> {p} {v} {pickOptions[p][v]} </div>)}
            </PicksContainer>
            {saved && <SavedMessage> Your picks were saved! </SavedMessage>}
            <USAMap customize={makeColors(picks)} onClick={handler}/>
            <button onClick={() => savePicks(picks)}> Submit </button>
        </div>
    );
}

const getPicksSummary = (picks) => {
    return {
        total: Object.entries(picks).filter(([k, v]) => v).map(([p, v]) => pickOptions[p][v]).reduce((a, b) => a + b, 0),
        count: Object.values(picks).filter(v => v).length
    }
}

export default StatePicker;