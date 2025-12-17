# Farmer Parcel Assistant

A chat-based assistant that helps farmers get information about their agricultural parcels through natural language queries. Built for Eco2Angels technical assignment. 

## Deployed application -> not production grade 
http://54.194.249.252:6778 
USE_LLM=true currently

## Features

- **Chat Endpoint** - POST `/message` for natural language queries
- **Account Linking** - Phone number to farmer account linking
- **Parcel Management** - List parcels, view details, get status summaries
- **Report Generation** - Automated periodic reports (POST `/generate-reports`) (Simulated manually by user now)
- **LLM Integration** - Optional Gemini API for enhanced understanding
- **Frontend** - React/TypeScript chat interface
- **Database** - PostgreSQL with proper schema and relationships
- **Tests** - 53 unit tests covering core functionality
- **Postman Tests** - 100 tests covering both endpoints

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: React, TypeScript, Vite
- **Infrastructure**: Docker, Docker Compose, AWS EC2 ubuntu 22.04 deployment
- **LLM**: Google Gemini API (optional)

## Quick Start

**Prerequisites:** Docker, Docker Compose, Git

1. **Clone and setup**
   ```bash
   git clone https://github.com/Alex-Clau/FarmerParcelAssistant-CO2ANGELS.git
   cd FarmerParcelAssistant-CO2ANGELS
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   # Edit both .env files with your configuration
   ```

2. **Start services**
   ```bash
   docker compose up --build -d
   docker compose exec server npm run seed
   ```

3. **Access**
   - Frontend: `http://localhost:6778`
   - Backend: `http://localhost:6777`
   
4. **Stop services** (when needed)
   ```bash
   docker compose down
   ```

**Docker Reset (clean rebuild):**
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

## API Endpoints

### POST `/message`

Send a chat message to the assistant. Test via Postamn or on the application after setting it up.

Via postman: POST http://54.194.249.252:6777/message (for the deployed application) or change the url to localhost
Via deployed application: login with "0741111111" and say "Show me my parcels"

**Request:**
```json
{
  "from": "+40741111111",
  "text": "Show me my parcels"
}
```

**Response:**
```json
{
  "reply": "You have 2 parcels:\nP1 - North Field (10.5 ha, Wheat)"
}
```

**Example Queries:**
- `"Show me my parcels"` - List all parcels
- `"Tell me about parcel P1"` - Get parcel details
- `"How is parcel P1?"` - Get status summary
- `"Set my report frequency to daily"` - Set report frequency

### POST `/generate-reports`

Generate reports for farmers due to receive one today. (With the press of a button or API call)

Via postman: POST http://54.194.249.252:6777/generate-reports (for the deployed application) or change the url to localhost
Via deployed application: press "Generate reports", no phone number needed (Functionality for showcase purposes)

**Response:**
```json
[
  {
    "to": "+40123456789",
    "message": "Your weekly parcel report: Parcel P1 is healthy..."
  }
]
```

## Architecture

**Backend Structure:**
- `controllers/` - Request handlers
- `services/` - Business logic (intent classification, summaries, trends)
- `models/` - Database models
- `routes/` - API routes
- `middleware/` - Account linking checks

**Frontend Structure:**
- `components/` - React components (Chat, Auth(PhoneInput), Message, UI Element(Error Modal logic))
- `hooks/` - Custom hooks for API calls
- `utils/` - Utility functions (phone caching)

## Rule-Based Analysis

The system analyzes parcel indices using thresholds:

**Vegetation:**
- NDVI: >0.75 (Very High), 0.55-0.75 (Good), 0.30-0.55 (Average), <0.30 (Bad)
- NDMI: >0.30 (Good), 0.15-0.30 (Average), <0.15 (Bad/Dry)
- NDWI: >0.25 (Good), 0.10-0.25 (Average), <0.10 (Bad)

**Soil:**
- SOC: >2.5 (High), 1.5-2.5 (Moderate), <1.5 (Low)
- Nitrogen: >1.0 (High), 0.7-1.0 (Adequate), <0.7 (Low)
- pH: 6.0-7.0 (Good/Neutral), 5.5-6.0 (Slightly Acidic), <5.5 (Bad/Acidic)

