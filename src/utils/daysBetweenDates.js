const daysBetweenDates = (date1, date2) => {
  return Math.floor((date1 - date2) / 1000 / 60 / 60 / 24)
}

module.exports = daysBetweenDates
