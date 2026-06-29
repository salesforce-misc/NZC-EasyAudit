# Claude Code Instructions for NZC EasyAudit

## Overview

This project is configured for both **Cursor IDE** and **Claude Code**. All coding standards, best practices, and architectural rules are shared between both tools.

---

## 🎯 Primary Resources (Read First)

### 1. Repository Summary
**File**: [REPOSITORY_SUMMARY.md](./REPOSITORY_SUMMARY.md)  
**Purpose**: Complete project overview, architecture, data model, and component relationships

**⚠️ CRITICAL**: Always read this file first when:
- Starting any new task
- User asks about project structure or architecture
- Planning code changes or new features
- Need to understand component dependencies

### 2. Shared Rules Directory
**Location**: [.cursor/rules/](./.cursor/rules/)  
**Purpose**: Comprehensive coding standards and best practices

All rules in `.cursor/rules/` apply to both Cursor and Claude Code. These include:
- [repo-shape.mdc](./.cursor/rules/repo-shape.mdc) - Repository structure and workflow
- [lwc-best-practices.mdc](./.cursor/rules/lwc-best-practices.mdc) - LWC coding standards
- [Apex Rules.mdc](./.cursor/rules/Apex%20Rules.mdc) - Apex Enterprise Patterns (fflib)
- [apex-best-practices.mdc](./.cursor/rules/apex-best-practices.mdc) - Additional Apex guidelines
- [lwc-jest-tests.mdc](./.cursor/rules/lwc-jest-tests.mdc) - Jest testing standards
- [Accelerator README.mdc](./.cursor/rules/Accelerator%20README.mdc) - Documentation standards
- [OSPO-Comppliance.mdc](./.cursor/rules/OSPO-Comppliance.mdc) - Open source compliance

---

## 🛠️ Available Skills

Skills are interactive workflows that guide you through complex tasks. Invoke them using `/skillname` or by describing the task.

### `/readme-generate` - README Generator

Generate or update OSPO-compliant README files for Salesforce accelerators.

**When to use**:
- Creating new README from scratch
- Updating existing README sections
- Ensuring OSPO compliance (disclaimer, three installation paths)
- Formatting badges, diagrams, and architecture sections

**What it does**:
- Asks for project details (name, description, features)
- Generates complete README following Salesforce accelerator template
- Validates required sections (Quick Deploy, Features, Installation, Architecture)
- Ensures three installation paths (GitHub Deploy, Workbench, CLI)
- Adds OSPO-compliant disclaimer

**Reference**: Based on [Accelerator README.mdc](./.cursor/rules/Accelerator%20README.mdc)

### `/prepare-opensource` - Open Source Preparation

Validate OSPO compliance and prepare repository for public open source release.

