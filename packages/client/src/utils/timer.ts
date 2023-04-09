export function delay(time = 1000) {
  return new Promise<void>((resolve) => {
    let timer: NodeJS.Timeout | null = setTimeout(() => {
      clearTimeout(timer!)
      timer = null
      resolve()
    }, time)
  })
}
