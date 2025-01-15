# Project Management Microservice

This microservice implements the project management and analytics functionality for the STI Innovation Hub, providing comprehensive tools for project tracking, performance monitoring, and executive decision support. Here's an overview of the microservice and its capabilities:

## Introduction

The Project Management microservice is a Node.js and Express-based application that enables efficient management of STI-funded projects and provides deep insights into platform usage and engagement. It serves both entrepreneurs managing their projects and STI staff tracking overall platform performance and making data-driven decisions.

### Key Features

#### Project Management

- Create and manage STI-funded projects
- Track project milestones and timelines
- Monitor project KPIs and performance metrics
- Manage project stakeholders and permissions
- Handle project documentation and attachments

#### Analytics and Monitoring

- Track platform usage and user engagement
- Monitor connections between different members
- Generate performance insights and reports
- Provide real-time analytics dashboards
- Track user interaction patterns

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/affrentice/sti-hub-api.git
   cd src/project-management
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your environment variables as shared in `.env.example`

   ```
   PORT=3000
   DATABASE_URL=mongodb://localhost:27017/sti_innovation_hub
   ```

4. Start the application:

   ```bash
   npm start
   ```

## Running the Application

To run the microservice:

1. Ensure you're in the project directory
2. Run `npm start` to start the application in production mode
3. The application will start on `http://localhost:3000`

## API Documentation

The API documentation can be found at `/api-docs` after starting the application.

## Testing

To run tests:

```bash
npm test
```

## Contributing

Please feel free to contribute to this project. See the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Affrentice Team](https://affrentice.com/)
- [Node.js Best Practices](https://github.com/i0natan/nodebestpractices)
- [Awesome Serverless Architecture](https://github.com/josoroma/Awesome-Serverless-Architecture)

## Project Structure

```
project-management/
├── bin/
│   └── index.js
├── controllers/
│   ├── analytics.controller.js
│   └── project.controller.js
├── models/
│   ├── Analytics.js
│   └── Project.js
├── routes/
│   ├── v1/
│   │   ├── analytics.routes.js
│   │   ├── project.routes.js
│   ├── v2/
│   │   ├── analytics.routes.js
├── utils/
│   └── analytics.util.js
├── config/
│   └── constants.js
├── validators/
│   └── analytics.validators.js
├── .env
├── package.json
└── README.md
```
