export const capitalizeFirstLetter = str => {
  return str[0].toUpperCase() + str.substr(1)
}

export const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
})