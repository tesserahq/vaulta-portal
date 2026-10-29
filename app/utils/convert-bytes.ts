export const bytesForHuman = (bytes: number, decimals = 2) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB']

  let unitIndex = 0

  while (bytes >= 1024 && unitIndex < units.length - 1) {
    bytes /= 1024
    unitIndex += 1
  }

  return parseFloat(bytes.toFixed(decimals)) + ' ' + units[unitIndex]
}
