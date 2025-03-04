export const convertCatalogIdToProductId = (catalogId: string) =>
  `MLB-${catalogId.split("MLB")[1]}`

export const sanitizeAmountSold = (amountSold: string): number => {
  console.log("amountSold ====>>", amountSold)
  const addZerosToAmountStr = amountSold
    .replaceAll("mil", "000")
    .replaceAll("mi", "000000")
  const numbersRegex = /\d+/g // Regular expression to match one or more digits
  const matches = addZerosToAmountStr.match(numbersRegex)
  if (matches) return parseInt(matches.join(""))
}

export const convertCurrencyStrings = (currencyStrings: string): number => {
  const addCentavos = currencyStrings.includes("centavos")
    ? currencyStrings
    : `${currencyStrings} com 00 centavos`
  const onlyNumber: number = Number.parseInt(addCentavos.replace(/\D/g, ""))
  const floatNumbers: number = Number.parseFloat((onlyNumber / 100).toFixed(2))
  return floatNumbers
}
export const getEanIfExist = (attributes): string | null => {
  return attributes?.find((attr) => attr.id == "GTIN")?.value_name ?? null
}

export const getAttributeValueName = (attributes, name) =>
  attributes?.find((attr) => attr.id == name.toUpperCase())?.value_name ?? null