**Trends:**
- NDVI changes: ±0.1 (overall), ±0.05 (recent)
- Nitrogen depletion: -0.1 (3-week), -0.15 (long-term)

## Testing

**Unit Tests:**
```bash
cd server
npm test
```

53 unit tests covering date formatting, frequency parsing, intent classification, summary generation, and trend analysis.

**Postman Tests:** Import the collection for 100 additional API tests (50 per endpoint).


## Deployment

### AWS EC2 (AWS ACCOUNT NEEDED)

**Free Tier Settings (12 months free):**
- Instance type: t2.micro (1 vCPU, 1GB RAM)
- OS: Ubuntu 22.04 LTS
- Storage: 8GB gp3 or gp2 (within free tier)
- Security group: Open ports 22 (SSH), 6777 (backend), 6778 (frontend)

**Deployment Steps:**

1. **Launch EC2 Instance**
   - Select Ubuntu 22.04 LTS AMI
   - Choose t2.micro 
   - Configure security group:
     - SSH (22) from your IP (recommended: restrict to your IP only)
     - Custom TCP (6777) from anywhere (0.0.0.0/0) - backend
     - Custom TCP (6778) from anywhere (0.0.0.0/0) - frontend
     - Note: For production, restrict ports 6777/6778 to specific IPs or use a load balancer, this is still a dev deployment
   - Create/download key pair (.pem file)
   - Launch instance

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
   ```

3. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose-plugin -y
   sudo usermod -aG docker ubuntu
   newgrp docker  # or logout/login to apply group changes
   ```

4. **Clone Repository**
   ```bash
   git clone <YOUR_REPOSITORY_URL>.git
   cd FarmerParcelAssistant-CO2ANGELS
   ```

5. **Configure Environment Variables**
   ```bash
   # Configure root .env
   cp .env.example .env
   nano .env  # Edit with your values
   
   # Configure frontend .env
   cd frontend
   cp .env.example .env
   # Get EC2 public IP from AWS Console (or use: curl http://169.254.169.254/latest/meta-data/public-ipv4)
   nano .env  # Set VITE_API_URL=http://<EC2-PUBLIC-IP>:6777
   cd ..
   ```

6. **Build and Start Services**
   ```bash
   docker compose up --build -d
   ```

7. **Seed Database**
   ```bash
   docker compose exec server npm run seed
   ```

8. **Verify Deployment**
   ```bash
   docker compose ps  # Check all containers are running
   docker compose logs -f  # View logs
   ```

9. **Access Application**
   - Frontend: `http://<EC2-PUBLIC-IP>:6778`
   - Backend: `http://<EC2-PUBLIC-IP>:6777`

## Troubleshooting

- **Containers won't start**: Check logs with `docker compose logs`
- **Seed fails**: Ensure database container is healthy (`docker compose ps`)
- **Frontend can't connect**: Verify `VITE_API_URL` matches backend URL and port is accessible
- **Port already in use**: Change ports in `.env` or stop conflicting services

## Extending

- **WhatsApp**: Replace POST `/message` with WhatsApp webhook (WhatsApp Business API), `Nginx` reverse-proxy configuration needed for https connection
- **Cron Jobs**: Use `node-cron`/`node-schedule` to auto-schedule `POST /generate-reports` (replacing manual triggers)
- **TIFF Processing**: Use `gdal`/`sharp` to process satellite imagery and calculate indices directly in the backend
- **Multi-LLM**: Add OpenAI/Anthropic support with conversation history and rate-limiting for requests to control API costs

## Environment Variables

See `.env.example` (root) and `frontend/.env.example` for all variables. Key ones:
- **Backend/Database**: `SERVER_PORT`, `POSTGRES_*` variables
- **Frontend**: `VITE_API_URL` (in `frontend/.env`)
- **LLM** (optional): `USE_LLM`, `GEMINI_API_KEY`, `GEMINI_MODEL`
