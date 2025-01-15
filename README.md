# Backend Repo Services

## Overview

This repository contains a backend monorepo for the `sti-hub-api`, which consists of four microservices located under the `src/` directory and an `infra/` directory for infrastructure-related components. The architecture is designed to facilitate autonomous development, deployment, and management of each service, allowing for rapid innovation and iteration.

### Key Features

- Microservices Architecture: Each service has its own database and can utilize different frameworks, languages, and tools.
- Containerization: Each microservice is deployed in its own container, ensuring isolation and scalability.
- Event-Driven Consistency: Data consistency across services is maintained using an event-driven approach.
- API Gateway: An API gateway will be used to manage client access to the various services.

## Project Structure

```
sti-hub-api/
├── src/
│   ├── community-engagement/
│   ├── project-management/
│   ├── resource-sharing/
│   └── user-registration/
└── infra/
```


### Microservices Description

#### 1. Community Engagement
```
This microservice focuses on connecting entrepreneurs with essential resources and partners. It provides systems for matchmaking with investors, financial institutions, and business development service (BDS) providers.

Key Features:
1. Matchmaking: Connects entrepreneurs with suitable investors and partners.
2. Deal Room: Facilitates negotiations and deal-making processes.
3. Messaging and Communication: Tools for discussions, negotiations, and support.
4. Event Management
```
#### 2. Project Management
```
This microservice enhances collaboration among stakeholders through effective communication and project management tools.

Key Features:
1. Performance Monitoring and Analytics: Provides insights into project performance metrics.
2. Project Management and Executive Decision Support: Tools to assist in project planning and decision-making.
```
#### 3. Resource Sharing
```
This microservice is pivotal in providing entrepreneurs with access to learning resources, tools, and courses that enhance their skills.

Key Features:
1. Access to a variety of learning resources tailored for entrepreneurs.
2. Tools for skill enhancement through courses and workshops.
3. Grants Opportunities: Information on available grants for entrepreneurs.
4. Research Publication and Access: Provides access to research publications relevant to entrepreneurs.
```
#### 4. User Registration
```
This microservice handles user registration and account management functionalities.

Key Features:
1. User Registration and Account Management: Allows users to create accounts, manage profiles, and maintain security.
2. Investor Directory: A searchable database of potential investors.
3. Financial Institution Directory: Lists financial institutions that can support entrepreneurs.
4. BDS Provider Directory: Directory of business development service providers.
5. Content Sharing and Public Profile: Allows users to share content and showcase their profiles publicly.
```
## Infrastructure

The `infra/` directory contains all infrastructure-related resources necessary for deploying the microservices. This includes configuration files for container orchestration (e.g., Docker Compose), cloud infrastructure scripts, or any other relevant infrastructure as code.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
```bash
1. Docker
2. Docker Compose
3. Node.js / Python / Java (depending on the microservice technology stack)
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/affrentice/sti-hub-api
cd sti-hub-api
```

2. Navigate to the desired microservice directory:
```bash
cd src/community-engagement # or any other service
```

3. Build the Docker container:
```bash
docker build -t community-engagement .
```

4. Run the container:
```bash
docker run -p 8080:8080 community-engagement
```

### Usage

Access the API through the API gateway endpoint. Each microservice will expose its own endpoints as defined in their respective documentation.
