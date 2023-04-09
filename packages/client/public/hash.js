self.importScripts("/spark-md5.min.js");

// 生成文件 hash
// create file hash
self.onmessage = e => {
  const { fileChunkList } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();
  let count = 0;
  const loadNext = index => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index].file);
    reader.onload = e => {
      count++;
      spark.append(e.target.result);
      if (count === fileChunkList.length) {
        self.postMessage({
          hash: spark.end()
        });
        self.close();
      } else {
        loadNext(count);
      }
    };
  };
  loadNext(0);
};