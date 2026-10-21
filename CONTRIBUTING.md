# Contributing to Fuenzer Research 🔬

Thank you for your interest in contributing to **Fuenzer Research**! We welcome contributions of all kinds—from reporting bugs and improving documentation to submitting new features and performance optimizations.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Environment Setup](#development-environment-setup)
  - [Prerequisites](#prerequisites)
  - [Repository Setup](#repository-setup)
  - [Backend Setup (Go)](#backend-setup-go)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Git Workflow & Conventions](#git-workflow--conventions)
  - [Branch Naming](#branch-naming)
  - [Commit Message Format](#commit-message-format)
- [Code Style & Standards](#code-style--standards)
  - [Backend Standards (Go)](#backend-standards-go)
  - [Frontend Standards (TypeScript / React)](#frontend-standards-typescript--react)
- [Pull Request Guidelines](#pull-request-guidelines)

---

## Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure an inclusive, respectful, and productive environment for all community members.

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing [GitHub Issues](https://github.com/Yogs4R/fuenzer-research/issues) to see if the problem has already been reported.

When filing a bug report, include:
* A clear and descriptive title.
* Detailed steps to reproduce the issue.
* Expected vs. actual behavior.
* Screenshots or console/terminal output if applicable.
* Your operating system, browser, or environment details.

> **Note**: For security vulnerabilities, please refer to our [Security Policy](SECURITY.md) instead of creating a public issue.

### Suggesting Enhancements

Feature requests and enhancement ideas are encouraged! When submitting a proposal:
* Clearly explain the problem or motivation.
* Describe the desired solution or feature workflow.
* Consider how it impacts Indonesian and international academic research workflows.

### Submitting Pull Requests

1. Search existing issues and PRs to ensure your work does not duplicate existing efforts.
2. Fork the repository and create your feature branch from `main`.
3. Keep pull requests focused on a single topic or bug fix.

---

## Development Environment Setup

### Prerequisites

* **Go**: Version `1.26` or higher
* **Node.js**: Version `20.x` or higher
* **npm**: Version `10.x` or higher
* **Git**: Latest stable version
* *(Optional)* **Docker**: For running containerized tests

### Repository Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/fuenzer-research.git
   cd fuenzer-research
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/Yogs4R/fuenzer-research.git
   ```

### Backend Setup (Go)

The backend is built with Golang and the Fiber framework.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your environment configuration file:
   ```bash
   cp .env.example .env  # Or create .env with required keys
   ```
   Configure necessary environment variables (such as `PORT`, `GEMINI_API_KEY`, etc.).
3. Download dependencies:
   ```bash
   go mod download
   ```
4. Run the backend server:
   ```bash
   go run ./cmd/api
   ```
   The backend API will start on `http://localhost:8080`.

### Frontend Setup (React + Vite)

The frontend is built using React 19, TypeScript, Tailwind CSS, and Vite.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be accessible at `http://localhost:5173`.

---

## Git Workflow & Conventions

### Branch Naming

Create concise, lowercase branch names with prefixes describing the scope:
* `feat/<feature-name>`: For new features (e.g., `feat/sinta-filter-export`)
* `fix/<bug-name>`: For bug fixes (e.g., `fix/gemini-stream-timeout`)
* `docs/<topic>`: For documentation updates (e.g., `docs/update-contributing`)
* `chore/<task>`: For tooling, dependencies, or maintenance (e.g., `chore/bump-deps`)
* `refactor/<target>`: For refactoring without functional changes (e.g., `refactor/search-pipeline`)

### Commit Message Format

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

#### Allowed Types:
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation only changes
* `style`: Changes that do not affect the meaning of the code (formatting, linting)
* `refactor`: A code change that neither fixes a bug nor adds a feature
* `perf`: A code change that improves performance
* `test`: Adding or correcting tests
* `chore`: Maintenance tasks, dependency updates, build configs
* `ci`: Changes to CI/CD workflows

*Examples:*
* `feat(backend): implement literature synthesis caching`
* `fix(frontend): resolve mobile viewport layout shift`
* `chore(deps): update golang.org/x/net to v0.60.0`

---

## Code Style & Standards

### Backend Standards (Go)

* Format all code with `gofmt` or `goimports`.
* Run static analysis prior to pushing:
  ```bash
  go vet ./...
  ```
* Ensure all dependencies in `go.mod` and `go.sum` are tidy:
  ```bash
  go mod tidy
  ```
* Never commit secrets, service account credentials, or database connection strings.

### Frontend Standards (TypeScript / React)

* Follow strict TypeScript typing; avoid using `any` whenever possible.
* Verify linting and build checks:
  ```bash
  npm run lint
  npm run build
  ```
* Maintain accessibility (a11y) standards, responsive breakpoints, and dark mode consistency.

---

## Pull Request Guidelines

Before opening a Pull Request, please ensure:
1. Your branch is rebased on the latest `main` branch.
2. Code builds cleanly on both backend (`go build ./...`) and frontend (`npm run build`).
3. Automated linters and formatters pass without warnings.
4. No sensitive credentials or unexpected temporary files are included in the diff.
5. Provide a descriptive PR title and summary explaining what was changed and why.

Once submitted, automated CI checks (Trivy Container Scan, Gitleaks Secret Scanning, etc.) will run against your pull request. A maintainer will review your contribution and provide feedback.

---

Thank you for helping make **Fuenzer Research** a better tool for the scientific and academic community! 🚀
