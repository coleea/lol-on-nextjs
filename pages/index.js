import { useEffect,  } from 'react';
import { RecoilRoot } from 'recoil';
import css from '../components/App.module.scss';
import Header from '../components/Header.jsx';
import UserHeader from '../components/UserHeader.jsx';
import UserMain from '../components/UserMain.jsx';
import UserSidebar from '../components/UserSidebar.jsx';

const l = console.log 

function App() {
  
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
        <RecoilRoot>        
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
        </RecoilRoot>
    </>
  );
}

export default App;

export async function getStaticProps(context) {
  l('i am in getStaticProps')
  return {
    props: {}, // will be passed to the page component as props
  }
}