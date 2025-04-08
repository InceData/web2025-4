const http = require('http');
const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Host address')
  .requiredOption('-p, --port <port>', 'Port number')
  .requiredOption('-i, --input <file>', 'Path to input JSON file')
  .parse(process.argv);

const options = program.opts();

fs.readFile(options.input, 'utf8', (err, data) => {
  if (err) {
    console.error('Cannot find input file');
    process.exit(1);
  }

  const jsonData = JSON.parse(data);
  const exchangeRates = jsonData;

  let maxRate = null;
  let maxCurrency = '';

  exchangeRates.forEach((rate) => {
    if (!maxRate || rate.rate > maxRate) {
      maxRate = rate.rate;
      maxCurrency = rate.cc;
    }
  });

  const xmlResponse = `
<rates>
  <maxRate>
    <currency>${maxCurrency}</currency>
    <rate>${maxRate}</rate>
  </maxRate>
</rates>
`;

  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.statusCode = 200;
    res.end(xmlResponse);
  });

  server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}`);
  });
});

