<script setup lang="ts">
import type { SingleProps } from '~/api'
import { uploadSingleBase64 } from '~/api'
import { fileToBase64 } from '~/utils'

const uploading = ref(false)
const inputRef = ref<null | HTMLInputElement>(null)
interface FileListProp {
  file: string
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
  inputRef.value!.value = ''

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

  fileToBase64(file).then((data) => {
    lists.value.push({
      file: data,
      id: id++,
      name: file.name,
    })
  })
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
    promises.push(uploadSingleBase64({
      file: encodeURIComponent(item.file),
      filename: item.name,
    }))
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

    <ul v-if="lists.length" class="text-14px text-gray mt-10px">
      <li v-for="(item, index) in lists" :key="item.id" class="flex items-center">
        <span inline-block single-hidden class=" w300px">{{ item.name }}</span>
        <span class="text-[#C04131] flex items-center cursor-pointer" @click="deleteFile(index)">
          <i i-ci-close-circle inline-block ml10px />
          移除
        </span>
      </li>
    </ul>

    <div v-else text-14px text-gray mt-10px>
      只能上传 PNG/JPG/JPEG 格式图片，且大小不能超过2MB.
    </div>
  </section>
</template>
