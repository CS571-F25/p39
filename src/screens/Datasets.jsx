import React from 'react'

const datasets = [
  { name: 'Beatles Albums', file: '/datasets/beatles.csv' },
  { name: "Candy", file: '/datasets/candy.csv' },
  { name: 'NFL Quarterbacks', file: '/datasets/quarterbacks.csv' },
  { name: "Quentin Tarantino Movies", file: '/datasets/tarantino.csv' },
  { name: 'US Cities', file: '/datasets/uscities.csv' },
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
