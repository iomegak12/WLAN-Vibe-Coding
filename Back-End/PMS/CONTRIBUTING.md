# Contributing to PMS Service

We're glad you're interested in contributing to the Product Management System (PMS)! This document provides guidelines for contributing to the project.

## Development Team

- **Ramkumar** - Tech Lead
- **Wajeeth** - Backend Developer
- **Nadeem** - Backend Developer
- **Easwaran** - Backend Developer
- **Lakshmi** - Backend Developer

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Commit Message Guidelines](#commit-message-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the team and project
- Show empathy towards other team members

## Getting Started

### Prerequisites

- Python 3.12+
- MongoDB 6.x (running in Docker container)
- Git
- VS Code (recommended)

### Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PMS
   ```

2. **Create virtual environment**
   ```bash
   python -m venv env
   ```

3. **Activate virtual environment**
   ```bash
   # Windows
   .\env\Scripts\activate
   
   # Linux/Mac
   source env/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   ```bash
   cp .env.sample .env
   # Edit .env with your configuration
   ```

6. **Run the application**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 5002
   ```

## Development Workflow

### Branch Naming Convention

- `feature/<feature-name>` - For new features
- `fix/<bug-name>` - For bug fixes
- `refactor/<refactor-name>` - For code refactoring
- `docs/<doc-name>` - For documentation updates
- `chore/<task-name>` - For maintenance tasks

**Examples:**
- `feature/category-management`
- `fix/sku-generation-bug`
- `refactor/error-handling`
- `docs/api-endpoints`
- `chore/update-dependencies`

### Development Process

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow code style guidelines
   - Add comments where necessary

3. **Test your changes**
   - Test manually using Thunder Client/Postman
   - Ensure no breaking changes
   - Verify error handling

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add category creation endpoint"
   ```

5. **Push to remote**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use descriptive PR title
   - Add detailed description
   - Link related issues
   - Request review from team members

## Code Style Guidelines

### Python Style Guide

Follow **PEP 8** guidelines:

#### Import Order
```python
# Standard library imports
import os
import sys
from datetime import datetime

# Third-party imports
from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

# Local application imports
from app.config.settings import settings
from app.utils.logger import logger
```

#### Naming Conventions
```python
# Classes: PascalCase
class ProductService:
    pass

# Functions and variables: snake_case
def get_product_by_id(product_id: str):
    pass

# Constants: UPPER_SNAKE_CASE
MAX_UPLOAD_SIZE = 5242880

# Private methods: _leading_underscore
def _validate_category(self, category_id: str):
    pass
```

#### Type Hints
Always use type hints:
```python
from typing import Optional, List, Dict

async def get_products(
    page: int = 1,
    limit: int = 10,
    category_id: Optional[str] = None
) -> Dict[str, any]:
    pass
```

#### Docstrings
Use Google-style docstrings:
```python
def create_product(product_data: dict) -> dict:
    """
    Create a new product in the database.
    
    Args:
        product_data (dict): Product information including name, SKU, etc.
    
    Returns:
        dict: Created product document with generated ID
    
    Raises:
        ValueError: If product_data is invalid
        DuplicateError: If SKU already exists
    """
    pass
```

#### Function Length
- Keep functions small and focused (max 50 lines)
- Single Responsibility Principle
- Extract complex logic into separate functions

#### Code Formatting
- Use 4 spaces for indentation
- Maximum line length: 100 characters
- Use blank lines to separate logical sections

### FastAPI Best Practices

#### Route Definitions
```python
@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category",
    description="Create a new product category with auto-generated code"
)
async def create_category(
    category: CategoryCreate,
    current_user: dict = Depends(get_current_user)
) -> CategoryResponse:
    pass
```

#### Dependency Injection
```python
# Good
async def get_products(
    db: AsyncIOMotorClient = Depends(get_database),
    current_user: dict = Depends(get_current_user)
):
    pass

# Avoid
async def get_products():
    db = get_database()  # Don't do this
```

#### Error Handling
```python
# Use custom exceptions
from app.utils.exceptions import NotFoundError, ValidationError

# Raise with meaningful messages
raise NotFoundError(f"Product with ID {product_id} not found")
```

## Commit Message Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring (no functionality change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)
- `perf`: Performance improvements
- `style`: Code style changes (formatting, missing semicolons, etc.)

### Examples

```
feat(product): add SKU auto-generation functionality

Implemented SKU generation with pattern CAT-SUBCAT-BRAND-SEQUENCE.
SKU uniqueness is validated before product creation.

Closes #123
```

```
fix(auth): handle expired token gracefully

Fixed issue where expired tokens caused server crash.
Now returns proper 401 response with error message.

Fixes #456
```

```
docs(readme): update installation instructions

Added Docker setup instructions and environment variable details.
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- First line max 72 characters
- Reference issues and pull requests when applicable
- Explain "what" and "why", not "how"

## Pull Request Process

### Before Creating a PR

- [ ] Code follows style guidelines
- [ ] All tests pass (manual testing)
- [ ] No console.log or debug statements
- [ ] Environment variables documented
- [ ] API documentation updated (if applicable)

### PR Title Format

Same as commit message format:
```
feat(category): implement category CRUD operations
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Documentation update
- [ ] Other (please describe)

## Changes Made
- List key changes
- Made in this PR
- One per line

## Testing Done
- [ ] Tested locally
- [ ] Tested with Docker
- [ ] Tested AUTH integration
- [ ] Manual API testing completed

## Screenshots (if applicable)
Add screenshots of API responses or UI changes

## Related Issues
Closes #<issue-number>

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Create PR** with detailed description
2. **Request review** from at least 1 team member
3. **Address feedback** - respond to all comments
4. **Update PR** based on feedback
5. **Get approval** from reviewer(s)
6. **Squash and merge** - keep main branch clean

### PR Review Guidelines

**For Reviewers:**
- Review within 24 hours if possible
- Be constructive and respectful
- Test the changes locally
- Check for code quality and best practices
- Verify error handling
- Ensure documentation is updated

**For PR Author:**
- Respond to all comments
- Don't take feedback personally
- Ask for clarification if needed
- Update code based on valid feedback
- Thank reviewers for their time

## Testing Guidelines

### Manual Testing

1. **API Endpoint Testing**
   - Use Thunder Client or Postman
   - Test happy path
   - Test error scenarios
   - Test edge cases
   - Verify response format

2. **Test Checklist**
   - [ ] Valid input - success response
   - [ ] Invalid input - proper error message
   - [ ] Missing required fields - validation error
   - [ ] Authentication - unauthorized without token
   - [ ] Authorization - forbidden without permission
   - [ ] Edge cases (empty strings, null values, etc.)

3. **Integration Testing**
   - [ ] AUTH service integration works
   - [ ] MongoDB connection works
   - [ ] GridFS file operations work
   - [ ] QR/Barcode generation works

### Test Script

Use the provided test script:
```bash
python tests/test_endpoints.py
```

## Questions or Need Help?

- Ask in team chat
- Create an issue for bugs
- Reach out to team lead (Ramkumar)

## Thank You!

Thank you for contributing to the PMS Service! Your efforts help make this project better for everyone.

---

**Last Updated:** January 10, 2026  
**Version:** 0.1.0
