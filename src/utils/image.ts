export interface ProcessedImage {
  width: number
  height: number
  data: Uint8Array
}

export async function processImages(
  blobs: Blob[],
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<ProcessedImage[]> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('@/workers/image-worker.ts', import.meta.url),
      { type: 'module' },
    )
    const results: ProcessedImage[] = []
    let done = 0

    worker.onmessage = (e) => {
      if (e.data.error) {
        worker.terminate()
        reject(new Error(e.data.error))
        return
      }
      results[e.data.index] = {
        width: e.data.width,
        height: e.data.height,
        data: new Uint8Array(e.data.data),
      }
      onProgress(++done, blobs.length)
      if (done === blobs.length) {
        worker.terminate()
        resolve(results)
      }
    }

    worker.onerror = (e) => {
      worker.terminate()
      reject(e)
    }

    if (signal) {
      signal.addEventListener('abort', () => {
        worker.terminate()
        reject(new DOMException('Aborted', 'AbortError'))
      })
    }

    for (let i = 0; i < blobs.length; i++) {
      worker.postMessage({ blob: blobs[i], index: i })
    }
  })
}
