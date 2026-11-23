import { useEffect } from 'react'
import { navigate, useRoute } from './lib/router'
import { Layout } from './components/Layout'
import { Home } from './views/Home'
import { Exam } from './views/Exam'
import { Results } from './views/Results'

export default function App() {
  const { path, params } = useRoute()
  const known = ['/', '/exam', '/results'].includes(path)
  useEffect(() => {
    // Old links (/review, /setup, /study, /weak) fall back gracefully.
    if (path === '/review' && params.get('id')) navigate(`/results?id=${params.get('id')}`)
    else if (!known) navigate('/')
  }, [path, params, known])

  let view
  if (path === '/exam') view = <Exam />
  else if (path === '/results') view = <Results id={params.get('id')} />
  else view = <Home />
  return <Layout focus={path === '/exam'}>{view}</Layout>
}
