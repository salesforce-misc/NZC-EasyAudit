# Contributing to NZC EasyAudit

Thank you for your interest in contributing to NZC EasyAudit! This document provides guidelines and instructions for contributing to this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please report it via [GitHub Issues](https://github.com/salesforce-misc/NZC-EasyAudit/issues). When reporting bugs, please include:

- **Steps to reproduce**: Clear, step-by-step instructions to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment details**: 
  - Salesforce org version and edition
  - Net Zero Cloud version (if applicable)
  - Browser and version (if UI-related)
- **Screenshots or error messages**: If applicable, include screenshots or error messages
- **Additional context**: Any other relevant information

### Suggesting Features

We welcome feature suggestions! Please open a [GitHub Issue](https://github.com/salesforce-misc/NZC-EasyAudit/issues) with:

- **Clear description**: What feature would you like to see?
- **Use case**: How would this feature be used?
- **Proposed solution**: If you have ideas on how to implement it, please share

### Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards:
   - Follow [Salesforce coding standards](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_best_practices.htm)
   - Write clear, self-documenting code
   - Add comments for complex logic
   - Update documentation as needed

3. **Write or update tests**:
   - Ensure test coverage is >75%
   - Test your changes thoroughly
   - Run existing tests to ensure nothing breaks

4. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
   - Use clear, descriptive commit messages
   - Reference issue numbers if applicable

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**:
   - Provide a clear description of your changes
   - Reference any related issues
   - Wait for review and address feedback

## Development Guidelines

### Code Style

- **Apex**: Follow Salesforce Apex coding standards
- **Lightning Web Components**: Follow LWC best practices
- **JavaScript**: Use ES6+ features, follow consistent formatting
- **Comments**: Write self-documenting code; comment only when necessary to explain "why"

### Testing Requirements

- **Test Coverage**: Maintain >75% code coverage
- **Test Types**: Include unit tests, integration tests where appropriate
- **Test Data**: Use test data factories/builders; avoid `SeeAllData=true`
- **Bulk Testing**: Test with bulk scenarios (200+ records) where applicable

### Code Review Process

1. All pull requests require review
2. Address all review comments
3. Ensure all tests pass
4. Ensure code coverage requirements are met
5. Update documentation as needed

### Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Reference issue numbers: `Fix #123: Description`
- Keep messages concise but informative

## Questions?

If you have questions about contributing, please:

- Open a [GitHub Discussion](https://github.com/salesforce-misc/NZC-EasyAudit/discussions)
- Review existing [Issues](https://github.com/salesforce-misc/NZC-EasyAudit/issues)
- Check the [README.md](README.md) for project documentation

## Contributor License Agreement (CLA)

All external contributors must sign the Salesforce Contributor License Agreement (CLA) before a pull request can be merged.

- Sign the CLA at [https://cla.salesforce.com/sign-cla](https://cla.salesforce.com/sign-cla)
- If you have already signed, you do not need to sign again for future contributions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect different viewpoints and experiences

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

Thank you for contributing to NZC EasyAudit! 🎉
