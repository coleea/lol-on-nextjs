import { useEffect, useLayoutEffect } from 'react';
import { RecoilRoot } from 'recoil';
import css from '../components/App.module.scss';
import Header from '../components/Header.jsx';
import UserHeader from '../components/UserHeader.jsx';
import UserMain from '../components/UserMain.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import fetch from 'node-fetch';
import { useRecoilState } from 'recoil'

import {basicInfoAtom, mostInfoAtom, matchesAtom, 
    userHeaderInfoAtom, userSidebarInfoAtom, latest20SummaryInfoAtom, matchHistoryDetailInfoAtom} from '../recoil/summonerInfo'

const l = console.log 

const INITIAL_USER_QUERY          = 'Hello User'
const URL_TEMPLATE_BASIC_INFO     = `https://codingtest.op.gg/api/summoner/USERNAME`
const URL_TEMPLATE_MOST_INFO      = `https://codingtest.op.gg/api/summoner/USERNAME/mostInfo`
const URL_TEMPLATE_MATCHES        = `https://codingtest.op.gg/api/summoner/USERNAME/matches`
const URL_TEMPLATE_MATCH_DETAILS  = `https://codingtest.op.gg/api/summoner/USERNAME/matchDetail/`
const URL_BASE_FOR_AUTOCOMPLETE   = `https://raw.githubusercontent.com/coleea/lol-src/master/api/autocomplete_fake.json`;

function App({userHeaderInfo,
                sidebarInfo,
                latest20SummaryInfo,
                matchHistoryDetailInfo }) {
  
  const [__, setUserHeaderInfo]  = useRecoilState(userHeaderInfoAtom)
  const [_, setUserSidebarInfo]  = useRecoilState(userSidebarInfoAtom)
  const [___, setLatest20SummaryInfo]  = useRecoilState(latest20SummaryInfoAtom)
  const [____, setMatchHistoryDetailInfo]  = useRecoilState(matchHistoryDetailInfoAtom)    
  
  // setUserHeaderInfo()
  // l('setUserHeaderInfo 실행직전')

  setUserHeaderInfo(userHeaderInfo)
  setUserSidebarInfo(sidebarInfo)
  setLatest20SummaryInfo(latest20SummaryInfo)  
  setMatchHistoryDetailInfo(matchHistoryDetailInfo)
  /* 
  useLayoutEffect(()=> {
    setUserHeaderInfo(userHeaderInfo)
    setUserSidebarInfo(sidebarInfo)
    setLatest20SummaryInfo(latest20SummaryInfo)  
    setMatchHistoryDetailInfo(matchHistoryDetailInfo)
  }, [])
   */

  const initLocalStorage = _ => {

    if (typeof window !== 'undefined') {
        localStorage.queryHistory = localStorage.queryHistory || '[]' 
        localStorage.favoriteUsers = localStorage.favoriteUsers || '[]'
    }    
  }
  
  useEffect(() => {
    initLocalStorage()
  }, [])

  return (
    <>
            <div id={css.app}>
                <Header/>
                  <div id={css.body} >
                    <UserHeader/>
                    <div id={css.main}>
                      <UserSidebar/>
                      <UserMain/>
                    </div>      
                  </div>    
            </div>
    </>
  );
}

export default App;

