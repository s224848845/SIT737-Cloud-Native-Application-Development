const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = "/app/data";
const VISITS_FILE = path.join(DATA_DIR, "visits.json");

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readVisits() {
  if (!fs.existsSync(VISITS_FILE)) {
    fs.writeFileSync(VISITS_FILE, JSON.stringify({ visits: 0 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(VISITS_FILE, "utf8"));
}

function saveVisits(data) {
  fs.writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2));
}

const resources = [
  {
    id: 1,
    name: "CloudDeakin",
    description: "Access unit content, announcements, learning materials, and assessments.",
    url: "https://d2l.deakin.edu.au"
  },
  {
    id: 2,
    name: "OnTrack",
    description: "Submit practical tasks and review tutor feedback for project-based units.",
    url: "https://ontrack.deakin.edu.au"
  },
  {
    id: 3,
    name: "StudentConnect",
    description: "Manage enrolment, fees, personal details, course progress, and results.",
    url: "https://studentconnect.deakin.edu.au"
  },
  {
    id: 4,
    name: "DeakinSync",
    description: "Central student dashboard for accessing Deakin systems and services.",
    url: "https://sync.deakin.edu.au"
  },
  {
    id: 5,
    name: "Deakin Library",
    description: "Search books, journals, databases, referencing guides, and study support.",
    url: "https://www.deakin.edu.au/library"
  },
  {
    id: 6,
    name: "Student Webmail",
    description: "Access your Deakin student email and university communications.",
    url: "https://www.deakin.edu.au/students/help/about-clouddeakin/student-email"
  }
];

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Deakin Student Resource API</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: linear-gradient(135deg, #e8f1ff, #f7f9fc);
      color: #1f2937;
    }

    header {
      background: #003f7f;
      color: white;
      padding: 32px 20px;
      text-align: center;
    }

    header h1 {
      margin: 0;
      font-size: 34px;
    }

    header p {
      margin-top: 10px;
      font-size: 16px;
    }

    .container {
      max-width: 1100px;
      margin: 30px auto;
      padding: 0 20px;
    }

    .status-card {
      background: white;
      padding: 20px;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .badge {
      background: #dcfce7;
      color: #166534;
      padding: 8px 14px;
      border-radius: 999px;
      font-weight: bold;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    input {
      flex: 1;
      min-width: 240px;
      padding: 12px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 15px;
    }

    button {
      background: #0057b8;
      color: white;
      border: none;
      padding: 12px 18px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: bold;
    }

    button:hover {
      background: #003f7f;
    }

    .visit-box {
      background: white;
      padding: 18px 20px;
      border-radius: 14px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      margin-bottom: 24px;
    }

    .visit-box strong {
      color: #003f7f;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
    }

    .card {
      background: white;
      padding: 22px;
      border-radius: 16px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    }

    .card h3 {
      margin-top: 0;
      color: #003f7f;
    }

    .card p {
      font-size: 14px;
      line-height: 1.5;
    }

    .card a {
      display: inline-block;
      margin-top: 10px;
      color: #0057b8;
      font-weight: bold;
      text-decoration: none;
    }

    .api-box {
      margin-top: 30px;
      background: #111827;
      color: #d1d5db;
      padding: 20px;
      border-radius: 14px;
      font-family: monospace;
      overflow-x: auto;
    }

    footer {
      text-align: center;
      margin: 35px 0 20px;
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>

  <header>
    <h1>Deakin Student Resource API</h1>
    <p>A cloud-native REST API service for accessing common Deakin student platforms</p>
  </header>

  <main class="container">
    <section class="status-card">
      <div>
        <h2>API Dashboard</h2>
        <p>This interface consumes the same REST API endpoints used by external clients.</p>
      </div>
      <span class="badge">API Running</span>
    </section>

    <section class="visit-box">
      <strong>Persistent Visit Counter:</strong>
      <span id="visitCount">Loading...</span>
      <button onclick="loadVisits()" style="margin-left: 12px;">Update Counter</button>
    </section>

    <section class="controls">
      <input type="text" id="searchInput" placeholder="Search resources, e.g. CloudDeakin, OnTrack..." />
      <button onclick="loadResources()">Refresh Resources</button>
    </section>

    <section id="resourceGrid" class="grid"></section>

    <section class="api-box">
      <strong>Available API Endpoints</strong><br><br>
      GET /health<br>
      GET /resources<br>
      GET /resources/:id<br>
      GET /visits
    </section>
  </main>

  <footer>
    SIT737 Cloud Native Application Development
  </footer>

  <script>
    let allResources = [];

    async function loadResources() {
      const response = await fetch('/resources');
      const data = await response.json();
      allResources = data.resources;
      displayResources(allResources);
    }

    async function loadVisits() {
      const response = await fetch('/visits');
      const data = await response.json();
      document.getElementById('visitCount').textContent = data.visits + ' visits stored on persistent volume';
    }

    function displayResources(resources) {
      const grid = document.getElementById('resourceGrid');
      grid.innerHTML = '';

      resources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = \`
          <h3>\${resource.name}</h3>
          <p>\${resource.description}</p>
          <a href="\${resource.url}" target="_blank">Open Resource →</a>
        \`;

        grid.appendChild(card);
      });
    }

    document.getElementById('searchInput').addEventListener('input', function(event) {
      const searchTerm = event.target.value.toLowerCase();

      const filteredResources = allResources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm)
      );

      displayResources(filteredResources);
    });

    loadResources();
    loadVisits();
  </script>

</body>
</html>
  `);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "deakin-resource-api"
  });
});

app.get("/resources", (req, res) => {
  res.json({
    count: resources.length,
    resources: resources
  });
});

app.get("/resources/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const resource = resources.find((item) => item.id === id);

  if (!resource) {
    return res.status(404).json({
      error: "Resource not found",
      message: `No Deakin resource found with ID ${id}`
    });
  }

  res.json(resource);
});

app.get("/visits", (req, res) => {
  const data = readVisits();
  data.visits += 1;
  saveVisits(data);

  res.json({
    message: "Persistent visit counter updated",
    visits: data.visits
  });
});

app.listen(PORT, () => {
  console.log(`Deakin Student Resource API running on port ${PORT}`);
});