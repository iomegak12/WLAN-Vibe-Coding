# Contributing to AUTH Service

We love your input! We want to make contributing to the AUTH Service as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Team

This project is maintained by the WLAN Corporation Development Team:

- **Wajeeth**
- **Nadeem**
- **Easwaran**
- **Lakshmi**
- **Ramkumar**

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Request Process

1. Fork the repo and create your branch from `develop`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

### Branch Naming Convention

- Feature branches: `feature/phase-X-description`
- Bug fixes: `bugfix/issue-description`
- Hotfixes: `hotfix/critical-issue`

### Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add user profile update endpoint

- Implemented PUT /api/v1/profile
- Added validation for profile fields
- Updated tests

Closes #123
```

## Code Style

### JavaScript/Node.js

- Use ES6+ features
- Use async/await instead of callbacks
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow existing code formatting

### File Organization

```
src/
├── config/       # Configuration files
├── controllers/  # Route controllers
├── middlewares/  # Express middlewares
├── models/       # Mongoose models
├── routes/       # Route definitions
├── services/     # Business logic
├── utils/        # Utility functions
└── validators/   # Request validation schemas
```

## Testing

- Write unit tests for utilities and services
- Write integration tests for API endpoints
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

## Documentation

- Update README.md for any user-facing changes
- Update CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/)
- Add JSDoc comments for new functions
- Update API documentation in Swagger

## Code Review

All submissions require review before merging:

1. At least one team member must review
2. All CI checks must pass
3. No merge conflicts
4. Branch is up to date with develop

## Reporting Bugs

Report bugs by opening a new issue with:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Error messages/logs**

## Feature Requests

We track feature requests as GitHub issues. Provide:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: What other approaches did you think about?

## Environment Setup

1. Install Node.js v22+
2. Install MongoDB 6.x
3. Clone the repository
4. Copy `.env.example` to `.env` and configure
5. Run `npm install`
6. Run `npm run seed` to populate database
7. Run `npm run dev` to start development server

## Questions?

Feel free to reach out to any of the development team members.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the AUTH Service! 🚀
