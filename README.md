# OscKeep

This project is a note-taking application (OscKeep) with a Node.js server, React web client, and Android client source code.

## Project Structure

- `server/`: Node.js Express API with SQLite database.
- `web/`: React application built with Vite and TailwindCSS.
- `android/`: Android Studio project source code (Kotlin/Jetpack Compose).
- `docker-compose.yml`: Docker stack configuration.

## Setup & Deployment

### Prerequisites
- Docker & Docker Compose
- Portainer (optional, for stack management)

### Running with Docker Compose

1.  Navigate to the project root.
2.  Run:
    ```bash
    docker-compose up --build -d
    ```
3.  Access the applications:
    - **Web Client**: http://localhost:8088
    - **API Server**: http://localhost:3500

### Android Client

The `android/` directory contains the source code for the Android application.
1.  Open Android Studio.
2.  Select "Open an existing project" and choose the `android` folder.
3.  Sync Gradle and Build.
4.  Run on an Emulator.
    - Note: The Android app is configured to connect to `http://10.0.2.2:3500` (localhost for Android Emulator).

## Features

- **Create Notes**: Add title, content, and color.
- **Edit Notes**: Update existing notes.
- **Delete Notes**: Remove notes.
- **Responsive Design**: Web interface mimics Google Keep's masonry layout.
- **Dark Mode**: Default dark theme.

## Repository

Hosted at: https://github.com/adri6412/osckeep
