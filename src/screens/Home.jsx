import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function parseCSV(text) {
  // simple CSV parser supporting quoted fields and escaped quotes
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  return lines.map((line) => {
    const values = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        values.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    values.push(cur)
    return values
  })
}

export default function Home() {
  const fileInputRef = useRef(null)
  const [filename, setFilename] = useState(null)
  const [rows, setRows] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const onPickFile = () => fileInputRef.current && fileInputRef.current.click()

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0]
    setError(null)
    setRows([])
    setFilename(null)
    if (!f) return

    if (!f.name.toLowerCase().endsWith('.csv') && f.type !== 'text/csv') {
      setError('Please select a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result)
        const parsed = parseCSV(text)
        if (!parsed || parsed.length === 0) {
          setError('CSV appears to be empty')
          return
        }

        setFilename(f.name)
        setRows(parsed)

        // persist dataset so RankerGame can access it after navigation
        try {
          sessionStorage.setItem('uploadedDataset', JSON.stringify({ name: f.name, rows: parsed }))
        } catch (err) {
          console.warn('Failed to save dataset to sessionStorage', err)
        }

        // navigate to RankerGame screen
        navigate('/ranker')
      } catch (err) {
        setError('Failed to parse CSV file')
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(f)
  }

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
          <h2 className="mb-4">Home</h2>
          <div className="card p-3 p-md-4 mb-3">
            <p className="lead">
              Want to rank all starting NFL quarterbacks? Have a definitive ranking of every Beatles album?
              <br />
              Use <strong>Ranker.io</strong> to create and share your own rankings!
            </p>

            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
              <button className="btn btn-primary btn-lg w-100 w-md-auto mb-2" onClick={onPickFile}>
                Upload CSV Dataset
              </button>
              <div className="text-muted small mt-2">You can upload a CSV to use as your dataset for rankings.</div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {filename && (
            <div className="card p-3 p-md-4">
              <h5 className="text-start mb-2">Loaded dataset:</h5>
              <p className="text-start mb-3"><strong>{filename}</strong> • {rows.length} row(s)</p>

              {rows.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        {rows[0].map((h, i) => (
                          <th key={i}>{h || `Col ${i + 1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(1, 6).map((r, ri) => (
                        <tr key={ri}>
                          {r.map((c, ci) => (
                            <td key={ci}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
