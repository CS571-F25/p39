import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Interactive ranking UI using a merge-insertion style algorithm.
// The user is asked each time to choose which of two items is "larger".

export default function RankerGame() {
  const [dataset, setDataset] = useState(null)
  const [items, setItems] = useState([]) // array of { name, idx }
  const [status, setStatus] = useState('idle') // 'idle' | 'sorting' | 'done'
  const [sortedIndices, setSortedIndices] = useState(null)
  const [currentCompare, setCurrentCompare] = useState(null) // { leftIdx, rightIdx }
  const compareResolveRef = useRef(null)
  const [comparisons, setComparisons] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('uploadedDataset')
      if (!raw) return
      const parsed = JSON.parse(raw)
      setDataset(parsed)
      const header = Array.isArray(parsed.rows && parsed.rows[0]) ? parsed.rows[0] : []
      const nameIdx = header.findIndex((h) => String(h).toLowerCase() === 'item_name')
      const dataRows = Array.isArray(parsed.rows) ? parsed.rows.slice(1) : []
      const mapped = dataRows.map((r, i) => ({ name: nameIdx >= 0 ? r[nameIdx] : (r[0] ?? `Item ${i + 1}`), idx: i }))
      setItems(mapped)
    } catch (err) {
      console.warn('Failed to load dataset from sessionStorage', err)
    }
  }, [])

  // Ask user to compare two items; resolves to true when left chosen, false when right chosen.
  function askUserCompare(leftIdx, rightIdx) {
    return new Promise((resolve) => {
      setCurrentCompare({ leftIdx, rightIdx })
      compareResolveRef.current = resolve
    })
  }

  function answerLeft() {
    if (compareResolveRef.current) {
      compareResolveRef.current(true)
      compareResolveRef.current = null
      setCurrentCompare(null)
      setComparisons((c) => c + 1)
    }
  }

  function answerRight() {
    if (compareResolveRef.current) {
      compareResolveRef.current(false)
      compareResolveRef.current = null
      setCurrentCompare(null)
      setComparisons((c) => c + 1)
    }
  }

  async function compareIndices(aIdx, bIdx) {
    // aIdx and bIdx refer to indices in the `items` array
    const res = await askUserCompare(aIdx, bIdx)
    return res
  }

  // Merge-insertion style (Ford-Johnson like) asynchronous sort.
  // Not a perfect implementation of the theoretical optimal sequence,
  // but pairs, recursively sorts winners, then inserts losers with binary search.
  async function mergeInsertionSort(indices) {
    if (indices.length <= 1) return indices.slice()

    const winners = []
    const losers = []

    // Pairwise compare
    for (let i = 0; i < indices.length; i += 2) {
      if (i + 1 >= indices.length) {
        winners.push(indices[i])
      } else {
        const a = indices[i]
        const b = indices[i + 1]
        const aIsGreater = await compareIndices(a, b)
        if (aIsGreater) {
          winners.push(a)
          losers.push(b)
        } else {
          winners.push(b)
          losers.push(a)
        }
      }
    }

    // Recursively sort winners
    const sortedWinners = await mergeInsertionSort(winners)

    // Insert losers into sortedWinners using binary insertion (descending order)
    for (let i = 0; i < losers.length; i++) {
      const loser = losers[i]
      let low = 0
      let high = sortedWinners.length
      while (low < high) {
        const mid = Math.floor((low + high) / 2)
        const midIdx = sortedWinners[mid]
        // ask whether loser is greater than mid
        const loserIsGreater = await compareIndices(loser, midIdx)
        if (loserIsGreater) {
          high = mid
        } else {
          low = mid + 1
        }
      }
      sortedWinners.splice(low, 0, loser)
    }

    return sortedWinners
  }

  async function startRanking() {
    if (!items || items.length < 2) return
    setStatus('sorting')
    setComparisons(0)
    try {
      const indices = items.map((_, i) => i)
      const sorted = await mergeInsertionSort(indices)
      setSortedIndices(sorted)
      setStatus('done')
    } catch (err) {
      console.error('Ranking failed', err)
      setStatus('idle')
      alert('An error occurred during ranking. Please try again.')
    }
  }

  function renderCompareCard() {
    if (!currentCompare) return null
    const left = items[currentCompare.leftIdx]
    const right = items[currentCompare.rightIdx]
    if (!left || !right) return null
    return (
      <div className="card p-3 mb-3">
        <h5 className="mb-3">Choose which item is larger</h5>
        <div className="d-flex gap-3 align-items-center">
          <div className="flex-fill text-center">
            <button className="btn btn-lg btn-outline-primary w-100" onClick={answerLeft}>{String(left.name)}</button>
          </div>
          <div className="text-muted">vs</div>
          <div className="flex-fill text-center">
            <button className="btn btn-lg btn-outline-primary w-100" onClick={answerRight}>{String(right.name)}</button>
          </div>
        </div>
        <div className="mt-2 text-muted">Comparisons made: {comparisons}</div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h2>Ranker Game</h2>

      {!dataset && (
        <>
          <div className="alert alert-warning">No dataset found. Upload a CSV on Home to start.</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
        </>
      )}

      {dataset && (
        <>
          <div className="card p-3 mb-3">
            <p>Loaded dataset: <strong>{dataset.name}</strong></p>
            <p>{items.length} item(s)</p>
          </div>

          {status === 'idle' && (
            <div className="mb-3">
              <button className="btn btn-primary me-2" onClick={startRanking} disabled={items.length < 2}>Start Ranking</button>
              <button className="btn btn-secondary" onClick={() => { sessionStorage.removeItem('uploadedDataset'); navigate('/') }}>Cancel</button>
            </div>
          )}

          {renderCompareCard()}

          {status === 'done' && sortedIndices && (
            <div className="card p-3">
              <h5>Final sorted list</h5>
              <ol>
                {sortedIndices.map((si) => (
                  <li key={si}>{items[si].name}</li>
                ))}
              </ol>
              <div className="mt-3">
                <button className="btn btn-secondary me-2" onClick={() => { sessionStorage.removeItem('uploadedDataset'); navigate('/') }}>Return Home</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
