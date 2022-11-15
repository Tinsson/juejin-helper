class Schedule {
  private timer: any
  private gap: number
  private limitHours: [number, number]

  constructor(gapMinutes: number, limitHours: [number, number]) {
    this.gap = gapMinutes * 60 * 1000
    this.limitHours = limitHours
  }

  public register(callback) {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.timer = setInterval(() => {
      const curHour = new Date().getHours()
      if (curHour >= this.limitHours[0] && curHour <= this.limitHours[1]) {
        return false
      }
      callback()
    }, this.gap)
  }
}

const job = new Schedule(10, [0, 6])

export default job
