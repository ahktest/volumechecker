export const baseCSS = `
  body {
    font-family: sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f1f1f1;
  }
  .container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 30px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
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
    background-color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-weight: bold;
    color: #333;
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
    background-color: #aaa;
    cursor: not-allowed;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 40px;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  th {
    background-color: #f8f8f8;
    font-weight: bold;
  }
  .green {
    color: green;
    font-weight: bold;
  }
  .red {
    color: red;
    font-weight: bold;
  }
`;
