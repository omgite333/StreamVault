const MAX_IMAGE_SIZE = 1920

export const toWebP = async (file: File, maxSize = MAX_IMAGE_SIZE): Promise<File> => {
  if (!file.type.startsWith('image/') || typeof document === 'undefined') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85))
    if (!blob) return file

    return new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
  } catch {
    return file
  }
}
