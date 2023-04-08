import path from 'node:path'
import fs from 'node:fs'
import { Buffer } from 'node:buffer'
import type { Request, Response } from 'express'
import multiparty from 'multiparty'
import SparkMD5 from 'spark-md5'
import { HOST_NAME, MAX_SIZE, UPLOAD_DIR } from './constant'

function useMultiParty(req: Request, auto?: boolean) {
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

function isExists(p) {
  p = path.normalize(p)
  return new Promise((resolve) => {
    fs.access(p, fs.constants.F_OK, (err) => {
      err ? resolve(false) : resolve(true)
    })
  })
}

function extractExt(filename) {
  return filename.slice(filename.lastIndexOf('.'), filename.length)
}

function writeFile(path, file, stream?: boolean) {
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

function path2url(p) {
  const pt = path.normalize(p)
  const uploadDir = path.normalize(UPLOAD_DIR)

  const index = uploadDir.length + 1

  return `${HOST_NAME}/${pt.substring(index)}`
}

export async function uploadSingle(req: Request, res: Response) {
  try {
    const { files } = await useMultiParty(req, true)
    const file = (files.file && files.file[0]) || {}

    res.send({
      code: 0,
      success: true,
      data: {
        url: path2url(file.path),
      },
      message: 'upload successfully!!',
    })
  }
  catch (err) {
    throw new Error(err)
  }
}

export async function uploadSingleBase64(req: Request, res: Response) {
  let { file, filename } = req.body

  file = decodeURIComponent(file)
  // NOTE: 注意这里一定要进行剪切
  file = file.replace(/^data:image\/\w+;base64,/, '')

  file = Buffer.from(file, 'base64')

  const spark = new SparkMD5.ArrayBuffer()
  const suffix = extractExt(filename)

  spark.append(file)

  const pt = `${UPLOAD_DIR}/${spark.end()}${suffix}`

  try {
    if (await isExists(pt)) {
      res.send({
        code: 0,
        success: true,
        data: {
          url: path2url(pt),
        },
        message: 'The file already exists',
      })

      return
    }

    await writeFile(pt, file)

    res.send({
      code: 0,
      success: true,
      data: {
        url: path2url(pt),
      },
      message: 'upload successfully!!',
    })
  }
  catch (err) {
    throw new Error(err)
  }
}

export async function uploadWithHashName(req: Request, res: Response) {
  try {
    const { files, fields } = await useMultiParty(req)
    const file = (files.file && files.file[0]) || {}
    const filename = (fields.filename && fields.filename[0]) || ''
    const pt = `${UPLOAD_DIR}/${filename}`

    if (await isExists(pt)) {
      res.send({
        code: 0,
        success: true,
        data: {
          url: path2url(pt),
        },
        message: 'The file already exists',
      })

      return
    }

    await writeFile(pt, file, true)

    res.send({
      code: 0,
      success: true,
      data: {
        url: path2url(pt),
      },
      message: 'upload successfully!!',
    })
  }
  catch (err) {
    throw new Error(err)
  }
}