**When to use**:
- Preparing accelerator for public GitHub release
- Checking OSPO compliance requirements
- Generating compliance files (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- Scanning for internal Salesforce references
- Adding copyright headers to source files

**What it does**:
- Checks for required compliance files at root level
- Generates missing files from Salesforce OSS templates
- Scans for non-public references (private domains, private tools)
- Adds copyright headers to all source files (.cls, .js, .html, .css)
- Creates compliance checklist
- Guides through approval process

**Reference**: Based on [OSPO-Comppliance.mdc](./.cursor/rules/OSPO-Comppliance.mdc)

**Note**: Skills reference the same standards from `.cursor/rules/` but provide interactive workflows for complex multi-step processes.

---

## 📋 Coding Standards

### Lightning Web Components (LWC)

**Reference**: [lwc-best-practices.mdc](./.cursor/rules/lwc-best-practices.mdc)

#### Naming Conventions
- **PascalCase** for component class names and folders
- **camelCase** for variables, methods, tracked properties
- Add descriptive suffixes: `Modal`, `Form`, `List`, `Step`

#### Code Organization
- Use Lightning base components whenever possible
- Break large methods into smaller, focused functions
- Use helper modules for reusable logic
- Comment only to explain *why*, not *what*

#### Reactivity & Functions
- Use `async/await` for better readability
- Check for `null`/`undefined` to avoid crashes
- Use `@api` only for externally accessed properties
- Use `@wire` for reactive data and handle errors
- Reassign entire objects to trigger reactivity: `this.obj = { ...this.obj }`

#### Styling & SLDS
- Use SLDS utility classes for layout and spacing
- Avoid inline styles; use component's CSS file
- Use SLDS design tokens (no hardcoded values)
- Add accessibility classes and ARIA attributes
- **When adding custom styles, do not use SLDS utility classes** - define your own CSS classes

#### Error Handling
- Handle wire service errors using `error` parameter
- Use `try/catch` in async logic
- Show errors using `ShowToastEvent`
- Always handle promise rejections

#### Security
- Never use `innerHTML` or direct DOM access (`document`, `window`)
- Avoid executing arbitrary code patterns
- Never store sensitive data in `localStorage`/`sessionStorage`
- Validate all `@api` inputs and message payloads

#### Testing
**Reference**: [lwc-jest-tests.mdc](./.cursor/rules/lwc-jest-tests.mdc)

- Aim for >85% code coverage
- Write Jest tests for public methods and UI states
- Mock wire calls in tests
- Structure: Arrange → Act → Assert
- Test errors, loading states, and edge cases
- **Do not assert on component properties** - verify DOM elements, attributes, text, and emitted events only

### Apex Standards

**References**: 
- [Apex Rules.mdc](./.cursor/rules/Apex%20Rules.mdc) - fflib patterns
- [apex-best-practices.mdc](./.cursor/rules/apex-best-practices.mdc) - General guidelines

#### Architecture (fflib Patterns)

**Note**: This project currently uses a **simplified architecture** for read-only operations. Full fflib patterns should be applied if adding DML functionality.

**Layering** (when applicable):
- **Selector layer**: One Selector per SObject, encapsulates all SOQL
- **Service layer**: Orchestrates use cases, uses UnitOfWork for DML
- **Controller layer**: Thin façade calling Services

**Current Project Architecture**:
- Direct controller queries (no Selectors) - acceptable for read-only
- No Service layer - acceptable for read-only
- No UnitOfWork - no DML operations present

**If extending with DML**, follow full fflib:
```apex
// Selector pattern
public inherited sharing class AccountSelector extends fflib_SObjectSelector {
    public override Schema.SObjectType getSObjectType() {
        return Account.SObjectType;
    }
    // ... implement methods
}

// Service pattern
public with sharing class AccountService {
    private final fflib_ISObjectUnitOfWork unitOfWork;
    
    public void upsertAccounts(List<Account> accounts) {
        unitOfWork.registerUpsert(accounts);
        unitOfWork.commitWork();
    }
}

// Controller pattern
public with sharing class AccountController {
    @AuraEnabled
    public static void upsertAccounts(List<Account> accounts) {
        AccountService.newInstance().upsertAccounts(accounts);
    }
}
```

#### Apex Best Practices

**Reference**: [apex-best-practices.mdc](./.cursor/rules/apex-best-practices.mdc)

**Key Mindsets**:
1. **Testability**: Ensure code is easy to test
2. **Simplicity**: Less code is better (unless it hurts readability)
3. **Readability**: Use well-named variables/functions, don't be clever
4. **Performance**: Keep in mind but don't over-optimize
5. **Maintainability**: Write code that's easy to update
6. **Reusability**: Write reusable classes and methods

**Code Guidelines**:
- **Async Work**: Use Queueables with `System.Finalizer`, never `@future`
- **Null Objects**: Prefer Null Object pattern over nested conditionals
- **Variable Names**: Don't append type to collection names. Maps: use `idToAccount`, `accountIdToOpportunities`
- **Enums Over Strings**: Prefer enums (ALL_CAPS_SNAKE_CASE)
- **Repositories/Selectors**: Centralize DML and queries for testability
- **Task Focus**: Don't modify unrelated code

**Comments**: Don't over-comment. Prefer well-named variables/functions. Save comments for unidiomatic choices or platform oddities.

**Class Organization**: Follow "newspaper" rule - methods appear in order they're referenced. Alphabetize dependencies, fields, properties.

#### Security
- All queries must use `WITH USER_MODE` to enforce CRUD/FLS
- Use `with sharing` for controllers and services
- Use `inherited sharing` for selectors
- Validate inputs, handle exceptions with specific exception types
- No hardcoded IDs

#### Testing
- Coverage: >75% minimum, >85% preferred
- Use `fflib_ApexMocks` for interaction tests
- Test bulk scenarios (200+ records)
- Arrange-Act-Assert structure
- No `SeeAllData=true`
- Test factories/builders for test data
- Assert no SOQL/DML in loops

---

## 🔄 Workflow

### Step 1: Understand Context
1. Read [REPOSITORY_SUMMARY.md](./REPOSITORY_SUMMARY.md) first
2. Review relevant rules from [.cursor/rules/](./.cursor/rules/)
3. Understand component relationships and data flow

### Step 2: Plan Changes
1. Identify affected components
2. Consider impact on architecture
3. Plan test coverage updates
4. Verify against coding standards

### Step 3: Implement
1. Follow naming conventions
2. Maintain test coverage (>85%)
3. Add comments only where necessary
4. Update documentation if needed

### Step 4: Verify
1. Run tests (Jest for LWC, Apex tests)
2. Verify code coverage
3. Check against best practices
4. Ensure no security issues

---

## 🏗️ Project-Specific Context

### Architecture Overview
- **Read-only audit component** - no DML operations
- **Controller Pattern**: `NZC_EasyAuditControllerV2` handles data retrieval
- **DTO Pattern**: `NZC_EasyAuditInfoWrapper` structures data
- **Utility Classes**: Separate calculation and conversion logic
- **Component Composition**: LWC components work together

### Data Flow
```
Record → Apex Controller → InfoWrapper → Calculation Class → Step Component → Display
```

### Key Components
1. **nZC_EasyAudit**: Main orchestrator
2. **nZC_EasyAuditStep**: Individual step display
3. **nZC_EasyAuditVehicleCalc**: Vehicle calculations
4. **nZC_EasyAuditStationaryCalc**: Stationary calculations
5. **NZC_EasyAuditControllerV2**: Apex controller

### No DML Operations
This is a **read-only component**. If extending with write operations:
- Implement full fflib patterns (Selector/Service/UoW)
- Follow DML best practices from Apex Rules
- Add appropriate test coverage for DML

---

## 📦 Net Zero Cloud Integration

### Objects Used
- `VehicleAssetEnrgyUse`
- `StnryAssetEnrgyUse`
- `OtherEmssnFctrSetItem`
- `ElectricityEmssnFctrSet`
- `RefrigerantEmssnFctr`
- `SustnUomConversion`

### Platform Features
- Lightning Web Components framework
- Aura wrapper for page compatibility
- Salesforce Base URL: `Url.getOrgDomainUrl()`
- API Version: 65.0

---

## 🧪 Testing Requirements

### LWC (Jest)
- File location: `__tests__/componentName.test.js`
- Coverage: >85%
- Test observable behavior only
- Do not test internal properties
- Use `createElement` from `lwc` package
- Await rerenders: `await Promise.resolve()`

### Apex
- File location: `force-app/main/default/classes/`
- Coverage: >85%
- Test bulk scenarios (200+ records)
- No `SeeAllData=true`
- Use mocks for dependencies
- Test both success and error paths

---

## 📚 Documentation Standards

**Reference**: [Accelerator README.mdc](./.cursor/rules/Accelerator%20README.mdc)

When updating README.md, ensure:
- OSPO-compliant disclaimer present
- Three installation paths (GitHub Deploy, Workbench, CLI)
- Complete technical architecture section
- Proper badge formatting
- Clear usage instructions
- Mermaid diagrams for complex flows

---

## 🔒 Code Quality & Security

### SF Code Analyzer
- Configuration: `code-analyzer.yml`
- Engines: PMD (Apex), ESLint disabled
- All PRs should pass analyzer checks

### Security Requirements
- All SOQL: `WITH USER_MODE`
- Proper exception handling
- No hardcoded IDs
- Input validation at boundaries
- No XSS, SQL injection, command injection vulnerabilities

---

## 🤝 Cross-Tool Compatibility

### Shared Resources
- ✅ All rules in `.cursor/rules/` apply to both tools
- ✅ `REPOSITORY_SUMMARY.md` is the single source of truth
- ✅ Same coding standards and best practices
- ✅ Same testing requirements

### Tool-Specific Notes

**Cursor**:
- Uses `.cursor/rules/*.mdc` files directly
- Applies rules based on file globs and `alwaysApply` flags

**Claude Code**:
- Reads this `CLAUDE.md` file as entry point
- References `.cursor/rules/` for detailed standards
- Uses markdown formatting for responses (not strict JSON)
- Different tool APIs (Read, Edit, Grep, Bash) but same outcomes

---

## 💡 Quick Reference

### Before Any Task
1. ✅ Read [REPOSITORY_SUMMARY.md](./REPOSITORY_SUMMARY.md)
2. ✅ Review relevant rules from [.cursor/rules/](./.cursor/rules/)
3. ✅ Understand component relationships

### When Writing LWC
- Follow [lwc-best-practices.mdc](./.cursor/rules/lwc-best-practices.mdc)
- Test with [lwc-jest-tests.mdc](./.cursor/rules/lwc-jest-tests.mdc)
- >85% coverage, test DOM only

### When Writing Apex
- Follow [Apex Rules.mdc](./.cursor/rules/Apex%20Rules.mdc) (if adding DML)
- Follow [apex-best-practices.mdc](./.cursor/rules/apex-best-practices.mdc)
- Use `WITH USER_MODE`, `with sharing`
- >85% coverage, test bulk scenarios

### When Updating Docs
- Use `/readme-generate` skill for interactive README generation
- Or follow [Accelerator README.mdc](./.cursor/rules/Accelerator%20README.mdc) manually
- Include OSPO disclaimer
- Three installation paths

### When Preparing for Open Source
- Use `/prepare-opensource` skill for OSPO compliance
- Generates LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY
- Scans for internal references
- Adds copyright headers
- Creates compliance checklist

---

## 🎓 Learning Resources

- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/)
- [LWC Dev Guide](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)
- [Apex Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/)
- [fflib-apex-common](https://github.com/apex-enterprise-patterns/fflib-apex-common)
- [Net Zero Cloud Documentation](https://help.salesforce.com/s/articleView?id=sf.net_zero_cloud_intro.htm)

---

**Last Updated**: April 2026  
**API Version**: 65.0  
**Compatible Tools**: Cursor IDE, Claude Code
