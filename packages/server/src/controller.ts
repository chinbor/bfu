import { Buffer } from 'node:buffer'
import type { Request, Response } from 'express'
import SparkMD5 from 'spark-md5'
import { UPLOAD_DIR } from './constant'
import { extractExt, isExists, path2url, useMultiParty, writeFile } from './utils'

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
