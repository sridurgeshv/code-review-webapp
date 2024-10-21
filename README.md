# Real-Time Code Review and Collaboration

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Demo](#demo)

## Overview

Real-Time Code Review and Collaboration is a tool designed to enhance team productivity by enabling simultaneous code review, suggestions through real-time collaboration.

Unlike conventional tools where users can write and run code but lack real-time synchronization between different users, our app facilitates seamless connections in real-time coding sessions, bridging the gap for true collaboration. This makes it an ideal choice for teams seeking structured, team-based collaboration without syncing issues.

Note - To run the code you should have required language installed in your pc like if you are running python code you should have python installed in your pc.

## Key Features

- **User Profiles and Team Creation**: Customize your experience and organize your team efficiently.
- **Real-time Coding and Commenting**: Utilize WebRTC for seamless, instantaneous collaboration.
- **AI-powered Assistance**: Benefit from intelligent code suggestions and proactive bug detection.
- **Modern Frontend**: Built with React and Monaco Editor for a responsive and intuitive user interface.
- **Robust Backend**: Powered by Node.js with WebSocket connections for real-time data transfer.
- **Isolated Environments**: Work in organized, team-specific spaces for enhanced focus and productivity.

## Architecture

The application's architecture is meticulously organized into several directories, each serving a specific purpose in the overall system design. For a detailed understanding of the system structure, please refer to the architecture diagram below:

![Architecture Diagram](https://github.com/sridurgeshv/code-review-webapp/blob/main/arch.JPG)


## Why Choose Our App?

If you've used Replit or other similar tools, you've experienced their powerful features. However, one common limitation is the lack of structured team-based collaboration without syncing issues. With our app, users can effortlessly connect to a room, code in real time, and enjoy AI-powered assistance — all while working with their team in a more organized, isolated environment.

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- Node.js (version 12.0 or higher)
- npm (version 6.0 or higher)
- An API Key from [Groq](https://groq.com/)

### Installation

Follow these steps to set up the project locally:

- Clone the repository:
```bash
   git clone https://github.com/sridurgeshv/code-review-webapp
   cd code-review-webapp
```

### Frontend Setup

- Set up the frontend:
```bash
cd client
npm install
```

### Backend Setup

- Set up the backend:
```bash
cd server
npm install
```

### API Key Setup

- Visit the [Groq](https://groq.com/) and click on "FREE API KEY".
- Sign in and get your API Key and paste it in the .env file in server directory.

## Usage

To launch the application:

1. Start the frontend :
```bash
cd client
npm start
```

2. In a new terminal window, start the backend :
```bash
cd server
npm run start
```

3. Open your web browser and navigate to http://localhost:3000 to access the application.

## Contributing

We welcome contributions from the community. To contribute:

1. Fork the repository.

2. Create a new branch:
```bash
git checkout -b feature/YourFeatureName
```

3. Make your changes and commit them:
```
git commit -m "Add your message here"
```

4. Push to the branch:
```
git push origin feature/YourFeatureName
```

5. Create a pull request with a detailed description of your changes

Please ensure your code adheres to our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions, feedback, or support, please contact us:

- Email: sridurgeshv@gmail.com, ritikasrivastava456@gmail.com
- Project Repository: https://github.com/sridurgeshv/code-review-webapp

## Video Demo
For a comprehensive overview of the application's features and functionality, please watch our [video demonstration](https://youtu.be/yPwKMofsTlY). This walkthrough provides detailed guidance on effectively using and navigating CodeRev.
