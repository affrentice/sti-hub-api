# Resource Sharing Microservice

This microservice implements the resource sharing functionality for the STI Innovation Hub, including features for grants opportunities and research publications. Here's an overview of the microservice and how to run it:

## Introduction

The Resource Sharing microservice is a Node.js and Express-based application that provides functionality for publishing research papers and accessing relevant publications. It also includes features for entrepreneurs to find grant opportunities and for Business Development Service (BDS) providers to discover potential donors.

### Key Features

- Publish and manage research publications
- Search and filter publications
- View grant opportunities
- Facilitate connections between entrepreneurs and donors/BDS providers

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/affrentice/sti-hub-api.git
   cd src/resource-sharing
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
resource-sharing/
├── bin/
│   └── index.js
├── controllers/
│   ├── grant.controller.js
│   └── research.controller.js
├── models/
│   ├── Grant.js
│   └── Publication.js
├── routes/
│   ├── v1/
│   │   ├── grant.routes.js
│   │   ├── research.routes.js
│   ├── v2/
│   │   ├── grant.routes.js
├── utils/
│   └── grant.util.js
├── config/
│   └── constants.js
├── validators/
│   └── grant.validators.js
├── .env
├── package.json
└── README.md
```
