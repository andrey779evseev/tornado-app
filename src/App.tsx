import {useState} from 'react'
import doneImg from './assets/done.svg'
import closeImg from './assets/close.svg'
import tornadoImg from './assets/tornado.svg'
import houseImg from './assets/house.png'


class Cell {
  hasTornado: boolean = false
  hasHouse: boolean = false
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const App = () => {
  const [size, setSize] = useState(10)
  const [countTornados, setCountTornados] = useState(5)
  const [error, setError] = useState('')
  const [matrix, setMatrix] = useState<Cell[][]>([])

  const fillMatrix = () => {
    if(invalidInputs()) return
    const mx: Cell[][] = []
    for (let i = 0; i < size; i++) {
      const arr: Cell[] = []
      for (let j = 0; j < size; j++) {
        arr.push(new Cell())
      }
      mx.push(arr)
    }
    mx[0][0].hasHouse = true
    setMatrix(mx)
  }

  const invalidInputs = (fillArray: boolean = true) => {
    if ((!size || !matrix || matrix.length === 0) && !!countTornados && !fillArray) {
      setError('Для начала необходимо ввести размерность массива')
      return true
    } else if (!size) {
      setError('Введите корректную размерность матрицы')
      return true
    } else if (!countTornados || countTornados < 0) {
      setError('Введите корректное количество торнадо')
      return true
    } else if (countTornados > size) {
      setError('Количество торнадо не должно превышать размерность матрицы')
      return true
    }
    setError('')
    return false
  }

  const randomTornados = () => {
    if(invalidInputs(false)) return
    const mx = [...matrix]
    mx.forEach(x => {
      x.forEach(y => {
        y.hasTornado = false
      })
    })
    for (let i = 0; i < countTornados; i++) {
      const row = getRandomInt(0, size - 1)
      const col = getRandomInt(0, size - 1)
      if (!mx[col][row].hasTornado) {
        mx[col][row].hasTornado = true
      } else {
        i--
      }
    }
    setMatrix(mx)
  }

  const getNearCell = (i: number, j: number) => {
    const nearCells = [
      {i: i - 1, j: j - 1},
      {i: i - 1, j: j},
      {i: i - 1, j: j + 1},
      {i: i, j: j - 1},
      {i: i, j: j + 1},
      {i: i + 1, j: j - 1},
      {i: i + 1, j: j},
      {i: i + 1, j: j + 1}
    ]
    return nearCells.filter(x => x.i >= 0 && x.i < size && x.j >= 0 && x.j < size)
  }

  const step = (i: number, j: number) => {
    if (matrix[i][j].hasHouse) return
    const mx = [...matrix]
    if (isNear(i, j)) {
      mx.forEach(x => {
        x.forEach(y => {
          y.hasHouse = false
        })
      })
      matrix[i][j].hasHouse = true
    }
    const tornados = []
    for (let k = 0; k < size; k++) {
      for (let l = 0; l < size; l++) {
        if (mx[k][l].hasTornado) {
          tornados.push({i: k, j: l})
        }
      }
    }
    tornados.forEach(tornado => {
      const near = getNearCell(tornado.i, tornado.j)
      if (near.length > 0) {
        let randomNear = near[getRandomInt(0, near.length - 1)]
        if (!mx[randomNear.i][randomNear.j].hasTornado) {
          mx[randomNear.i][randomNear.j].hasTornado = true
          mx[tornado.i][tornado.j].hasTornado = false
        } else {
          randomNear = near[getRandomInt(0, near.length - 1)]
          mx[randomNear.i][randomNear.j].hasTornado = true
          mx[tornado.i][tornado.j].hasTornado = false
        }
      }
    })
    setMatrix(mx)
    if(matrix.some(x => x.some(y => y.hasTornado && y.hasHouse))) {
      setError('Торнадо снесло дом')
      setMatrix([])
    }
  }

  const isNear = (i: number, j: number) => {
    return ((i !== 0 && matrix[i - 1][j].hasHouse) ||
      (i !== size - 1 && matrix[i + 1][j].hasHouse) ||
      (j !== 0 && matrix[i][j - 1].hasHouse) ||
      (j !== size - 1 && matrix[i][j + 1].hasHouse) ||
      (i !== 0 && j !== 0 && matrix[i - 1][j - 1].hasHouse) ||
      (i !== 0 && j !== size - 1 && matrix[i - 1][j + 1].hasHouse) ||
      (i !== size - 1 && j !== 0 && matrix[i + 1][j - 1].hasHouse) ||
      (i !== size - 1 && j !== size - 1 && matrix[i + 1][j + 1].hasHouse))
  }

  return (
    <div className='bg-gradient-to-r from-sky-500 to-indigo-500 w-full h-screen p-5 flex flex-col items-center'>
      {
        !!error ?
        <div className="hover:opacity-90 transition-all duration-300 hover:right-1 absolute right-5 w-1/4 h-fit shadow-md shadow-rose-300/50 rounded-xl border border-red-300 bg-rose-300 p-2 cursor-pointer" onClick={() => setError('')}>
          <div className="text-white select-none">{error}</div>
        </div> : null
      }
      <div className='text-lg text-white/80'>Введите размерность матрицы</div>
      <div className="flex">
        { matrix.length !== 0 ?
          <img className='w-[30px] h-[30px]' src={doneImg} alt=""/> :
          <img className='w-[30px] h-[30px]' src={closeImg} alt=""/>}
        <input type="number" value={size} onChange={e => setSize(Number(e.target.value))} className='ml-2 border-2 border-blue-500 bg-blue-300 rounded outline-none text-white'/>
        <button onClick={fillMatrix} className="border-2 border-indigo-500 bg-indigo-300 rounded px-2 ml-2 text-white">Применить</button>
      </div>
      <div className='text-lg text-white/80'>Введите количество торнадо</div>
      <div className="flex">
        { !!matrix && matrix.some(x => x.some(y => y.hasTornado)) ?
          <img className='w-[30px] h-[30px]' src={doneImg} alt=""/> :
          <img className='w-[30px] h-[30px]' src={closeImg} alt=""/>}
        <input type="number" value={countTornados} onChange={e => setCountTornados(Number(e.target.value))}  className='ml-2 border-2 border-blue-500 bg-blue-300 rounded outline-none text-white'/>
        <button onClick={randomTornados} className="border-2 border-indigo-500 bg-indigo-300 rounded px-2 ml-2 text-white">Применить</button>
      </div>
      { matrix.length !== 0 ?
        <div className="flex flex-col border border-green-300 w-fit mt-5">
          {
            matrix.map((row, i) => (
              <div className='flex' key={i}>
                {
                  row.map((cell, j) => (
                    <div className={`w-[60px] h-[60px] border ${isNear(i, j) ? 'border-blue-300 bg-blue-400 hover:cursor-pointer hover:opacity-50' : 'border-green-300 bg-emerald-400'}`} key={j} onClick={() => step(i, j)}>
                      {cell.hasTornado ? <img className='w-[50px] h-[50px] mt-1 ml-1' src={tornadoImg} alt=""/> : null}
                      {cell.hasHouse ? <img className='w-[50px] h-[50px] mt-1 ml-1' src={houseImg} alt=""/> : null}
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
        : null
      }
    </div>
  )
}

export default App
