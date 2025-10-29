# Contributing to XScouting

Thank you for your interest in contributing to XScouting! We welcome contributions from the community. This document outlines the guidelines for contributing to the project.

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- A clear title describing the issue
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node.js version)

### Suggesting Features

Feature requests are welcome! Please create an issue with:

- A clear title for the feature
- Detailed description of the proposed feature
- Why this feature would be useful
- Any mockups or examples if possible

### Contributing Code

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following the coding standards
5. **Test your changes** thoroughly
6. **Commit your changes** with clear commit messages:
   ```bash
   git commit -m "Add: brief description of changes"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request** on GitHub

## Development Setup

See the [README.md](README.md) for detailed setup instructions.

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style (ESLint configuration)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused on a single responsibility

### React Components

- Use functional components with hooks
- Follow the component structure in the existing codebase
- Use TypeScript interfaces for props
- Implement proper error boundaries where needed

### Commit Messages

Follow conventional commit format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example: `feat: add player search functionality`

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Test on multiple browsers if making UI changes
- Test responsive design on different screen sizes

## Pull Request Process

1. Ensure your PR description clearly describes the changes
2. Reference any related issues
3. Ensure CI checks pass
4. Request review from maintainers
5. Address any feedback from reviewers
6. Once approved, your PR will be merged

## Areas for Contribution

See the [TODO.md](TODO.md) file for current development priorities and planned features.

## Questions?

If you have questions about contributing, feel free to:

- Open a discussion on GitHub
- Reach out to the maintainers
- Check existing issues and discussions

Thank you for contributing to XScouting! 🎉
