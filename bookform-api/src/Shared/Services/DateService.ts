export function log(...messages: any[]) {
    console.log(getDate(), ...messages)
}

export function logError(...messages: any[]) {
    console.error(getDate(), ...messages)
}
  
export function getDate(): string {
    const date = new Date()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hours = `${date.getHours()}`.padStart(2, '0')
    const minutes = `${date.getMinutes()}`.padStart(2, '0')
    const seconds = `${date.getSeconds()}`.padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`
}