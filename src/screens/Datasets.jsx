import React, { useState } from 'react'

const datasets = [
  { name: 'Beatles Albums', file: '/datasets/beatles.csv' },
  { name: 'Candy', file: '/datasets/candy.csv' },
  { name: 'NFL Quarterbacks', file: '/datasets/quarterbacks.csv' },
  { name: 'Quentin Tarantino Movies', file: '/datasets/tarantino.csv' },
  { name: 'US Cities', file: '/datasets/uscities.csv' },
]

export default function Datasets() {
  const [downloading, setDownloading] = useState('')

  async function downloadFile(filePath, suggestedName) {
    try {
      setDownloading(filePath)
      const res = await fetch(filePath)
      if (!res.ok) throw new Error(`Failed to fetch ${filePath}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = suggestedName || filePath.split('/').pop()
      // append -> click -> remove to trigger download
      document.body.appendChild(a)
      a.click()
      a.remove()
      // revoke object URL after short delay to ensure download started
      setTimeout(() => URL.revokeObjectURL(url), 500)
    } catch (err) {
      console.error('Download failed', err)
      // fallback: navigate directly to file (browser may handle download)
      window.location.href = filePath
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="container-fluid py-3 py-md-4">
      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
          <h2 className="mb-4">Datasets</h2>
          <div className="card p-3 p-md-4">
            <p className="lead mb-4">Download CSV datasets you can use with the site. Click a file to download it locally.</p>

            <ul className="list-group list-group-flush">
              {datasets.map((d) => (
                <li
                  key={d.file}
                  className="list-group-item d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-2 gap-md-0"
                >
                  <div>
                    <div className="fw-500">{d.name}</div>
                    <div className="small text-muted">{d.file.split('/').pop()}</div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <a
                      href={d.file}
                      download
                      className="d-none"
                      aria-hidden="true"
                    />
                    <button
                      className="btn btn-sm btn-primary align-self-start align-self-md-auto"
                      onClick={(e) => {
                        e.preventDefault()
                        downloadFile(d.file, `${d.name.replace(/\s+/g, '_')}.csv`)
                      }}
                      disabled={downloading === d.file}
                      aria-label={`Download ${d.name} CSV`}
                    >
                      {downloading === d.file ? 'Downloading…' : 'Download'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
