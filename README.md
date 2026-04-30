# FYP

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [.NET SDK](https://dotnet.microsoft.com/download) (v8.0 or higher)
- [Angular CLI](https://angular.dev/tools/cli)

---

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Restore dependencies:
   ```bash
   dotnet restore
   ```
3. Update the database (if using Entity Framework):
   ```bash
   dotnet ef database update
   ```
4. Run the backend:
   ```bash
   dotnet run
   ```
   The backend will usually be available at `http://localhost:5238`.

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Environment Configuration**:
   Create a `.env` file in the `frontend` directory (you can copy `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Ensure the `BACKEND_URL` in `.env` matches your running backend URL.

4. Run the frontend:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200/`.

---

## 🛠️ Key Scripts (Frontend)
- `npm run config`: Generates `src/environments/environment.ts` from `.env`. (Runs automatically with start/build).
- `npm start`: Runs the dev server with automatic environment sync.
- `npm run build`: Builds the production bundle.
- `ng test`: Runs unit tests.

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
