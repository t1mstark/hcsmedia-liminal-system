import { useMemo, useState } from 'react'

const morseMap: Record<string, string> = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I',
  '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
  '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z',
  '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
}

function caesar(text: string, shift: number) {
  return text
    .split('')
    .map((ch) => {
      const c = ch.charCodeAt(0)
      if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + shift + 26) % 26) + 65)
      if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + shift + 26) % 26) + 97)
      return ch
    })
    .join('')
}

export default function SignalDecoder() {
  const [input, setInput] = useState('... --- ...')
  const [shift, setShift] = useState(3)

  const morseDecoded = useMemo(
    () =>
      input
        .trim()
        .split(' / ')
        .map((w) =>
          w
            .split(' ')
            .map((l) => morseMap[l] ?? '?')
            .join(''),
        )
        .join(' '),
    [input],
  )

  const caesarDecoded = useMemo(() => caesar(input, -shift), [input, shift])

  return (
    <div className="decoder-box">
      <h4>Signal Decoder</h4>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Morse oder codierter Text..." />
      <div className="decoder-grid">
        <div>
          <strong>Morse → Text</strong>
          <p>{morseDecoded}</p>
        </div>
        <div>
          <strong>Caesar Decode</strong>
          <p>{caesarDecoded}</p>
          <label>
            Shift: {shift}
            <input type="range" min={1} max={25} value={shift} onChange={(e) => setShift(Number(e.target.value))} />
          </label>
        </div>
      </div>
    </div>
  )
}
