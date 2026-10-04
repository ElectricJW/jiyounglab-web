import { createContext, useCallback, useContext, useEffect, useState, type ReactNode, type MouseEvent } from 'react'

// Hash router with an in-memory fallback. Hash URLs keep the build fully static (any host,
// file://, or the single-file artifact); if the frame refuses hash writes, state still works.

interface RouterValue {
  path: string
  navigate: (to: string) => void
}

const RouterContext = createContext<RouterValue>({ path: '/', navigate: () => {} })

function readHash(): string {
  try {
    const h = window.location.hash
    if (h.startsWith('#/')) return h.slice(1)
  } catch {
    /* ignore */
  }
  return '/'
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(readHash)

  useEffect(() => {
    const onHash = () => {
      // Only route-shaped hashes (#/…) navigate; plain anchors like #main are left alone.
      if (window.location.hash.startsWith('#/')) setPath(readHash())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((to: string) => {
    setPath(to)
    try {
      if (window.location.hash !== '#' + to) window.location.hash = to
    } catch {
      /* in-memory only */
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

export const useRouter = () => useContext(RouterContext)

export function Link({
  to,
  className,
  children,
  onClick,
  ...rest
}: { to: string; className?: string; children: ReactNode; onClick?: () => void } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'onClick'
>) {
  const { navigate } = useRouter()
  return (
    <a
      href={'#' + to}
      className={className}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        onClick?.()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

export function splitPath(path: string): { segments: string[]; query: URLSearchParams } {
  const [p, q = ''] = path.split('?')
  return { segments: p.split('/').filter(Boolean), query: new URLSearchParams(q) }
}
