export const formatString = (format: 'kebab-case', value: string) => {
  switch (format) {
    case 'kebab-case': // this-is-text
      return value.trim().toLowerCase().replace(/\s+/g, '-')

    default:
      return value
  }
}
