# Contributing to NZC Easy Audit

Thank you for your interest in contributing to NZC Easy Audit! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by the [Salesforce Open Source Community Code of Conduct](https://github.com/salesforce/.github/blob/main/CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug, please report it via [GitHub Issues](https://github.com/jvillalpando_sfemu/NZC-EasyAudit/issues). When reporting bugs, please include:

- **Steps to reproduce**: Clear, step-by-step instructions to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment details**: 
  - Salesforce org version and edition
  - Net Zero Cloud version (if applicable)
  - Browser and version (if UI-related)
- **Screenshots or error messages**: If applicable, include screenshots or full error stack traces

### Suggesting Enhancements

We welcome suggestions for new features and enhancements! Please open a [GitHub Issue](https://github.com/jvillalpando_sfemu/NZC-EasyAudit/issues) with the following information:

- **Use case**: Describe the problem or use case this enhancement would solve
- **Proposed solution**: How you envision this feature working
- **Alternatives considered**: Other approaches you've considered
- **Additional context**: Any other relevant information

### Pull Requests

We welcome pull requests! Please follow these steps:

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards (see below)

3. **Test your changes** thoroughly
   - Run existing tests: `npm test`
   - Add new tests for new functionality
   - Test in a sandbox environment before submitting

4. **Update documentation** if needed
   - Update README.md if you've added features or changed behavior
   - Add code comments for complex logic

5. **Commit your changes** with clear, descriptive commit messages
   ```bash
   git commit -m "Add feature: description of your change"
   ```

6. **Push to your fork** and open a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Respond to feedback** and make requested changes

## Coding Standards

### General Guidelines

- Follow [Salesforce Apex Coding Standards](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_best_practices.htm)
- Follow [Lightning Web Component Best Practices](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.get_started_best_practices)
- Write self-documenting code with clear variable and method names
- Add comments for complex business logic
- Keep methods focused and single-purpose

### Code Style

- Use consistent indentation (4 spaces for Apex, 2 spaces for JavaScript)
- Follow existing code patterns and conventions
- Use meaningful variable and method names
- Keep methods under 50 lines when possible
- Avoid deeply nested conditionals

### Testing Requirements

- **Test coverage**: Maintain at least 75% code coverage
- **New features**: Include unit tests for all new functionality
- **Bug fixes**: Include tests that verify the bug is fixed
- **Test classes**: Follow naming convention: `[ClassName]Test.cls`

### Code Review Process

1. All pull requests require at least one approval before merging
2. Maintainers will review code for:
   - Code quality and adherence to standards
   - Test coverage
   - Documentation updates
   - Security considerations
3. Address all review comments before requesting re-review
4. Be patient and respectful during the review process

## Development Setup

### Prerequisites

- Salesforce CLI (latest version)
- Git
- Node.js and npm (for LWC Jest tests)
- A Salesforce org (Sandbox or Developer Edition) with Net Zero Cloud

### Setup Steps

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/NZC-EasyAudit.git
   cd NZC-EasyAudit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Authorize your org:
   ```bash
   sf org login web --alias MyOrg
   ```

4. Deploy to your org:
   ```bash
   sf project deploy start --source-dir force-app --target-org MyOrg
   ```

## Project Structure

- `force-app/main/default/classes/` - Apex classes
- `force-app/main/default/lwc/` - Lightning Web Components
- `force-app/main/default/aura/` - Aura components
- `scripts/` - Utility scripts

## Questions?

- Open a [GitHub Discussion](https://github.com/jvillalpando_sfemu/NZC-EasyAudit/discussions) for questions
- Check existing [Issues](https://github.com/jvillalpando_sfemu/NZC-EasyAudit/issues) for similar questions
- Review the [README.md](README.md) for project documentation

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

Thank you for contributing to NZC Easy Audit! 🎉
