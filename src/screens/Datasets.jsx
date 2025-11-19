import React from 'react'

const datasets = [
  { name: 'Example 1', file: '/datasets/example1.csv' },
  { name: 'Example 2', file: '/datasets/example2.csv' },
  { name: 'Example 3', file: '/datasets/example3.csv' },
]

export default function Datasets() {
  return (
    <div className="container py-4">
      <h2>Datasets</h2>
      <div className="card p-3">
        <p>Download CSV datasets you can use with the site. Click a file to download it locally.</p>
        <ul className="list-group">
          {datasets.map((d) => (
            <li key={d.file} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{d.name}</span>
              <a className="btn btn-sm btn-primary" href={d.file} download>
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
