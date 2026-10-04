// Packs dist/ into one self-contained HTML file for sharing as a claude.ai Artifact
// (or opening straight from disk). JS and CSS are inlined; only Google Fonts stay external.
// The artifact host supplies <!doctype>/<html>/<head>/<body>, so those wrappers are stripped.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
let html = readFileSync(join(dist, 'index.html'), 'utf8')

const cssHref = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/)
const jsSrc = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/)
if (!cssHref || !jsSrc) throw new Error('Could not find built CSS/JS references in dist/index.html')

const css = readFileSync(join(dist, cssHref[1]), 'utf8')
const js = readFileSync(join(dist, jsSrc[1]), 'utf8').replace(/<\/script/gi, '<\\/script')

html = html.replace(cssHref[0], () => `<style>\n${css}\n</style>`).replace(jsSrc[0], '')

const title = html.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? '<title>지영랩 JIYOUNGLAB</title>'
const headInner = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ''
const bodyInner = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? ''
const headRest = headInner
  .replace(title, '')
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')

const out = `${title}\n${headRest.trim()}\n${bodyInner.trim()}\n<script type="module">\n${js}\n</script>\n`

mkdirSync('artifact', { recursive: true })
writeFileSync('artifact/jiyounglab-prototype.html', out)

// A standalone copy that opens directly from disk (double-click) with a full document shell.
const standalone = `<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n${title}\n${headRest.trim()}\n</head>\n<body>\n${bodyInner.trim()}\n<script type="module">\n${js}\n</script>\n</body>\n</html>\n`
writeFileSync('artifact/jiyounglab-prototype.standalone.html', standalone)

console.log(`artifact/jiyounglab-prototype.html  ${(out.length / 1024).toFixed(0)} KB`)
