# Available Skills

This document lists all interactive skills available for this repository. Skills provide guided workflows for complex tasks.

## What Are Skills?

Skills are interactive workflows that:
- Guide you step-by-step through complex processes
- Ask clarifying questions when needed
- Validate outputs and ensure compliance
- Reference the same standards as Cursor rules

## How to Use Skills

### In Claude Code
Invoke skills by typing `/skillname` or by describing the task:
```
/readme-generate
```
or
```
"help me generate a readme"
```

### In Cursor IDE
Skills are available in Cursor through the same invocation methods.

---

## 📚 Documentation Skills

### `/readme-generate`
**Generate or update OSPO-compliant README files**

**When to use**:
- Creating a new README from scratch
- Updating existing README sections
- Ensuring OSPO compliance requirements
- Following Salesforce accelerator documentation standards

**What it does**:
1. Asks for project details (name, description, features, components)
2. Generates complete README following enterprise template
3. Ensures three installation paths (GitHub Deploy, Workbench, CLI)
4. Adds proper badges, architecture diagrams, and tables
5. Includes OSPO-compliant disclaimer
6. Validates required sections and structure

**Example invocations**:
- `/readme-generate`
- "generate a readme"
- "update readme with new features"
- "make readme ospo compliant"

**Based on**: [Accelerator README.mdc](./.cursor/rules/Accelerator%20README.mdc)

**Interactive prompts**:
- Project name?
- GitHub username/organization?
- Repository name?
- Project tagline/description?
- Key features by category?
- Technical components?
- Prerequisites?

**Output**: Complete or updated README.md at repository root

---

### `/prepare-opensource`
**Validate OSPO compliance and prepare for open source release**

**When to use**:
- Preparing accelerator for public GitHub release
- Validating OSPO compliance requirements
- Before submitting OSPO approval request
- Generating missing compliance files

**What it does**:
1. Checks for required files at root level (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
2. Generates missing files from Salesforce OSS templates
3. Validates existing file content
4. Scans for non-public references (private domains, private tools)
5. Adds copyright headers to source files (.cls, .js, .html, .css)
6. Creates detailed compliance checklist
7. Guides through approval process

**Example invocations**:
- `/prepare-opensource`
- "prepare for open source"
- "check ospo compliance"
- "validate compliance files"
- "ready for github"

**Based on**: [OSPO-Comppliance.mdc](./.cursor/rules/OSPO-Comppliance.mdc)

**Interactive prompts**:
- Copyright year? (default: current year)
- Governance model? (Community/Salesforce Sponsored/Published)
- Add copyright headers to {X} files?
- Create CODEOWNERS file?
- Review internal references found?

**Output**:
- LICENSE.txt (Apache 2.0)
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- Copyright headers in source files
- Compliance checklist

**Critical requirement**: All files must be at root level (not in subdirectories)

---

## 🎯 Skills vs Rules

### Rules (Passive Guidelines)
- Located in [.cursor/rules/](./.cursor/rules/)
- Always available as context
- Applied automatically based on file type
- Inform coding standards and best practices
- Examples: LWC best practices, Apex patterns, testing standards

### Skills (Active Workflows)
- Located in `~/.claude/skills/`
- Invoked explicitly by user
- Interactive step-by-step processes
- Ask questions and validate input
- Examples: `/readme-generate`, `/prepare-opensource`

**Relationship**: Skills reference the underlying rules but provide interactive workflows for complex multi-step tasks.

---

## 📖 Complete Skill Reference

| Skill | Purpose | When to Use | Reference Rule |
|-------|---------|-------------|----------------|
| `/readme-generate` | Generate OSPO-compliant README | Creating/updating documentation | [Accelerator README.mdc](./.cursor/rules/Accelerator%20README.mdc) |
| `/prepare-opensource` | OSPO compliance validation | Preparing for public release | [OSPO-Comppliance.mdc](./.cursor/rules/OSPO-Comppliance.mdc) |

---

## 🔄 Skill Workflow Examples

### Example 1: Generating a README
```
User: "generate a readme for this accelerator"

Claude: I'll help you generate an OSPO-compliant README. Let me gather some information:

1. What is your project name? (e.g., "NZC EasyAudit")
> NZC EasyAudit

2. What's your GitHub username or organization?
> salesforce-misc

3. What's the repository name?
> NZC-EasyAudit

4. What's the tagline (1-2 sentence description)?
> A comprehensive audit component that displays step-by-step emissions calculations...

[Continues with interactive questions, then generates complete README]
```

### Example 2: Preparing for Open Source
```
User: "/prepare-opensource"

Claude: I'll validate OSPO compliance and prepare your repository for open source release.

Step 1: Checking required files...
- ✅ LICENSE.txt found
- ❌ CONTRIBUTING.md missing
- ❌ CODE_OF_CONDUCT.md missing
- ✅ SECURITY.md found
- ✅ README.md found

Step 2: Generating missing files...
What governance model? (1=Community, 2=Salesforce Sponsored, 3=Published)
> 2

[Generates CONTRIBUTING.md and CODE_OF_CONDUCT.md]

Step 3: Scanning for internal references...
Found 2 internal references:
- force-app/main/default/classes/Controller.cls:42 (internal tool reference)

Would you like me to show details? (Y/n)

[Continues through all steps, creates checklist]
```

---

## 💡 Tips for Success

### When to Use Skills
- ✅ Multi-step complex tasks
- ✅ Tasks requiring validation
- ✅ Need interactive guidance
- ✅ OSPO compliance workflows
- ✅ Documentation generation

### When to Reference Rules Directly
- ✅ Quick reference for coding patterns
- ✅ Understanding best practices
- ✅ Manual implementation
- ✅ Learning standards

### Best Practices
1. **Be specific** when invoking skills with details
2. **Answer prompts** completely for best results
3. **Review output** before confirming changes
4. **Combine skills** for comprehensive workflows (e.g., generate README then prepare for open source)

---

## 🛠️ Custom Skills

Want to create your own skills for this project? Skills can be added to `~/.claude/skills/` and follow this structure:

```markdown
# Skill Name

Brief description

## Metadata
- **Skill Name**: skill-name
- **Category**: Category
- **References**: Link to underlying rule/doc

## Triggers
This skill activates when the user says:
- "trigger phrase"
- "/skill-name"

## Capabilities
- What it can do

## Workflow
Step-by-step process

## Interactive Prompts
Questions asked during execution

## Output
What it produces
```

---

## 📚 Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete Claude Code instructions
- [.cursor/rules/](./.cursor/rules/) - All coding standards and rules
- [REPOSITORY_SUMMARY.md](./REPOSITORY_SUMMARY.md) - Project architecture
- [AI_ASSISTANT_SETUP.md](./AI_ASSISTANT_SETUP.md) - AI assistant configuration

---

## 🤝 Contributing New Skills

Have an idea for a new skill? Consider:
1. Is this a multi-step workflow? (good candidate)
2. Does it require user input/validation? (good candidate)
3. Is it project-specific or general? (project-specific skills go here)
4. Does it reference existing rules? (ideal)

Submit skill proposals via GitHub Issues or Pull Requests.

---

**Last Updated**: April 2026  
**Skills Available**: 2  
**Rules in `.cursor/rules/`**: 9 (7 active, 2 archived)
