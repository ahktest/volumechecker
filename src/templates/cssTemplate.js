export const baseCSS = `
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    background-color: #121212;
    color: #f0f0f0;
  }
  .container {
    max-width: 1300px;
    margin: 40px auto;
    padding: 30px;
    background-color: #1e1e1e;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  .logo {
    height: 50px;
    width: 150px;
    background-color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-weight: bold;
    color: #f0f0f0;
  }
  .update-btn {
    padding: 12px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  .update-btn:hover:not([disabled]) {
    background-color: #0056b3;
  }
  .update-btn[disabled] {
    background-color: #555;
    cursor: not-allowed;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 40px;
  }
  th, td {
    border: 1px solid #333;
    padding: 10px;
    text-align: left;
  }
  th {
    background-color: #2c2c2c;
    color: #cccccc;
    font-weight: bold;
  }
  td {
    background-color: #1e1e1e;
  }
  .green {
    color: #00ff7f;
    font-weight: bold;
  }
  .red {
    color: #ff4c4c;
    font-weight: bold;
  }
`;
