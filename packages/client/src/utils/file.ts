export function fileToBase64(file: File) {
  return new Promise<string>((resolve) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)

    fileReader.onload = (ev) => {
      resolve(ev.target?.result as string)
    }

    fileReader.onerror = () => {
      console.error(new Error('something wrong!!'))
    }
  })
}

export interface FileToBufferProps {
  buffer: ArrayBuffer
  file: File
}

export function fileToBuffer(file: File) {
  return new Promise<FileToBufferProps>((resolve) => {
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)

    fileReader.onload = (ev) => {
      resolve({
        buffer: ev.target?.result as ArrayBuffer,
        file,
      })
    }

    fileReader.onerror = (err) => {
      console.error(err)
    }
  })
}

export function extractExt(filename) {
  return filename.slice(filename.lastIndexOf('.'), filename.length)
}
