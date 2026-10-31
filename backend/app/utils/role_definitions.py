"""
Role-specific definitions, evaluation benchmarks, and example job descriptions.
"""

SUPPORTED_ROLES = [
    "Software Developer",
    "Data Analyst",
    "AI/ML Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Other",
]

ROLE_EVALUATION_CRITERIA = {
    "Software Developer": {
        "core_domains": [
            "Data Structures & Algorithms (DSA)",
            "Object-Oriented Programming (OOP)",
            "Core Programming Languages (Python, Java, C++, or Go)",
            "Git & GitHub Version Control",
            "Web Development Fundamentals",
            "Relational & NoSQL Database Knowledge",
            "Software Engineering Fundamentals (Testing, Clean Code, CI/CD)",
        ],
        "focus_areas": "Assess algorithmic problem solving, clean architecture, version control, database querying, and software design principles.",
    },
    "Data Analyst": {
        "core_domains": [
            "Python (Data Analysis libraries)",
            "SQL (Complex Queries, Joins, Aggregations, Window Functions)",
            "Advanced Excel (Pivot Tables, VLOOKUP, Power Query)",
            "Business Intelligence (Power BI or Tableau)",
            "Applied Statistics & Hypothesis Testing",
            "Data Visualization & Storytelling",
            "Data Cleaning, Wrangling & ETL Processes",
        ],
        "focus_areas": "Assess SQL query proficiency, metric calculation, dashboard design, business acumen, and statistical rigor.",
    },
    "AI/ML Engineer": {
        "core_domains": [
            "Python for Machine Learning",
            "Machine Learning Algorithms (Supervised, Unsupervised)",
            "Deep Learning & Neural Networks",
            "Data Preprocessing & Feature Engineering",
            "NumPy, Pandas & Scientific Computing",
            "Scikit-learn",
            "TensorFlow or PyTorch Frameworks",
            "Generative AI & LLM Fundamentals (Prompting, Fine-Tuning, RAG, Embeddings)",
        ],
        "focus_areas": "Assess model training, validation pipelines, ML frameworks, mathematical foundations, and modern Generative AI / LLM workflows.",
    },
    "Frontend Developer": {
        "core_domains": [
            "HTML5 Semantic Structure & Modern CSS3",
            "JavaScript (ES6+) & TypeScript",
            "Modern Frameworks (React, Next.js, Vue)",
            "Responsive Web Design & Mobile-First Layouts",
            "State Management (Redux, Zustand, Context)",
            "Web Performance & Core Web Vitals",
            "REST & GraphQL Integration",
        ],
        "focus_areas": "Assess UI/UX fidelity, modern component architecture, state management, client performance, and responsive styling.",
    },
    "Backend Developer": {
        "core_domains": [
            "Server Frameworks (FastAPI, Express, Django, Spring Boot)",
            "RESTful & GraphQL API Design",
            "Databases (PostgreSQL, MySQL, MongoDB)",
            "Authentication & Security (JWT, OAuth2, RBAC)",
            "Caching & Performance (Redis)",
            "System Design & Scalability Principles",
            "Containerization (Docker) & Microservices",
        ],
        "focus_areas": "Assess API performance, database indexing and schema design, security best practices, and distributed systems architecture.",
    },
    "Full Stack Developer": {
        "core_domains": [
            "Frontend Ecosystem (React/Vue, TypeScript, CSS/Tailwind)",
            "Backend Systems (Node.js/Python/Go, REST APIs)",
            "Database Modeling & ORMs (PostgreSQL, Prisma, SQLAlchemy)",
            "DevOps & Deployment (Docker, CI/CD, Cloud Hosting)",
            "End-to-End Testing & Authentication Flows",
        ],
        "focus_areas": "Assess cohesive end-to-end feature delivery, full product lifecycle understanding, and bridging client and server architectures.",
    },
    "Other": {
        "core_domains": [
            "Core Problem-Solving & Domain Expertise",
            "Collaboration & Communication",
            "Tools & Technology Alignment with Target Job Description",
            "Execution & Project Impact",
        ],
        "focus_areas": "Evaluate candidate qualifications strictly against explicit job description requirements without introducing irrelevant tech constraints.",
    },
}

