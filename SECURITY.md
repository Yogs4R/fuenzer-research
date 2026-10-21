# Security Policy

## Overview

Security is a top priority for **Fuenzer Research**. As an academic research platform integrating AI synthesis (Google Gemini), local Indonesian academic databases (SINTA, Garuda), and international research repositories (OpenAlex), we take the security and integrity of our codebase, container images, and user data seriously.

## Supported Versions

We actively provide security patches, dependency updates, and container scanning fixes for the following versions:

| Version | Supported          | Security Scan Status |
| ------- | ------------------ | -------------------- |
| `main`  | :white_check_mark: | Active CI Scanning (Trivy, Gitleaks, Dependabot) |
| `< 1.0` | :x:                | Unsupported (Please update to latest `main`) |

## Reporting a Vulnerability

If you discover a security vulnerability within Fuenzer Research, please follow responsible disclosure principles and **do not** open a public issue.

### Preferred Reporting Method
Please report security vulnerabilities privately via GitHub's Private Vulnerability Reporting:
1. Navigate to the **[Security Advisories](https://github.com/Yogs4R/fuenzer-research/security/advisories)** page.
2. Click **"Report a vulnerability"** to submit a private report.

### Alternative Contact
If GitHub Private Reporting is unavailable, you may contact the repository maintainer directly:
* **Maintainer Contact**: `151484427+Yogs4R@users.noreply.github.com`

### What to Include in Your Report
To help us triage and resolve the issue quickly, please provide:
* **Description**: Detailed explanation of the vulnerability and its potential impact.
* **Reproduction Steps**: Clear, reproducible steps or a minimal Proof of Concept (PoC).
* **Affected Component**: Affected file, endpoint, or dependency (e.g., backend API, frontend bundle, Dockerfile, or Cloud Run configuration).
* **Suggested Fix**: Remediation suggestions or patches (if available).

### Response Timeline
* **Initial Acknowledgment**: Within **48 hours** of receiving the report.
* **Triage & Assessment**: Within **5 business days**, confirming severity and scope.
* **Fix & Release**: We strive to publish patches as quickly as possible, coordinated with the reporter.
* **Public Disclosure**: A security advisory (CVE if applicable) will be published after a fix has been verified and deployed.

## Automated Security & CI/CD Pipeline

The repository enforces multiple layers of automated security scanning on every push and pull request targeting `main`:

1. **Container Image Scanning (Trivy)**:
   * Automated vulnerability scanning of production container images.
   * Fails pipeline on unresolved `CRITICAL` or `HIGH` vulnerabilities across OS and Go module libraries.
2. **Secret Scanning (Gitleaks)**:
   * Scans entire commit history and PR diffs to prevent leakage of API keys, tokens, or private credentials.
3. **Automated Dependency Updates (Dependabot)**:
   * Continuous monitoring of Go modules and NPM dependencies for known CVEs.

## Security Best Practices for Contributors

* **Never commit secrets**: Never hardcode API keys (such as `GEMINI_API_KEY`, Firebase credentials, or service account JSONs) in the source code. Always use environment variables and `.env` files (which must remain in `.gitignore`).
* **Keep dependencies updated**: Always verify dependencies against current CVE databases before submitting pull requests.
* **Validate & sanitize inputs**: Ensure backend endpoints properly validate query parameters and payloads to prevent DoS, injection, or unexpected memory consumption.

## Safe Harbor

We consider security research conducted in good faith under this policy to be authorized. We will not pursue legal action against researchers who:
* Make a good faith effort to avoid privacy violations, destruction of data, and service interruption.
* Give us reasonable time to remediate vulnerabilities before disclosing them publicly.
* Do not access, modify, or retain unnecessary user or private data.
