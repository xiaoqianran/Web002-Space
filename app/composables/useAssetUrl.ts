import { joinURL } from 'ufo'

export function useAssetUrl() {
  const config = useRuntimeConfig()
  return (path: string) => joinURL(config.app.baseURL, path)
}
