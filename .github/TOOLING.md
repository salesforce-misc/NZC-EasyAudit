# 🤖 AI Coding Assistant Tooling Guide

## Overview

This repository is configured to work seamlessly with both **Cursor IDE** and **Claude Code**, providing intelligent coding assistance while maintaining consistent standards across both tools.

---

## 🎯 Quick Start

### For Cursor IDE Users

Cursor automatically loads rules from `.cursor/rules/*.mdc` files based on:
- File type (via `globs` pattern matching)
- Always-apply flags (`alwaysApply: true`)

**No additional setup required** - just open the project in Cursor!

### For Claude Code Users

Claude Code reads [CLAUDE.md](../CLAUDE.md) as the main instruction file, which references the same rules used by Cursor.

**No additional setup required** - just open the project in Claude Code!

---

## 📂 File Structure

```
NZC-EasyAudit/
├── CLAUDE.md                     # Main instructions for Claude Code
├── REPOSITORY_SUMMARY.md         # Shared project overview (both tools)
├── .cursor/
│   └── rules/                    # Shared coding standards (both tools)
│       ├── repo-shape.mdc        # Repository structure workflow
│       ├── lwc-best-practices.mdc # LWC coding standards
│       ├── Apex Rules.mdc        # Apex enterprise patterns
│       ├── apex-best-practices.mdc # Apex general guidelines
│       ├── lwc-jest-tests.mdc    # Jest testing standards
│       ├── Accelerator README.mdc # Documentation standards
│       └── OSPO-Comppliance.mdc  # Open source compliance
└── .github/
    └── TOOLING.md                # This file
```

---

## 🔄 How It Works

### Shared Resources

Both tools use the **same** coding standards and project context:

1. **REPOSITORY_SUMMARY.md**
   - Single source of truth for project architecture
   - Component relationships and data flow
   - Technology stack and integration points

