<script setup lang="ts">
import type { SingleProps } from '~/api'
import { uploadSingle } from '~/api'
import { delay } from '~/utils'

const uploading = ref(false)
const inputRef = ref<null | HTMLInputElement>(null)
interface FileListProp {
  file: File
  id: number
  percent?: string
}
const lists = ref<Array<FileListProp>>([])
let id = 0

function selectFile() {
  if (uploading.value)
    return

  inputRef.value?.click()
}

function fileChange() {
  const files = inputRef.value?.files

  if (!files)
    return

  for (const file of Array.from(files)) {
    lists.value.push({
      file,
      id: id++,
    })
  }

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
    formData.append('filename', item.file.name)

    promises.push(uploadSingle(formData, {
      async onUploadProgress(ev) {
        item.percent = `${((ev.loaded / ev.total!) * 100)}%`
      },
    }))
  }

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
</script>

<template>
  <section w600px border-dashed border-2px p10px>
    <input ref="inputRef" type="file" display-none multiple @change="fileChange">

    <div flex>
      <button :class="uploading ? 'btn-primary-disabled' : ['btn-primary', 'hover:btn-primary-hover', 'active:btn-primary-active']" @click="selectFile">
        选择文件
      </button>
      <button ml-10px :class="uploading ? 'btn-success-disabled' : ['btn-success', 'hover:btn-success-hover', 'active:btn-success-active']" @click="uploadFile">
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