async function getDataAndSetState(USER_QUERY) {

  const URL_BASIC_INFO = URL_TEMPLATE_BASIC_INFO.replace('USERNAME', USER_QUERY)
  const URL_MOST_INFO  = URL_TEMPLATE_MOST_INFO .replace('USERNAME', USER_QUERY)
  const URL_MATCHES    = URL_TEMPLATE_MATCHES   .replace('USERNAME', USER_QUERY)
  
  const [basicInfo, mostInfo, matches] = await Promise.all([
      fetch(URL_BASIC_INFO).then(r => r.json()),
      fetch(URL_MOST_INFO).then(r => r.json()),
      fetch(URL_MATCHES).then(r => r.json()),
  ])        
  
  // l('basicInfo', basicInfo)

  const userHeaderInfo = {
      username : basicInfo.summoner.name.replace(/[\\+]/g,' '),
      profileImageUrl: basicInfo.summoner.profileImageUrl,
      profileBackgroundImageUrl: basicInfo.summoner.profileBackgroundImageUrl,
      profileBorderImageUrl : basicInfo.summoner.profileBorderImageUrl,
      level : basicInfo.summoner.level,
      ladderRank : basicInfo.summoner.ladderRank.rank,
      rankPercentage : basicInfo.summoner.ladderRank.rankPercentOfTop,
      prevTiers : basicInfo.summoner.previousTiers
  }

  const sidebarInfo = {
      solRank : basicInfo.summoner.leagues[0],
      _5on5Rank : basicInfo.summoner.leagues[1],
      winRatioFreeSeason : mostInfo.champions,
      winRatio7Days : mostInfo.recentWinRate,
  }

  const latest20SummaryInfo = {
      totalMatch :  Number(matches.summary.wins)  + Number(matches.summary.losses) ,
      wins : matches.summary.wins,
      losses : matches.summary.losses,
      kills: matches.summary.kills,
      deaths: matches.summary.deaths,
      assists: matches.summary.assists,
      kda : matches.summary.deaths === 0 ?
          (matches.summary.kills + matches.summary.assists) * 1.2
          : (matches.summary.kills + matches.summary.assists) / matches.summary.deaths,        
      positions : matches.positions,
      champions : matches.champions,
  }

  // setUserHeaderInfo(userHeaderInfo)
  // setUserSidebarInfo(sidebarInfo)
  // setLatest20SummaryInfo(latest20SummaryInfo)
  
  const matchHistoryDetailInfo = await requestMatchHistoryDetail({USER_QUERY, matches})
  // setMatchHistoryDetailInfo(matchHistoryDetailInfo)
  // l('1', matchHistoryDetailInfo)

  return {
    userHeaderInfo,
    sidebarInfo,
    latest20SummaryInfo,
    matchHistoryDetailInfo
  }
}

const requestMatchHistoryDetail = async ({USER_QUERY, matches}) => {

  const matchDetailList = await Promise.all(
      matches.games.map((v, i) => {
          const URL = URL_TEMPLATE_MATCH_DETAILS.replace('USERNAME', USER_QUERY) + v.gameId
          return fetch(URL).then(r => r.json())            
      })
  )        

  const gameDetailInfosById = {}

  for (const obj of matchDetailList) {
      gameDetailInfosById[obj.gameId] = obj.teams
  }

  for (const game of matches.games) {
      const detailInfos = gameDetailInfosById[game.gameId]
      game.detailInfos = {
          red : detailInfos[0],
          blue : detailInfos[1],
      }
  }

  const matchHistoryDetailInfo = {
      games : matches.games,
  }
  return matchHistoryDetailInfo
}

export async function getStaticProps(context) {
  l('i am in getStaticProps')

  // const urlParams = new URLSearchParams(location.search) 
  // const username = urlParams.get('user')
  const username = 'hello user'

  
  const {
    userHeaderInfo,
    sidebarInfo,
    latest20SummaryInfo,
    matchHistoryDetailInfo
  } = await getDataAndSetState(username) 
   

  // const a = await getDataAndSetState(username) 

  // l('aaa', a)
  // l({userHeaderInfo}, {sidebarInfo}, {latest20SummaryInfo}, {matchHistoryDetailInfo})
  /* 
  if(username){
      // const queryHistoryArrRenewed = saveQueryToDB(username)
      // setQueryHistory(queryHistoryArrRenewed)
  } else {
      getDataAndSetState(INITIAL_USER_QUERY)
  }
 */

  return {
    props: {
      userHeaderInfo,
      sidebarInfo,
      latest20SummaryInfo,
      matchHistoryDetailInfo
    }, // will be passed to the page component as props
  }
}