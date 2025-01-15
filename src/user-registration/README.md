# User Registration and Account Management Microservice

This microservice implements user registration, account management, and public profile features for the STI Innovation Hub platform. It allows users to register, manage their profiles, and create public profiles, enabling personalized and secure interactions with the platform's features and services.

## Table of Contents

1. [Introduction](#introduction)
2. [Key Features](#key-features)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Testing](#testing)
8. [Contributing](#contributing)
9. [License](#license)
10. [Acknowledgments](#acknowledgments)

## Introduction

This microservice is part of the STI Innovation Hub ecosystem, focusing on user registration, account management, and public profile creation. It serves as a foundation for other modules, enabling secure and personalized experiences for entrepreneurs, investors, BDS providers, academics, and STI staff.

## Key Features

- User registration and account management
- Public profile creation and customization
- Role-based access control
- Secure authentication and authorization
- Integration with other STI Innovation Hub services

## Prerequisites

- Node.js (version 14.x or higher)
- MongoDB (for data storage)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/affrentice/sti-hub-api.git
   cd src/user-registration
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add your environment variables as shared in `.env.example`
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/sti_innovation_hub
   JWT_SECRET=your_jwt_secret
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

- Affrentice Team
- Node.js Best Practices
- Express.js Documentation

### Project Structure

```
user-registration/
├── bin/
│   └── index.js
├── controllers/
│   ├── profile.controller.js
│   ├── user.controller.js
│   └── token.controller.js
├── models/
│   ├── User.js
│   └── Group.js
├── routes/
│   ├── v1/
│   │   ├── directory.routes.js
│   │   ├── profile.routes.js
│   ├── v2/
│   │   ├── directory.routes.js
├── utils/
│   └── directory.util.js
├── config/
│   └── constants.js
├── middleware/
│   └── passport.js
├── validators/
│   └── checklist.validators.js
├── .env
├── package.json
└── README.md
```
