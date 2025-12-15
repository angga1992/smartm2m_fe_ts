import 'dotenv/config';
import https from 'https';

const CANDIDATE_INFO = {
  name: "Angga Mulya Sasmita",
  email: "anggamulya.ghazy@gmail.com",
  repo_url: "https://github.com/angga1992/smartm2m_fe_ts"
};

const API_ENDPOINT = "https://fe-test-server.vercel.app/api/send-quiz";
const USERNAME = "fe-test-candidate";
const PASSWORD = process.env.SECRET_HASH;

const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

const payload = JSON.stringify(CANDIDATE_INFO);

const url = new URL(API_ENDPOINT);

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Authorization': `Basic ${credentials}`
  }
};

function submitQuiz() {

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Response Status: ${res.statusCode}\n`);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        if (data) {
          try {
            const response = JSON.parse(data);
            console.log('Server Response:', response);
          } catch (e) {
            console.log('Server Response:', data);
          }
        }
      } else {
        console.error(`Status Code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`Error: ${error.message}\n`);
  });

  req.write(payload);
  req.end();
}

submitQuiz();