BloodConnect – Blood Donation Management System
BloodConnect is a full-stack web application designed to connect blood donors, people/requesters in need of blood, blood banks, and administrators. It helps manage blood donation requests, donor availability, blood bank inventory, donation activities, and related workflows through a centralized platform.

The project includes an AI-powered chatbot that assists users with BloodConnect features and general blood-donation information using Retrieval-Augmented Generation (RAG).
Features
User Authentication and Profiles
- User registration and login.
- JWT-based authentication using Django REST Framework SimpleJWT.
- Role-based access for Donors, Requesters, Blood Banks, and Admins.
- User profile management.
Donor Module
- Donor profile management.
- Blood group and district-based donor information.
- Donation availability tracking.
- Donation eligibility tracking based on the configured donation cooldown period.
- Donor-related workflows and donation history.
Requester Module
- Create and manage blood requests.
- View request status and relevant updates.
- Find blood donation support based on available system information.
Blood Bank Module
- Blood bank profile management.
- Blood bank verification workflow.
- Blood inventory management.
- Blood request and donation-related operations.
Admin Module
- Administrative management of users and application data.
- Blood bank verification and related administration.
- Management of application workflows.
Locations
- District/location information used across the application.
Notifications
- Notification-related functionality for application workflows.
AI Chatbot
- Floating chatbot available across the application.
- Supports logged-in users and visitors on the landing page.
- Answers questions about BloodConnect and blood donation.
- Retrieval-Augmented Generation (RAG) using a knowledge base.
- Semantic retrieval using ChromaDB.
- Conversational context using previous messages.
- LLM responses generated through the Groq API.
- Chat messages and conversations stored in the backend database.
Technology Stack
Frontend
- React
- JavaScript
- Bootstrap
- Bootstrap Icons
- Axios
- React Router
Backend
- Python
- Django
- Django REST Framework
- Django REST Framework SimpleJWT
Database
- PostgreSQL
AI / Chatbot
- LangChain
- LangChain OpenAI integration
- Groq API
- openai/gpt-oss-20b
- Sentence Transformers (all-MiniLM-L6-v2)
- ChromaDB
- PyPDF
Architecture
React Frontend
    |
    | Axios / REST API
    v
Django REST Framework Backend
    |
    +-- Accounts & Authentication
    +-- Donors
    +-- Requesters
    +-- Blood Banks
    +-- Blood Requests
    +-- Donations
    +-- Inventory
    +-- Locations
    +-- Verification
    +-- Notifications
    +-- Admin Panel
    +-- Chatbot (RAG)
            |
            +-- Knowledge Base Documents
            +-- Sentence Transformers Embeddings
            +-- ChromaDB Vector Store
            +-- Groq LLM API
    |
    v
PostgreSQL Database
Project Structure
The exact app and folder names may vary according to the repository's implementation.
BloodConnect/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── <django-project>/
│   │   └── settings.py
│   ├── accounts/
│   ├── locations/
│   ├── verification/
│   ├── blood_requests/
│   ├── donations/
│   ├── inventory/
│   ├── camps/
│   ├── notifications/
│   ├── admin_panel/
│   └── chatbot/
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── urls.py
│       ├── document_service.py
│       ├── rag_service.py
│       ├── llm_service.py
│       ├── knowledge_base/
│       └── chroma_db/
│
└── frontend/
    ├── package.json
    └── src/
        ├── components/
        │   ├── Chatbot.jsx
        │   └── ...
        ├── services/
        │   └── api.js
        ├── pages/
        └── ...
Getting Started
Prerequisites
Install the following before running the project:
- Python 3.x
- Node.js and npm
- PostgreSQL
- Git
1. Clone the Repository
git clone <repository-url>
cd BloodConnect
2. Backend Setup
Navigate to the backend directory:
cd backend
Create a virtual environment:
python -m venv myvirtualenv
Activate it on Windows:
myvirtualenv\Scripts\activate
Activate it on Linux/macOS:
source myvirtualenv/bin/activate
Install backend dependencies:
pip install -r requirements.txt
3. Environment Configuration
Create a .env file inside the backend directory. Add the environment variables required by your Django settings.

Example:
SECRET_KEY=replace_with_a_secure_secret_key
DEBUG=True

DB_NAME=bloodconnect
DB_USER=your_postgresql_username
DB_PASSWORD=your_postgresql_password
DB_HOST=localhost
DB_PORT=5432

GROQ_API_KEY=your_groq_api_key
The variable names for PostgreSQL should match the names used in the project's Django settings.

Never commit .env files, database passwords, Django secret keys, or API keys to GitHub.
4. PostgreSQL Setup
Create a PostgreSQL database for the project. For example:
CREATE DATABASE bloodconnect;
Update the database credentials in your .env file and ensure that Django's settings.py reads those variables.
5. Run Database Migrations
From the backend directory:
python manage.py makemigrations
python manage.py migrate
6. Create an Admin Account
python manage.py createsuperuser
Follow the prompts to create the Django administrator account.
7. Run the Backend
python manage.py runserver
The Django development server normally runs at:
http://127.0.0.1:8000/
8. Frontend Setup
Open another terminal and navigate to the frontend directory:
cd frontend
Install Node dependencies:
npm install
Start the React development server:
npm run dev
Use the URL displayed by Vite in the terminal to open the frontend.
Chatbot Knowledge Base Setup
The chatbot uses a document-based knowledge base.

Place the supported PDF and TXT knowledge-base files in:
backend/chatbot/knowledge_base/
From the backend directory, initialize or rebuild the vector database using:
python -m chatbot.rag_service
The service loads the documents, splits them into chunks, generates embeddings, and stores them in ChromaDB.

The chatbot uses the following components:
Component	Purpose
Document Service	Loads and splits PDF/TXT knowledge-base documents
Sentence Transformers	Generates document embeddings
ChromaDB	Stores embeddings and retrieves relevant chunks
RAG Service	Retrieves context and prepares the prompt
LLM Service	Sends the prompt to the Groq API and generates a response


Chatbot API
The frontend sends chat requests to the chatbot endpoint configured in the project:
POST /api/chatbot/chat/
Example request:
{
  "message": "Who can donate blood?",
  "conversation_id": null
}
The response includes the conversation ID, the user's message, and the AI response.
Environment Variables
Variable	Purpose
SECRET_KEY	Django secret key
DEBUG	Enables/disables Django debug mode
DB_NAME	PostgreSQL database name
DB_USER	PostgreSQL username
DB_PASSWORD	PostgreSQL password
DB_HOST	PostgreSQL host
DB_PORT	PostgreSQL port
GROQ_API_KEY	API key for the chatbot's Groq LLM


Use the exact environment-variable names expected by the project's settings.
Development Notes
- The backend exposes REST APIs for the React frontend.
- JWT authentication is used for protected endpoints.
- Role-based and object-level permissions should be enforced by the backend.
- The chatbot is intended to provide informational assistance, not medical diagnosis or treatment.
- Users with medical concerns or questions about their personal eligibility should consult a qualified healthcare professional or blood donation centre.
- Anonymous chatbot conversations currently use a nullable user association. A dedicated guest/session identifier should be implemented before production deployment to strengthen isolation of anonymous conversations.
- This repository is a development project. Production deployment requires appropriate security settings, environment configuration, HTTPS, database configuration, and deployment-specific setup.
Future Enhancements
Potential improvements include:
- Production deployment.
- More comprehensive automated tests.
- Stronger anonymous-chat session isolation.
- Additional notification integrations.
- Enhanced analytics and reporting.
- Expanded chatbot knowledge base and features.
License
Add the license applicable to this project before distributing or reusing it.