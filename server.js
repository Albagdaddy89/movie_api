// Require necessary Node.js modules
const http = require('http'),
      fs = require('fs'),
      url = require('url');

// Create an HTTP server
http.createServer((request, response) => {
  // Extract the URL from the request
  let addr = request.url,
      q = new URL(addr, 'http://' + request.headers.host),
      filePath = '';

  // Append the request URL and timestamp to log.txt
  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err); // Log any errors during file writing
    } else {
      console.log('Added to log.'); // Confirmation message for successful logging
    }
  });

  // Check if the request URL contains 'documentation'
  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html'); // Set path to documentation.html
  } else {
    filePath = (__dirname + '/index.html'); // Default path to index.html
  }

  // Read the file from the determined filePath
  fs.readFile(filePath, (err, data) => {
    if (err) {
      throw err; // Throw an error if file reading fails
    }

    // Send the HTTP response
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(data); // Write the content of the file to the response
    response.end(); // End the response

  });

}).listen(8080); // The server listens on port 8080

// Confirmation message that the server is running
console.log('My test server is running on Port 8080.');
