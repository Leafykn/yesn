export const makeMap = function (
    str:string,
    expectsLowerCase?:boolean
  ) {
    const map = Object.create(null)
    const list = str.split(',')
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true
    }
    return expectsLowerCase
      ? (val:string) => map[val.toLowerCase()]
      : (val:string) => map[val]
}

export const no = ()=>false;