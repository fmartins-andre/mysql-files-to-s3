export const daysBetweenDates = (date1: number, date2: number): number => {
  return Math.floor((date1 - date2) / 1000 / 60 / 60 / 24)
}
