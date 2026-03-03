//? Example
async function sendData() {
  const input = document.getElementById("userInput").value;

  // The actual "handshake"
  const response = await fetch("http://localhost:3000/api/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: input, timestamp: new Date() }),
  });

  const result = await response.json();
  document.getElementById("responseArea").innerText =
    "Server says: " + result.message;
}
//? Example

async function getUserData() {
  // 1. Requesting the data
  const url = `http://localhost:5500/api/`;
  const response = await fetch(url);

  // 2. Converting the "package"
  const data = await response.json();

  // 3. Inspecting the result in F12
  console.log("Full Package from Server:", data);

  // Optional: Update a tag so you see it on the page
  const display = document.getElementById("display");
  if (display) {
    display.innerText = data.message;
  }
}
