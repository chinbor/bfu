import fs from 'node:fs'
import express from 'express'
import bodyParser from 'body-parser'
import { isFileExist, mergeChunk, uploadAlready, uploadChunk, uploadSingle, uploadSingleBase64, uploadWithHashName } from './controller'
import { HOST_NAME, PORT, UPLOAD_DIR } from './constant'
import { delay } from './utils'

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  req.method === 'OPITIONS'
    ? res.send('CURRENT SERVERICES SUPPORT CROSS DOMAIN REQUEST!')
    : next()
})

app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: '1024mb',
  }),
)

app.use(express.static(UPLOAD_DIR))

app.use((req, res, next) => {
  if (!fs.existsSync(UPLOAD_DIR))
    fs.mkdirSync(UPLOAD_DIR)

  next()
})

app.post('/uploadSingle', async (req, res) => {
  try {
    await delay()
    await uploadSingle(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.post('/uploadSingleBase64', async (req, res) => {
  try {
    await delay()
    await uploadSingleBase64(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.post('/uploadWithHashName', async (req, res) => {
  try {
    await delay()
    await uploadWithHashName(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.get('/uploadAlready', async (req, res) => {
  try {
    await uploadAlready(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.get('/isFileExist', async (req, res) => {
  try {
    await isFileExist(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.post('/uploadChunk', async (req, res) => {
  try {
    await uploadChunk(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.post('/mergeChunk', async (req, res) => {
  try {
    await mergeChunk(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err: err.message,
      },
      message: 'Oops!!',
    })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`serve is running at ${HOST_NAME}`)
})
