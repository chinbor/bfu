import fs from 'node:fs'
import express from 'express'
import bodyParser from 'body-parser'
import { uploadSingle, uploadSingleBase64, uploadWithHashName } from './controller'
import { HOST_NAME, PORT, UPLOAD_DIR } from './constant'

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
    await uploadSingle(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err,
      },
      message: 'Oops!!',
    })
  }
})

app.post('/uploadSingleBase64', async (req, res) => {
  try {
    await uploadSingleBase64(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err,
      },
      message: 'Oops!!',
    })
  }
})

app.post('/uploadWithHashName', async (req, res) => {
  try {
    await uploadWithHashName(req, res)
  }
  catch (err) {
    res.send({
      code: 1,
      success: false,
      data: {
        err,
      },
      message: 'Oops!!',
    })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`serve is running at ${HOST_NAME}`)
})