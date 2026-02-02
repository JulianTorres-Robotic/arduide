M4RK-IDE
========


![last-commit](https://img.shields.io/github/last-commit/JulianTorres-Robotic/M4rk-IDE?style=flat&logo=git&logoColor=white&color=0080ff) ![repo-top-language](https://img.shields.io/github/languages/top/JulianTorres-Robotic/M4rk-IDE?style=flat&color=0080ff) ![repo-language-count](https://img.shields.io/github/languages/count/JulianTorres-Robotic/M4rk-IDE?style=flat&color=0080ff)

_Built with the tools and technologies:_

![Express](https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white) ![JSON](https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white) ![Markdown](https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white) ![Autoprefixer](https://img.shields.io/badge/Autoprefixer-DD3735.svg?style=flat&logo=Autoprefixer&logoColor=white) ![PostCSS](https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=flat&logo=PostCSS&logoColor=white) ![TOML](https://img.shields.io/badge/TOML-9C4121.svg?style=flat&logo=TOML&logoColor=white) ![.ENV](https://img.shields.io/badge/.ENV-ECD53F.svg?style=flat&logo=dotenv&logoColor=black) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black) ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B.svg?style=flat&logo=Nodemon&logoColor=white) ![GNU%20Bash](https://img.shields.io/badge/GNU%20Bash-4EAA25.svg?style=flat&logo=GNU-Bash&logoColor=white)  
![React](https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black) ![MariaDB](https://img.shields.io/badge/MariaDB-003545.svg?style=flat&logo=MariaDB&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=flat&logo=Docker&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white) ![Zod](https://img.shields.io/badge/Zod-3E67B1.svg?style=flat&logo=Zod&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=flat&logo=Vite&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white) ![datefns](https://img.shields.io/badge/datefns-770C56.svg?style=flat&logo=date-fns&logoColor=white) ![React%20Hook%20Form](https://img.shields.io/badge/React%20Hook%20Form-EC5990.svg?style=flat&logo=React-Hook-Form&logoColor=white) ![YAML](https://img.shields.io/badge/YAML-CB171E.svg?style=flat&logo=YAML&logoColor=white)

  

* * *

Table of Contents
-----------------

*   [Overview](#overview)
*   [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Usage](#usage)
    *   [Testing](#testing)

* * *

Overview
--------

M4rk-IDE is an all-in-one web-based development environment tailored for Arduino and embedded systems. It combines visual programming, code editing, and hardware management into a cohesive platform designed for developers and makers alike.

**Why M4rk-IDE?**

This project aims to simplify the Arduino development process by integrating project management, hardware interaction, and code deployment within a modern, extensible architecture. The core features include:

*   🎨 **Visual Programming:** Use Blockly to create Arduino sketches visually, making programming accessible and intuitive.
*   🔌 **Hardware Integration:** Connect and communicate with Arduino boards directly through Web Serial API, enabling real-time debugging and firmware uploads.
*   ☁️ **Project Management:** Manage projects locally or in the cloud with version control, ensuring seamless collaboration and persistence.
*   🚀 **Code Compilation & Deployment:** Compile Arduino code remotely and upload firmware effortlessly, streamlining embedded development workflows.
*   🧱 **Modular UI Components:** Leverage a library of accessible, reusable React components for a cohesive user experience.
*   🔒 **Secure Backend Services:** Handle user authentication, project storage, and firmware compilation with robust backend integrations.

* * *

Getting Started
---------------

### Prerequisites

This project requires the following dependencies:

*   **Programming Language:** TypeScript
*   **Package Manager:** Npm
*   **Container Runtime:** Docker

### Installation

Build M4rk-IDE from the source and install dependencies:

1.  **Clone the repository:**
    
        ❯ git clone https://github.com/JulianTorres-Robotic/M4rk-IDE
        
    
2.  **Navigate to the project directory:**
    
        ❯ cd M4rk-IDE
        
    
3.  **Install the dependencies:**
    

**Using [docker](https://www.docker.com/):**

    ❯ docker build -t JulianTorres-Robotic/M4rk-IDE .
    

**Using [npm](https://www.npmjs.com/):**

    ❯ npm install
    

### Usage

Run the project with:

**Using [docker](https://www.docker.com/):**

    docker run -it {image_name}
    

**Using [npm](https://www.npmjs.com/):**

    npm start
    

### Testing

M4rk-ide uses the {**test\_framework**} test framework. Run the test suite with:

**Using [docker](https://www.docker.com/):**

    echo 'INSERT-TEST-COMMAND-HERE'
    

**Using [npm](https://www.npmjs.com/):**

    npm test
    

* * *

[⬆ Return](#top)

* * *