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
  const [estimatedTotal, setEstimatedTotal] = useState(0)
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
    // Estimate total comparisons needed: roughly n * log2(n) for merge-insertion sort
    const estimated = Math.ceil(items.length * Math.log2(items.length))
    setEstimatedTotal(estimated)
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
    
    // Calculate progress
    const progress = estimatedTotal > 0 ? Math.min(100, Math.round((comparisons / estimatedTotal) * 100)) : 0
    const remaining = Math.max(0, estimatedTotal - comparisons)
    
    return (
      <div className="card p-3 p-md-4 mb-3">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Progress</h5>
          </div>
          <div className="progress" style={{ height: '24px' }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${progress}%`, backgroundColor: 'var(--primary-color)' }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span className="d-none d-sm-inline" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                {progress}%
              </span>
            </div>
          </div>
          <div className="text-muted small mt-2">
            {remaining > 0 ? `~${remaining} comparison${remaining !== 1 ? 's' : ''} remaining` : 'Almost done!'}
          </div>
        </div>

        <h5 className="mb-4">Which item is better?</h5>
        <div className="row g-2 g-md-3 mb-3">
          <div className="col-12 col-md-5">
            <button className="btn btn-lg btn-outline-primary w-100" onClick={answerLeft}>
              {String(left.name)}
            </button>
          </div>
          <div className="col-12 col-md-2 d-flex align-items-center justify-content-center">
            <span className="text-muted fw-bold">vs</span>
          </div>
          <div className="col-12 col-md-5">
            <button className="btn btn-lg btn-outline-primary w-100" onClick={answerRight}>
              {String(right.name)}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
          <h2 className="mb-4">Ranker Game</h2>

          {!dataset && (
            <>
              <div className="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>No dataset found.</strong> Upload a CSV on Home to start.
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Home</button>
            </>
          )}

          {dataset && (
            <>
              <div className="card p-3 p-md-4 mb-3">
                <h5 className="text-start mb-2">Loaded dataset:</h5>
                <p className="text-start mb-0"><strong>{dataset.name}</strong> • {items.length} item(s)</p>
              </div>

              {status === 'idle' && (
                <div className="mb-3 d-flex flex-column flex-md-row gap-2">
                  <button className="btn btn-primary" onClick={startRanking} disabled={items.length < 2}>
                    Start Ranking
                  </button>
                  <button className="btn btn-secondary" onClick={() => { sessionStorage.removeItem('uploadedDataset'); navigate('/') }}>
                    Cancel
                  </button>
                </div>
              )}

              {renderCompareCard()}

              {status === 'done' && sortedIndices && (
                <div className="card p-3 p-md-4">
                  <h5 className="mb-3">Final sorted list</h5>
                  <ol className="text-start mb-4">
                    {sortedIndices.map((si) => (
                      <li key={si} className="mb-2">{items[si].name}</li>
                    ))}
                  </ol>
                  <div className="d-flex flex-column flex-md-row gap-2">
                    <button className="btn btn-secondary" onClick={() => { sessionStorage.removeItem('uploadedDataset'); navigate('/') }}>
                      Return Home
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
