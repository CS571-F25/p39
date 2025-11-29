export default function Tutorial() {
  return (
    <div className="container py-4">
      <h2>How to Use <i>Ranker.io</i></h2>
      <div className="card p-3 tutorial-card">
        <ol className="tutorial-list">
          <li>
            <span className="tutorial-title">Create CSV File</span>
            <p>Prepare a CSV file with a single column containing the items you want to rank. Each row should represent one item.</p>
          </li>
          <li>
            <span className="tutorial-title">Upload Dataset</span>
            <p>Go to the Home page and use the "Upload CSV Dataset" button to select and upload your CSV file. The site will parse the file and display a preview of the data.</p>
          </li>
          <li>
            <span className="tutorial-title">Start Ranking</span>
            <p>Once your dataset is uploaded, navigate to the Ranker Game screen. Click "Start Ranking" to begin the comparison process.</p>
          </li>
          <li>
            <span className="tutorial-title">Make Comparisons</span>
            <p>You will be presented with two items at a time. Click on the item you prefer. The system will use your choices to build a ranked list.</p>
          </li>
          <li>
            <span className="tutorial-title">View Results</span>
            <p>After completing the comparisons, you will see the final ranked list of your items. You can review and share this list as needed.</p>
          </li>
        </ol>
      </div>
    </div>
  )
}
