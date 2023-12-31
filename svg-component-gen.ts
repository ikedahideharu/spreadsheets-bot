import * as child_process from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import appRootPath from 'app-root-path'
import { outputFileSync } from 'fs-extra'

type Filter = (value: string, index: number, dir: string) => boolean

type FsReaddirRecursive = (root: string, filter?: Filter, files?: string[], prefix?: string) => string[]

export const fsReaddirRecursive: FsReaddirRecursive = (root, filter, files = [], prefix = ''): string[] => {
  const dir = path.join(root, prefix)

  if (!fs.existsSync(dir)) {
    return files
  }

  if (fs.statSync(dir).isDirectory()) {
    const array = fs.readdirSync(dir).filter((value, index) => {
      if (!filter) {
        return true
      }
      return filter(value, index, dir)
    })

    for (const name of array) {
      fsReaddirRecursive(root, filter, files, path.join(prefix, name))
    }
  } else {
    files.push(prefix)
  }

  return files
}

const rootDir = appRootPath.path
const publicDir = `${rootDir}/public`
const srcDir = `${rootDir}/src`

const relativePath = path.relative(`${srcDir}/parts/Icons`, publicDir)

const toUpperCamelCase = (str: string): string => {
  return str.replaceAll(/^\w|[A-Z]|\b\w/g, function (word, index) {
    return index == 0 ? word.toUpperCase() : word.toUpperCase().replaceAll(/\s+/g, '')
  })
}

const fileNames = fsReaddirRecursive(`${publicDir}/svgs`).map((fileName) => fileName.replace('.svg', ''))

let text = "import { FC, SVGProps } from 'react'\n"

for (const fileName of fileNames) {
  text = text + `import ${toUpperCamelCase(fileName)} from '${relativePath}/svgs/${fileName}.svg'\n`
}
text = text + '\n'

text = text + 'type SvgComponent = FC<SVGProps<SVGElement>>\n\n'

text = text + `export type SvgComponents = {\n`
for (const fileName of fileNames) {
  text = text + `${fileName}: SvgComponent\n`
}
text = text + `}\n\n`

text = text + 'export type SvgComponentsKeys = keyof SvgComponents\n\n'

text = text + `export const svgComponents: SvgComponents = {\n`
for (const fileName of fileNames) {
  text = text + `${fileName}: ${toUpperCamelCase(fileName)},\n`
}
text = text + `}\n\n`

text = text + `export const svgComponentsKeys = Object.keys(svgComponents) as (keyof SvgComponents)[]\n`

outputFileSync(`${rootDir}/src/parts/Icons/svgComponents.tsx`, text)

child_process.execSync(`pnpm eslint --fix ${rootDir}/src/parts/Icons/svgComponents.tsx`)
child_process.execSync(`pnpm prettier --write ${rootDir}/src/parts/Icons/svgComponents.tsx`)
