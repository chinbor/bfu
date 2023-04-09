import path from 'node:path'
import fs from 'node:fs'
import type { Request } from 'express'
import multiparty from 'multiparty'
import { HOST_NAME, MAX_SIZE, UPLOAD_DIR } from './constant'

export function useMultiParty(req: Request, auto?: boolean) {
  const config: multiparty.FormOptions = {
    maxFieldsSize: MAX_SIZE,
  }

  if (auto)
    config.uploadDir = UPLOAD_DIR

  return new Promise<{
    fields: any
    files: any
  }>((resolve, reject) => {
    new multiparty.Form(config).parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }

      resolve({
        fields,
        files,
      })
    })
  })
}

export function isExists(p) {
  p = path.normalize(p)
  return new Promise((resolve) => {
    fs.access(p, fs.constants.F_OK, (err) => {
      err ? resolve(false) : resolve(true)
    })
  })
}

export function extractExt(filename) {
  return filename.slice(filename.lastIndexOf('.'), filename.length)
}

export function writeFile(path, file, stream?: boolean) {
  return new Promise<void>((resolve, reject) => {
    if (stream) {
      const reader = fs.createReadStream(file.path)
      const writer = fs.createWriteStream(path)
      reader.on('end', () => {
        // NOTE: 删除 multiparty 生成的临时文件
        fs.unlinkSync(file.path)
        resolve()
      })

      reader.pipe(writer)

      return
    }

    fs.writeFile(path, file, (err) => {
      if (err) {
        reject(err)
        return
      }

      resolve()
    })
  })
}

export function path2url(p) {
  const pt = path.normalize(p)
  const uploadDir = path.normalize(UPLOAD_DIR)

  const index = uploadDir.length + 1

  return `${HOST_NAME}/${pt.substring(index)}`
}

export function delay(time = 1000) {
  return new Promise<void>((resolve) => {
    let timer: NodeJS.Timeout | null = setTimeout(() => {
      clearTimeout(timer!)
      timer = null
      resolve()
    }, time)
  })
}
