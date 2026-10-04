import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

// Demo cart + demo session. Lives in memory (optionally mirrored to localStorage).
// No orders, payments, emails or customer records are created anywhere.

export type License = 'personal'

export interface CartLine {
  productId: string
  license: License
}

export type DemoDialog =
  | { kind: 'free-claim'; productId: string }
  | { kind: 'sample'; productId: string }
  | { kind: 'academy'; productId?: string }
  | null

interface StoreValue {
  cart: CartLine[]
  add: (productId: string) => void
  remove: (productId: string) => void
  clear: () => void
  has: (productId: string) => boolean
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
  dialog: DemoDialog
  openDialog: (d: DemoDialog) => void
  demoEmail: string | null
  setDemoEmail: (e: string | null) => void
  library: string[]
  addToLibrary: (ids: string[]) => void
}

const KEY = 'jy-proto-cart'
const StoreContext = createContext<StoreValue | null>(null)

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartLine[]) : []
  } catch {
    return []
  }
}

function save(c: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* storage unavailable */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(load)
  const [cartOpen, setCartOpen] = useState(false)
  const [dialog, openDialog] = useState<DemoDialog>(null)
  const [demoEmail, setDemoEmail] = useState<string | null>(null)
  const [library, setLibrary] = useState<string[]>([])

  const update = useCallback((fn: (c: CartLine[]) => CartLine[]) => {
    setCart((prev) => {
      const next = fn(prev)
      save(next)
      return next
    })
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      add: (id) => update((c) => (c.some((l) => l.productId === id) ? c : [...c, { productId: id, license: 'personal' }])),
      remove: (id) => update((c) => c.filter((l) => l.productId !== id)),
      clear: () => update(() => []),
      has: (id) => cart.some((l) => l.productId === id),
      cartOpen,
      setCartOpen,
      dialog,
      openDialog,
      demoEmail,
      setDemoEmail,
      library,
      addToLibrary: (ids) => setLibrary((l) => [...new Set([...l, ...ids])]),
    }),
    [cart, cartOpen, dialog, demoEmail, library, update],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const v = useContext(StoreContext)
  if (!v) throw new Error('useStore outside StoreProvider')
  return v
}