EXAMPLE_JOB_DESCRIPTIONS = {
    "Software Developer": """Job Title: Software Developer (Junior to Mid-Level)
Location: Remote / Hybrid
Role Overview:
We are seeking an enthusiastic Software Developer to join our core engineering team. You will design, build, and maintain high-performing software applications and backend services.

Key Responsibilities:
- Develop robust, scalable applications using Python, Java, or C++.
- Write clean, maintainable, and well-tested code following OOP principles.
- Design and optimize relational database schemas in PostgreSQL / MySQL.
- Collaborate using Git/GitHub for branching, pull requests, and peer code reviews.
- Implement RESTful APIs and integrate third-party services.
- Troubleshoot, debug, and optimize application performance and data structures.

Requirements:
- Bachelor's degree in Computer Science, Software Engineering, or related technical field.
- Strong knowledge of Data Structures and Algorithms (DSA) and Object-Oriented Programming (OOP).
- Proficiency in Python, Java, or C++.
- Hands-on experience with SQL databases and Git.
- Familiarity with CI/CD pipelines, unit testing, and Docker is a plus.""",

    "Data Analyst": """Job Title: Data Analyst
Location: Hybrid
Role Overview:
We are looking for a detail-oriented Data Analyst to turn raw business data into actionable insights, dashboards, and automated reports that empower executive decision-making.

Key Responsibilities:
- Extract, clean, and transform large datasets using SQL and Python (Pandas, NumPy).
- Build and maintain interactive dashboards in Power BI or Tableau.
- Perform statistical analysis and A/B test evaluation to identify business growth trends.
- Write complex SQL queries involving multi-table joins, subqueries, and window functions.
- Collaborate with cross-functional teams to translate business questions into analytical reports.

Requirements:
- Bachelor's degree in Statistics, Mathematics, Computer Science, Economics, or related field.
- Proven experience with SQL and relational databases.
- Hands-on expertise in Power BI or Tableau for data visualization.
- Proficiency in Python for data wrangling and exploratory data analysis.
- Advanced Microsoft Excel skills (Pivot Tables, Power Query, advanced formulas).""",

    "AI/ML Engineer": """Job Title: AI / Machine Learning Engineer
Location: Remote
Role Overview:
Join our AI Innovation Lab to develop state-of-the-art predictive models and generative AI solutions that solve complex customer problems at scale.

Key Responsibilities:
- Design, train, and deploy machine learning and deep learning models using PyTorch or TensorFlow.
- Build end-to-end data pipelines for preprocessing, feature extraction, and model evaluation.
- Implement Generative AI applications utilizing LLMs, prompt engineering, RAG pipelines, and vector databases.
- Optimize model latency, memory footprint, and inference pipelines for production deployment.
- Track experiments using MLOps tools and conduct rigorous hyperparameter tuning.

Requirements:
- Degree in Computer Science, Artificial Intelligence, Data Science, or related discipline.
- Deep expertise in Python, Scikit-learn, NumPy, and Pandas.
- Strong practical experience with PyTorch or TensorFlow for neural network architectures.
- Experience with modern Generative AI frameworks, vector databases (e.g., Chroma, Pinecone), and OpenAI/Gemini APIs.
- Solid understanding of probability, linear algebra, loss functions, and evaluation metrics (F1, AUC-ROC, BLEU).""",

    "Frontend Developer": """Job Title: Frontend Developer (React / TypeScript)
Location: Remote
Role Overview:
We are looking for a talented Frontend Developer who loves crafting slick, responsive, and accessible user interfaces that delight thousands of daily users.

Key Responsibilities:
- Build responsive, interactive web interfaces using React 18+, TypeScript, and Tailwind CSS.
- Manage complex application state using modern state libraries (Zustand, Redux Toolkit, or React Query).
- Optimize client-side performance, Core Web Vitals, and asset delivery.
- Collaborate closely with UI/UX designers to implement design system tokens and micro-interactions.
- Write component unit and integration tests using Jest and React Testing Library.

Requirements:
- 1-3+ years of professional or strong project experience in modern frontend development.
- Strong proficiency in JavaScript (ES6+), TypeScript, HTML5, and CSS3 / Tailwind.
- Deep hands-on experience with React lifecycle, custom hooks, and component composition.
- Understanding of web performance, browser rendering, and RESTful API consumption.""",

    "Backend Developer": """Job Title: Backend Developer (Python / FastAPI / Node.js)
Location: Hybrid
Role Overview:
We are hiring a Backend Developer to architect scalable microservices, design secure APIs, and manage distributed database infrastructure.

Key Responsibilities:
- Design, build, and maintain high-throughput RESTful APIs using FastAPI or Node.js.
- Model, query, and optimize relational (PostgreSQL) and NoSQL (MongoDB, Redis) databases.
- Implement robust authentication, authorization, and rate-limiting (JWT, OAuth2).
- Containerize services with Docker and configure automated CI/CD deployments.
- Monitor service health, implement structured logging, and optimize database indexing.

Requirements:
- Proven experience building backend applications in Python (FastAPI/Django) or Node.js.
- Strong command of SQL, database indexing, transactions, and ORM tools (SQLAlchemy, Prisma).
- Experience with Redis caching and asynchronous job queues (Celery, BullMQ).
- Solid grasp of software security, API best practices, and microservice architectures.""",

    "Full Stack Developer": """Job Title: Full Stack Developer
Location: Hybrid / Remote
Role Overview:
We are seeking a versatile Full Stack Developer capable of owning features end-to-end, from dynamic React frontends to robust cloud-hosted backend APIs.

Key Responsibilities:
- Develop modern responsive user interfaces using React, Next.js, and TypeScript.
- Architect and deploy scalable backend microservices and REST APIs in Python or Node.js.
- Design database schemas in PostgreSQL and manage migrations reliably.
- Build authentication, user management, and payment/third-party integrations.
- Maintain CI/CD pipelines, containerize apps with Docker, and deploy to modern cloud platforms.

Requirements:
- Strong full-stack development experience across both client and server codebases.
- Proficiency in React, TypeScript, and modern styling frameworks (Tailwind CSS).
- Strong backend skills in Python (FastAPI) or Node.js (Express/NestJS).
- Hands-on experience with SQL/NoSQL databases and Docker.
- Strong problem-solving mindset and comfort working across the entire development stack.""",
}

def get_role_prompt_guidance(role: str) -> str:
    """Returns specific evaluation instructions for the Gemini prompt."""
    criteria = ROLE_EVALUATION_CRITERIA.get(role, ROLE_EVALUATION_CRITERIA["Other"])
    domains_str = "\n".join([f"- {domain}" for domain in criteria["core_domains"]])
    return f"""Target Role: {role}
Core Competency Domains for this Role:
{domains_str}
Role-Specific Evaluation Focus:
{criteria['focus_areas']}
Crucial Instruction: Do NOT penalize the candidate for technologies that are irrelevant to this target role. Focus evaluation strictly on the candidate's alignment with {role} requirements and the provided job description."""
