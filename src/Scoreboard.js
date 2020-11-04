import styled from 'styled-components';
import firebase from "firebase";
import {useEffect, useState} from "react";
import {pickOptions} from "./pickOptions";
import {Fragment} from 'react';
import USAMap from "react-usa-map";
import {makeColors} from "./StatePicker";

const ScoreboardContainer = styled.div`
  margin: auto;
  padding: 40px;
  background: #ffffff;
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
        .reduce((a, b) => a + b, 0);
}

const getActualScore = (picks, results) => {
    return Object.entries(picks)
        .filter(([state, choice]) => choice)
        .map(([state, choice]) => results[state] === choice ? pickOptions[state][choice] : 0)
        .reduce((a, b) => a + b, 0)
}

const getBrianScore = (picks, results) => {
    return Object.entries(picks)
        .filter(([state, choice]) => choice)
        .map(([state, choice]) => results[state] === choice ? pickOptions[state][choice] : 0)
        .reduce((a, b) => a + b, 0)
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


const sortPicks = (picks, results, scoreFn) => {
    console.log('sorting!', results);

    picks.sort((a, b) => {
        const aReal = scoreFn(a.picks, results);
        const bReal = scoreFn(b.picks, results);

        return bReal - aReal
    })

    console.log(picks);

    return picks;
}

export const Scoreboard = () => {
    const [picks, setPicks] = useState([]);
    const [results, setResults] = useState(null);
    const [brian, setBrian] = useState(null);
    const [sortingResults, setSortingResults] = useState(null);
    const [sortingFunction, setSortingFunction] = useState('getActualScore');

    const fnMap = {
        'getActualScore': getActualScore,
        'getPossiblePoints': getPossiblePoints
    }

    console.log('Rendered!', sortingFunction, sortingResults);

    useEffect(async () => {
        const snapshot = await firebase.firestore().collection('picks').get()
        snapshot.docs.map(doc => console.log(doc.data()));

        const results = snapshot.docs.find(d => d.id === 'results');
        setResults(results.data());

        const brian = snapshot.docs.find(d => d.id === 'brian');
        setBrian({...results, ...brian.data()});

        const picks = snapshot.docs.filter(doc => doc.id !== 'results' && doc.id !== 'brian').map(doc => doc.data())
        setPicks(picks);

        console.log('Loading')
    }, [])

    const setSorting = (results, sortFn) => {
        setSortingResults({...results});
        setSortingFunction(sortFn);
    }

    const renderedPicks = sortPicks(picks, sortingResults || results, null || fnMap[sortingFunction])

    return (
        <ScoreboardContainer>
            <h1> Scoreboard <span className="scoreboard-year">2020</span></h1>
            <ScoresTable>
                <tr className="table-header">
                    <th className="table-header-name"> Name</th>
                    <th onClick={() => setSorting(results, 'getPossiblePoints')}> Possible</th>
                    <th onClick={() => setSorting(brian, 'getPossiblePoints')}> BrianBot®<br/>Remaining</th>
                    <th onClick={() => setSorting(brian, 'getActualScore')}> BrianBot ®</th>
                    <th onClick={() => setSorting(results, 'getActualScore')}> Score</th>
                </tr>
                {renderedPicks && renderedPicks.map(pick => <ScoreRow key={pick.user.email} user={pick.user}
                                                                      picks={pick.picks} brian={brian}
                                                                      results={results}/>)}
            </ScoresTable>

            {results && <h1> Official Results </h1>}
            {results && <ScoreboardMap picks={results}/>}

            {brian && <h1> BrianBot ® Projections</h1>}
            {brian && <ScoreboardMap picks={{...results, ...brian}}/>}
        </ScoreboardContainer>
    )
}