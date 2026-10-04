import { Layout } from './components/Layout'
import { Overlays } from './components/Overlays'
import { About } from './pages/About'
import { BlogIndex, BlogPostPage } from './pages/Blog'
import { Catalog, ExamsIndex } from './pages/Catalog'
import { Checkout, OrderDemo } from './pages/Checkout'
import { Collection } from './pages/Collection'
import { Free } from './pages/Free'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ProductDetail } from './pages/ProductDetail'
import { Support } from './pages/Support'
import { splitPath, useRouter } from './lib/router'

function Route() {
  const { path } = useRouter()
  const [a, b] = splitPath(path).segments
  switch (a) {
    case undefined:
      return <Home />
    case 'materials':
      return b ? <ProductDetail key={b} slug={b} /> : <Catalog />
    case 'exams':
      return b ? <Collection key={b} slug={b} /> : <ExamsIndex />
    case 'free':
      return <Free />
    case 'blog':
      return b ? <BlogPostPage key={b} slug={b} /> : <BlogIndex />
    case 'checkout':
      return <Checkout />
    case 'order':
      return <OrderDemo />
    case 'about':
      return <About />
    case 'support':
      return <Support />
    default:
      return <NotFound />
  }
}

export function App() {
  return (
    <Layout>
      <Route />
      <Overlays />
    </Layout>
  )
}
