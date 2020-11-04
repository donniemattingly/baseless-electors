import styled from 'styled-components';
import firebase from "firebase";
import {useEffect, useState} from "react";
import {pickOptions} from "./pickOptions";
import {Fragment} from 'react';
import USAMap from "react-usa-map";
import {makeColors} from "./StatePicker";

const ScoreboardContainer = styled.div`
  margin: auto;
`

const ScoresContainer = styled.div`

`

const ScoreContainer = styled.tr`

`

const ScoresTable = styled.table`
  margin: auto;
  text-align: right;
  max-width: 500px;
  min-width: 100%;
`

const getPossiblePoints = (picks, results) => {
    return Object.entries(picks)
        .filter(([state, choice]) => choice)
        .filter(([state, choice]) => !results[state])
        .map(([state, choice]) => pickOptions[state][choice])
        .reduce((a, b) => a + b);
}

const getActualScore = (picks, results) => {
    return Object.entries(picks)
        .filter(([state, choice]) => choice)
        .map(([state, choice]) => results[state] === choice ? pickOptions[state][choice] : 0)
        .reduce((a, b) => a + b)
}

const getBrianScore = (picks, results) => {
    return Object.entries(picks)
        .filter(([state, choice]) => choice)
        .map(([state, choice]) => results[state] === choice ? pickOptions[state][choice] : 0)
        .reduce((a, b) => a + b)
}

const ScoreRow = ({user, picks, results, brian}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <Fragment>
            <ScoreContainer className="scoreboard-entry" onClick={() => setExpanded(!expanded)}>
                <td>
                    {user.name}
                </td>
                <td>
                    {getPossiblePoints(picks, results)}
                </td>
                <td>
                    {getPossiblePoints(picks, brian)}
                </td>
                <td>
                    {getBrianScore(picks, brian)}
                </td>
                <td>
                    {getActualScore(picks, results)}
                </td>
            </ScoreContainer>
            {expanded && <ScoreboardMap height={400} picks={picks}/>}
        </Fragment>
    )
}

const ScoreboardMap = ({picks}) => {
    return (
        <tr>
            <td colSpan='5' className="state-container">
                <USAMap customize={makeColors(picks)}/>
            </td>
        </tr>
    )
}


// const sortPicks = (picks, results) => {
//     return picks.sort((a, b) => {
//         const aReal = getActualScore(a.picks, results);
//         const bReal = getActualScore(b.picks, results);
//
//         const
//     })
// }

export const Scoreboard = () => {
    const [picks, setPicks] = useState(null);
    const [results, setResults] = useState(null);
    const [brian, setBrian] = useState(null);

    useEffect(async () => {
        const snapshot = await firebase.firestore().collection('picks').get()
        snapshot.docs.map(doc => console.log(doc.data()));

        const results = snapshot.docs.find(d => d.id === 'results');
        setResults(results.data());

        const brian = snapshot.docs.find(d => d.id === 'brian');
        setBrian({...results, ...brian.data()});

        const picks = snapshot.docs.filter(doc => doc.id !== 'results' && doc.id !== 'brian').map(doc => doc.data())
        setPicks(picks);
    }, [])

    console.log('picks', picks);
    console.log('results', results);

    return (
        <ScoreboardContainer>
            <h1> Scoreboard </h1>
            <ScoresTable>
                <tr className="table-header">
                    <th> Name</th>
                    <th> Possible</th>
                    <th> BrianBot®<br />Remaining</th>
                    <th> BrianBot ®</th>
                    <th> Score</th>
                </tr>
                {picks && picks.map(pick => <ScoreRow user={pick.user} picks={pick.picks} brian={brian} results={results}/>)}
            </ScoresTable>
        </ScoreboardContainer>
    )
}