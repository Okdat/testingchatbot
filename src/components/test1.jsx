<>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Multiple Choice Layout</title>
  <link rel="stylesheet" href="test1.css" />
  <div className="container">
    {/* Test selection section */}
    <div className="test-selection">
      <h3>Test number 1:</h3>
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>4</button>
      <button>5</button>
      <br />
      <button>6</button>
      <button>7</button>
      <button>8</button>
      <button>9</button>
      <button>10</button>
      <br />
      <button>11</button>
      <button>12</button>
      <button>13</button>
      <button>14</button>
      <button>15</button>
      <br />
      <button className="finish">Finished? Then Submit</button>
    </div>
    {/* Question section */}
    <div className="question-section">
      <label>
        <h2>Question 1:</h2>
      </label>
      <label>
        <input type="radio" name="question1" defaultValue="a" />
        Option 1
      </label>
      <label>
        <input type="radio" name="question1" defaultValue="b" />
        Option 2
      </label>
      <label>
        <input type="radio" name="question1" defaultValue="c" />
        Option 3
      </label>
      <label>
        <input type="radio" name="question1" defaultValue="d" />
        Option 4
      </label>
      <div className="button-container">
        <button>Previous</button>
        <button>Next</button>
      </div>
    </div>
  </div>
</>
