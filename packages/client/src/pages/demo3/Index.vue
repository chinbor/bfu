<script setup lang="ts">
import SparkerMD5 from 'spark-md5'
import type { SingleProps } from '~/api'
import { uploadWithHashName } from '~/api'
import { extractExt, fileToBase64, fileToBuffer } from '~/utils'

const uploading = ref(false)
const inputRef = ref<null | HTMLInputElement>(null)
interface FileListProp {
  file: File
  url: string
  id: number
  name: string
}
const lists = ref<Array<FileListProp>>([])
let id = 0

function selectFile() {
  if (uploading.value)
    return

  inputRef.value?.click()
}

function fileChange() {
  const file = inputRef.value?.files![0]

  if (!file)
    return

  if (!/(PNG|JPG|JPEG)/i.test(file.name)) {
    alert('上传文件只能是 PNG/JPG/JPEG 格式')
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('上传文件大小不能超过2MB')
    return
  }

  Promise.all([fileToBase64(file), fileToBuffer(file)]).then(([url, buffer]) => {
    const spark = new SparkerMD5.ArrayBuffer()
    spark.append(buffer)

    const suffix = extractExt(file.name)

    lists.value.push({
      url,
      file,
      id: id++,
      name: `${spark.end()}${suffix}`, // TODO: 变成hash名字
    })
  })

  inputRef.value!.value = ''
}

function deleteFile(idx: number) {
  lists.value.splice(idx, 1)
}

function uploadFile() {
  if (uploading.value)
    return

  if (!lists.value.length) {
    alert('请选择文件')
    return
  }

  uploading.value = true

  const promises: Array<Promise<SingleProps>> = []

  for (const item of lists.value) {
    const formData = new FormData()
    formData.append('file', item.file)
    formData.append('filename', item.name)

    promises.push(uploadWithHashName(formData))
  }

  Promise.all(promises).then((res) => {
    alert(`上传成功：${JSON.stringify(res)}`)
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
    <input ref="inputRef" type="file" accept=".png,.jpg,.jpeg" display-none @change="fileChange">

    <div flex>
      <button :class="uploading ? 'btn-primary-disabled' : ['btn-primary', 'hover:btn-primary-hover', 'active:btn-primary-active']" @click="selectFile">
        选择文件
      </button>
      <button ml-10px :class="uploading ? 'btn-success-disabled' : ['btn-success', 'hover:btn-success-hover', 'active:btn-success-active']" @click="uploadFile">
        <i v-if="uploading" i-svg-spinners-270-ring inline-block />
        上传到服务器
      </button>
    </div>

    <div v-if="lists.length">
      <div v-for="(item, index) in lists" :key="item.id" class="relative w300px my-10px border-2px border-[#3079ED]">
        <i class="i-ci-close-circle cursor-pointer inline-block ml10px absolute right-0px top-0px text-[#C53727] w30px h30px" @click="deleteFile(index)" />
        <img :src="item.url" :alt="item.name" class="w100% h-auto">
      </div>
    </div>

    <div v-else text-14px text-gray mt-10px>
      只能上传 PNG/JPG/JPEG 格式图片，且大小不能超过2MB.
    </div>
  </section>
</template>