2. **.cursor/rules/**
   - All coding standards stored here
   - Both tools reference the same files
   - Ensures consistency across development environments

### Tool-Specific Files

- **Cursor**: Automatically discovers `.cursor/rules/*.mdc` files
- **Claude Code**: Reads `CLAUDE.md` which points to `.cursor/rules/`

---

## 📋 Coding Standards Coverage

### Lightning Web Components (LWC)
- **File**: [.cursor/rules/lwc-best-practices.mdc](../.cursor/rules/lwc-best-practices.mdc)
- **Coverage**: Naming, styling, security, error handling, testing
- **Testing**: [.cursor/rules/lwc-jest-tests.mdc](../.cursor/rules/lwc-jest-tests.mdc)

### Apex
- **Architecture**: [.cursor/rules/Apex Rules.mdc](../.cursor/rules/Apex%20Rules.mdc) (fflib patterns)
- **Best Practices**: [.cursor/rules/apex-best-practices.mdc](../.cursor/rules/apex-best-practices.mdc)
- **Coverage**: Selectors, Services, Controllers, testing, security

### Documentation
- **File**: [.cursor/rules/Accelerator README.mdc](../.cursor/rules/Accelerator%20README.mdc)
- **Coverage**: OSPO compliance, installation paths, architecture diagrams

### Repository Workflow
- **File**: [.cursor/rules/repo-shape.mdc](../.cursor/rules/repo-shape.mdc)
- **Coverage**: How to navigate and understand the codebase

---

## 🎨 Differences Between Tools

### Response Format

**Cursor**:
- May request JSON-formatted responses (per repo-shape.mdc)
- Integrated directly into IDE

**Claude Code**:
- Uses markdown formatting for better readability
- CLI/VSCode extension interface
- Interactive conversation flow

### Tool APIs

**Cursor**:
- Uses Cursor-specific APIs and file operations
- Inline code suggestions

**Claude Code**:
- Uses Read, Edit, Grep, Bash tools
- Explicit tool calls with user approval

### Outcome

Despite different tools and APIs, **both achieve the same result**:
- Same coding standards applied
- Same architectural patterns followed
- Same test coverage requirements
- Same security practices enforced

---

## ✅ What's Enforced

### Code Quality
- ✅ >85% test coverage (Jest for LWC, Apex tests)
- ✅ SLDS styling standards
- ✅ Security: `WITH USER_MODE`, `with sharing`
- ✅ No hardcoded IDs
- ✅ Proper error handling

### Architecture
- ✅ Component composition patterns
- ✅ fflib patterns (when DML present)
- ✅ Separation of concerns
- ✅ Repository pattern for queries

### Testing
- ✅ Arrange-Act-Assert structure
- ✅ Mock external dependencies
- ✅ Test bulk scenarios (200+ records)
- ✅ DOM-only assertions for LWC

### Documentation
- ✅ OSPO-compliant disclaimers
- ✅ Three installation paths
- ✅ Technical architecture diagrams
- ✅ Clear usage instructions

---

## 🚀 Best Practices for Users

### When Using Cursor
1. Open project in Cursor IDE
2. Rules automatically apply based on file type
3. Follow inline suggestions
4. Use Cursor's AI features as normal

### When Using Claude Code
1. Open project via Claude Code CLI/VSCode
2. Claude reads `CLAUDE.md` automatically
3. Ask questions or request code changes
4. Claude references shared rules from `.cursor/rules/`

### When Switching Between Tools
- ✅ No conflicts - both use same standards
- ✅ Code written in Cursor follows Claude's expectations
- ✅ Code written via Claude follows Cursor's rules
- ✅ Seamless collaboration across tools

---

## 🔧 Maintenance

### Adding New Rules
1. Create `.mdc` file in `.cursor/rules/`
2. Add frontmatter with metadata:
   ```yaml
   ---
   description: Rule description
   globs: **/*.{js,cls}  # File patterns
   alwaysApply: false    # Apply to all files?
   ---
   ```
3. Update `CLAUDE.md` to reference new rule if needed
4. Both tools now use the new rule

### Updating Existing Rules
1. Edit `.mdc` file in `.cursor/rules/`
2. Changes apply to both tools automatically
3. No need to update `CLAUDE.md` (unless structure changes)

---

## 📖 Quick Reference

| What | Cursor | Claude Code |
|------|--------|-------------|
| **Entry Point** | `.cursor/rules/*.mdc` | `CLAUDE.md` |
| **Standards Source** | `.cursor/rules/` | `.cursor/rules/` (referenced) |
| **Project Context** | `REPOSITORY_SUMMARY.md` | `REPOSITORY_SUMMARY.md` |
| **Auto-discovery** | ✅ Yes | ✅ Yes |
| **File Patterns** | Via `globs` in frontmatter | Via references in CLAUDE.md |
| **Response Format** | JSON (optional) | Markdown |

---

## 🎓 Learning More

### Cursor IDE
- [Cursor Documentation](https://docs.cursor.sh/)
- [Cursor Rules Documentation](https://docs.cursor.sh/context/rules)

### Claude Code
- [Claude Code Documentation](https://github.com/anthropics/claude-code)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)

### Project Resources
- [CLAUDE.md](../CLAUDE.md) - Complete Claude Code instructions
- [REPOSITORY_SUMMARY.md](../REPOSITORY_SUMMARY.md) - Project architecture
- [.cursor/rules/](../.cursor/rules/) - All coding standards

---

## ❓ FAQ

**Q: Which tool should I use?**  
A: Use whichever you prefer! Both maintain the same standards.

**Q: Will code written in Cursor work with Claude?**  
A: Yes! Both tools follow the same rules and standards.

**Q: Can I use both tools on the same project?**  
A: Absolutely! They're designed to work together seamlessly.

**Q: Do I need to configure anything?**  
A: No! Both tools discover their configuration automatically.

**Q: What if rules conflict?**  
A: They don't - both tools read from the same source (`.cursor/rules/`).

**Q: Can I customize the rules?**  
A: Yes! Edit files in `.cursor/rules/` and both tools pick up changes.

---

**Last Updated**: April 2026  
**Maintained By**: Repository contributors  
**License**: Apache 2.0
