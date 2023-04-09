<script setup lang="ts">
import type { UploadAlreadyProps } from '~/api'
import { isFileExist, mergeChunk, uploadAlready, uploadChunk } from '~/api'
import { delay, extractExt } from '~/utils'

interface ChunksProps {
  file: Blob
  filename: string
}

interface FileListProp {
  file: File
  id: number
  count?: number
  maxSize?: number
  hash?: string
  suffix?: string
  fileList?: string[]
  chunks?: ChunksProps[]
  percent?: string
  time?: number
}

const uploading = ref(false)
const selecting = ref(false)
const inputRef = ref<null | HTMLInputElement>(null)

const lists = ref<Array<FileListProp>>([])
let id = 0

function selectFile() {
  if (uploading.value || selecting.value)
    return

  inputRef.value?.click()
}

async function getAllBuffer(lists: FileListProp[]) {
  const promises: Promise<string>[] = []

  for (const list of lists) {
    const promise = new Promise<string>((resolve) => {
      const worker = new Worker('/hash.js')

      worker.postMessage({ fileChunkList: toRaw(list.chunks) })
      worker.onmessage = (e) => {
        const { hash } = e.data
        resolve(hash)
      }
    })

    promises.push(promise)
  }

  return Promise.all(promises)
}

async function getAllUploadedSlice(lists: FileListProp[]) {
  const promises: Promise<UploadAlreadyProps>[] = []

  for (const list of lists) {
    promises.push(uploadAlready({
      HASH: list.hash!,
    }))
  }

  return await Promise.all(promises)
}

function fileSlice(files: FileList) {
  const temp: FileListProp[] = []

  Array.from(files).forEach((file) => {
    const result: FileListProp = {
      id: id++,
      file,
      time: 0,
    }

    const suffix = extractExt(file.name)
    let maxSize = 1024 * 100 // 100kb
    let count = Math.ceil(file.size / maxSize)
    let index = 0
    const chunks: ChunksProps[] = []

    if (count > 100) {
      maxSize = file.size / 100
      count = 100
    }

    result.count = count
    result.maxSize = maxSize
    result.suffix = suffix

    while (index < count) {
      chunks.push({
        file: file.slice(index * maxSize, maxSize * (index + 1)),
        filename: `${index + 1}${suffix}`,
      })
      index++
    }

    result.chunks = chunks

    temp.push(result)
  })

  return temp
}

async function fileChange() {
  const files = inputRef.value?.files

  if (!files)
    return

  try {
    selecting.value = true

    const result = fileSlice(files)

    const hashs = await getAllBuffer(result)

    for (const [index, data] of hashs.entries()) {
      result[index].hash = data
      result[index].chunks?.forEach((chunk) => {
        chunk.filename = `${data}_${chunk.filename}`
      })
    }

    const alreadys = await getAllUploadedSlice(result)

    for (const [index, already] of alreadys.entries())
      result[index].fileList = already.fileList

    selecting.value = false

    lists.value = lists.value.concat(result)
  }
  catch (err) {
    console.error(err)
  }

  inputRef.value!.value = ''
}

function deleteFile(idx: number) {
  lists.value.splice(idx, 1)
}

function complete(list: FileListProp) {
  list.time!++

  list.percent = `${(list.time! / list.count!) * 100}%`

  return new Promise<string>((resolve, reject) => {
    if (list.time! < list.count!) {
      resolve('')
      return
    }

    mergeChunk({
      HASH: list.hash!,
      count: list.count!,
      suffix: list.suffix!,
    }).then((res) => {
      resolve(res.url)
    }).catch((err) => {
      reject(err)
    })
  })
}

function allInOne2(chunk: ChunksProps, list: FileListProp) {
  const fileList = list.fileList

  return new Promise<string>((resolve, reject) => {
    const { file, filename } = chunk

    if (fileList?.includes(filename)) {
      complete(list)?.then((res) => {
        resolve(res)
      })
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', filename)

    uploadChunk(formData).then(() => {
      complete(list)?.then((res) => {
        resolve(res)
      })
    }).catch((err) => {
      reject(err)
    })
  })
}

function allInOne(list: FileListProp) {
  return new Promise<string>((resolve, reject) => {
    isFileExist({
      HASH: list.hash!,
      suffix: list.suffix!,
    }).then((res) => {
      if (res.url) {
        list.percent = '100%'
        resolve(res.url)
        return
      }

      const promises: Promise<string>[] = []

      list.chunks?.forEach((chunk) => {
        promises.push(allInOne2(chunk, list))
      })

      Promise.all(promises).then((datas) => {
        const url = datas.filter((data) => {
          return !!data
        })[0]

        resolve(url)
      }).catch((err) => {
        reject(err)
      })
    }).catch((err) => {
      reject(err)
    })
  })
}

function uploadFile() {
  if (uploading.value || selecting.value)
    return

  if (!lists.value.length) {
    alert('请选择文件')
    return
  }

  uploading.value = true

  const promise: Promise<string>[] = []

  lists.value.forEach((list) => {
    promise.push(allInOne(list))
  })

  Promise.all(promise).then(async (datas) => {
    await delay(300)
    alert(`上传成功：${JSON.stringify(datas)}`)
  }).catch((err) => {
    console.error(err)
    alert('上传失败')
  }).finally(() => {
    uploading.value = false
    lists.value = []
  })
}
</script>

<template>
  <section w600px border-dashed border-2px p10px>
    <input ref="inputRef" type="file" display-none multiple @change="fileChange">

    <div flex>
      <button :class="uploading || selecting ? 'btn-primary-disabled' : ['btn-primary', 'hover:btn-primary-hover', 'active:btn-primary-active']" @click="selectFile">
        <i v-if="selecting" i-svg-spinners-270-ring inline-block />
        选择文件
      </button>
      <button ml-10px :class="uploading || selecting ? 'btn-success-disabled' : ['btn-success', 'hover:btn-success-hover', 'active:btn-success-active']" @click="uploadFile">
        <i v-if="uploading" i-svg-spinners-270-ring inline-block />
        上传到服务器
      </button>
    </div>

    <ul v-if="lists.length" class="text-14px text-gray mt-10px">
      <li v-for="(item, index) in lists" :key="item.id">
        <div class="flex items-center my5px justify-between">
          <span inline-block single-hidden class="w85%">{{ item.file.name }}</span>
          <span v-if="!uploading" class="text-[#C04131] flex items-center cursor-pointer" @click="deleteFile(index)">
            <i i-ci-close-circle inline-block ml10px />
            移除
          </span>
        </div>

        <div class="w100% relative h8px bg-white rounded mt10px overflow-hidden">
          <div class="h100% bg-[#3079ED] duration-300" :style="{ width: item.percent || 0 }" />
        </div>
      </li>
    </ul>
  </section>
</template>
