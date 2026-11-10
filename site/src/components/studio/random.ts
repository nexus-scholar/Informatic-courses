export function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle<T>(a: T[]): T[] {
  let b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
