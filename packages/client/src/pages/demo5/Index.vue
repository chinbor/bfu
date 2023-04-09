<script setup lang="ts">
import type { SingleProps } from '~/api'
import { uploadSingle } from '~/api'
import { delay } from '~/utils'

const inputRef = ref<null | HTMLInputElement>(null)
const wrapperRef = ref<null | HTMLTableSectionElement>(null)
interface FileListProp {
  file: File
  id: number
  percent?: string
}
const lists = ref<Array<FileListProp>>([])
let id = 0
const uploading = ref(false)

function selectFile() {
  inputRef.value?.click()
}

function handleUpload(files?: FileList | null) {
  if (uploading.value)
    return

  if (!files)
    return

  for (const file of Array.from(files)) {
    lists.value.push({
      file,
      id: id++,
    })
  }

  inputRef.value!.value = ''

  const promises: Array<Promise<SingleProps>> = []

  for (const item of lists.value) {
    const formData = new FormData()
    formData.append('file', item.file)
    formData.append('filename', item.file.name)

    promises.push(uploadSingle(formData, {
      async onUploadProgress(ev) {
        item.percent = `${((ev.loaded / ev.total!) * 100)}%`
      },
    }))
  }

  uploading.value = true

  Promise.all(promises).then(async (res) => {
  // NOTE: 延迟300ms是因为进度条宽度使用了trasition（延迟了300ms）
    await delay(300)
    alert(`上传成功：${JSON.stringify(res)}`)
  }).catch((err) => {
    console.error(err)
    alert('上传失败')
  }).finally(() => {
    uploading.value = false
    lists.value = []
  })
}

function fileChange() {
  const files = inputRef.value?.files

  handleUpload(files)
}

function dragover(e: HTMLElementEventMap['dragover']) {
  // NOTE: 必须跟 drop 同时禁止默认行为
  e.preventDefault()
}

function drop(e: HTMLElementEventMap['drop']) {
  // NOTE: 必须跟 dragover 同时禁止默认行为
  e.preventDefault()

  const files = e.dataTransfer?.files
  handleUpload(files)
}
onMounted(() => {
  wrapperRef.value?.addEventListener('dragover', dragover)
  wrapperRef.value?.addEventListener('drop', drop)
})

onUnmounted(() => {
  wrapperRef.value?.removeEventListener('dragover', dragover)
  wrapperRef.value?.removeEventListener('drop', drop)
})
</script>

<template>
  <section ref="wrapperRef" w600px border-dashed border-2px p10px text-white text-14px class="relative wrapper">
    <input ref="inputRef" type="file" display-none multiple @change="fileChange">
    <div v-if="!lists.length" class="relative w100% h100%">
      <i class="block i-simple-line-icons-cloud-upload w200px h200px mx-auto" />
      <div class="text-center">
        将文件拖到此处，或<a class="text-[#3079ED] cursor-pointer" @click="selectFile">点击上传</a>
      </div>
    </div>

    <ul v-else class="text-14px text-gray mt-10px">
      <li v-for="(item) in lists" :key="item.id">
        <div class="flex items-center my5px justify-between">
          <span inline-block single-hidden class="w85%">{{ item.file.name }}</span>
        </div>

        <div class="w100% relative h8px bg-white rounded mt10px overflow-hidden">
          <div class="h100% bg-[#3079ED] duration-300" :style="{ width: item.percent || 0 }" />
        </div>
      </li>
    </ul>
  </section>
</template>
