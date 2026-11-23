import { useRoute } from './lib/router'
import { Layout } from './components/Layout'
import { Home } from './views/Home'
import { Setup } from './views/Setup'
import { Exam } from './views/Exam'
import { Results } from './views/Results'
import { Review } from './views/Review'
import { StudyRun } from './views/Study'
import { Weak } from './views/Weak'

export default function App() {
  const { path, params } = useRoute()
  let view
  switch (path) {
    case '/setup': view = <Setup mode="exam" />; break
    case '/exam': view = <Exam />; break
    case '/results': view = <Results id={params.get('id')} />; break
    case '/review': view = <Review id={params.get('id')} initial={params.get('filter')} />; break
    case '/study': view = <Setup key="study" mode="study" />; break
    case '/study/run': view = <StudyRun />; break
    case '/weak': view = <Weak />; break
    default: view = <Home />
  }
  return <Layout path={path} focus={path === '/exam'}>{view}</Layout>
}
