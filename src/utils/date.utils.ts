import { format } from "date-fns"

export function formatDBDate(date: string|null|undefined): string {
  if (!date) return ''

  const dateSplit = date.split('-')

  const result = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`

  return result
}

export function formatDBDateTime(date: string|null|undefined): string {
  if (!date) return ''

  const split = date.split(' ')
  const dateSplit = split[0].split('-')

  const result = `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]} ${split[1]}`

  return result
}

export function formatTimeToDateTime(time: number|string|null|undefined): string {
  if (!time) return ''

  const date = new Date(time)

  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()

  const hour = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  const sec = date.getSeconds().toString().padStart(2, '0')

  const result = `${d}/${m}/${y} ${hour}:${min}:${sec}`

  return result
}

export function currentDateTime(): string {
  const dateTime = new Date();
  const formattedDateTime = format(dateTime, 'dd/MM/yyyy HH:mm:ss');

  return formattedDateTime;
}

export function currentDateTimeDB(): string {
  const dateTime = new Date();
  const formattedDateTime = format(dateTime, 'yyyy-MM-dd HH:mm:ss');

  return formattedDateTime;
}