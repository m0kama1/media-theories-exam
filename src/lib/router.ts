import { useEffect, useState } from 'react'

export interface Route {
  path: string
  params: URLSearchParams
}

function parse(): Route {
  const h = window.location.hash.replace(/^#/, '') || '/'
  const [path, qs] = h.split('?')
  return { path: path || '/', params: new URLSearchParams(qs ?? '') }
}

export function navigate(to: string) {
  if (window.location.hash !== '#' + to) window.location.hash = to
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
