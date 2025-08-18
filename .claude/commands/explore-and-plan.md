---
description: Advanced EPCT workflow with parallel agents, MCP integration, and engineering best practices
allowed-tools: Task, Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, WebSearch, WebFetch
argument-hint: "[task-description] [--think-mode standard|deep|ultra] [--parallel-limit N] [--skip-validation]"
---

# Enhanced Explore, Plan, Code, Test Workflow

This workflow implements a comprehensive EPCT (Explore, Plan, Code, Test) methodology with parallel subagent execution, MCP server integration, and senior engineering best practices.

## 🔍 Explore Phase

Use parallel subagents to thoroughly understand the codebase and requirements.

### Exploration Strategy

1. **Codebase Analysis** (via epct-explorer subagent):
   - Find all relevant files (implementation targets and examples)
   - Identify architectural patterns and conventions
   - Map dependencies and relationships
   - Assess modification risks

2. **Documentation Research** (via epct-researcher subagent):
   - Search framework documentation using Context7
   - Find similar implementations using Exa deep research
   - Research best practices using web search
   - Validate security patterns

### Expected Subagent Returns

Each exploration subagent MUST return structured information:

```
FILE ANALYSIS:
- Path: [file path]
- Purpose: [why this file is relevant]
- Patterns: [code patterns to follow]
- Dependencies: [related files/modules]
- Risk Level: [low|medium|high]
- Key Functions: [important functions/classes]

RESEARCH FINDINGS:
- Topic: [research topic]
- Sources: [documentation/articles consulted]
- Recommendations: [best practices found]
- Warnings: [potential pitfalls]
- Examples: [relevant code examples]
```

### Parallel Execution

```
# Launch parallel exploration
- Task 1: epct-explorer analyze @src/ for [feature]
- Task 2: epct-researcher find best practices for [technology]
- Task 3: epct-explorer check test coverage for related features
```

## 📋 Plan Phase

Create a comprehensive implementation strategy based on exploration findings.

### Planning Requirements

1. **Think deeply** about the implementation approach
2. **Use epct-planner subagent** for complex architectural decisions
3. **Document all design decisions** with justifications

### Plan Structure

Your plan MUST include:

#### Architecture & Design
- [ ] Component/module structure
- [ ] Design patterns to apply (Factory, Observer, Strategy, etc.)
- [ ] SOLID principles compliance check
- [ ] Dependency injection strategy
- [ ] State management approach

#### Implementation Details
- [ ] File modifications list with risk assessment
- [ ] New files to create with purpose
- [ ] API contracts and interfaces
- [ ] Data flow and transformations
- [ ] Error handling strategy

#### Quality Assurance
- [ ] Unit test scenarios (target: >80% coverage)
- [ ] Integration test cases
- [ ] E2E test workflows
- [ ] Performance benchmarks
- [ ] Security validations

#### Documentation
- [ ] Code documentation requirements
- [ ] API documentation updates
- [ ] User-facing documentation changes
- [ ] Migration guide (if breaking changes)

### Research Integration

If uncertainties remain:

```
# Use parallel research for specific questions
- Task: epct-researcher investigate "[specific technical question]"
  Returns: Actionable recommendations with sources
```

### User Confirmation

**PAUSE HERE** if you have questions. Ask the user for clarification before proceeding to coding.

## 💻 Code Phase

Implement the solution following the established plan.

### Pre-Coding Checklist

Before writing any code:
- [ ] Review existing code style and conventions
- [ ] Confirm design patterns selection
- [ ] Set up error handling structure
- [ ] Plan logging and monitoring points

### Implementation Guidelines

1. **Code Quality Standards**:
   - Follow project's existing patterns
   - Use descriptive variable/function names
   - Implement proper error boundaries
   - Add appropriate logging
   - Include performance monitoring

2. **Parallel Validation** (via epct-coder subagent):
   ```
   # While coding, run parallel checks:
   - Lint check on modified files
   - Type checking for TypeScript/Flow
   - Security scanning for vulnerabilities
   - Performance profiling for critical paths
   ```

3. **Auto-formatting & Cleanup**:
   ```bash
   # Run project-specific formatting
   pnpm lint:fix || npm run lint:fix || yarn lint:fix
   
   # Fix reasonable warnings
   # Document any ignored warnings with justification
   ```

### Code Review Triggers

Automatically invoke epct-validator when:
- Creating new API endpoints
- Modifying authentication/authorization
- Changing data models
- Adding external dependencies

## 🧪 Test Phase

Comprehensive testing with parallel execution and validation.

### Test Execution Strategy

1. **Unit Tests** (via epct-tester):
   ```
   # Parallel test execution
   - Task 1: Run unit tests with coverage report
   - Task 2: Run integration tests
   - Task 3: Check for test flakiness
   
   Success Criteria:
   - Coverage > 80% for new code
   - All tests passing
   - No flaky tests introduced
   ```

2. **Integration Tests**:
   - API endpoint testing
   - Database integration validation
   - External service mocking
   - Error scenario coverage

3. **E2E Browser Tests** (for UX changes):
   ```
   Test Scenarios:
   - [ ] Happy path user flow
   - [ ] Error handling display
   - [ ] Responsive design (mobile/tablet/desktop)
   - [ ] Accessibility (WCAG 2.1 AA)
   - [ ] Cross-browser compatibility
   - [ ] Performance metrics (Core Web Vitals)
   ```

4. **Performance Validation**:
   - Load time benchmarks
   - Memory usage profiling
   - API response times
   - Database query optimization

### Test Failure Protocol

If tests fail:
1. **Analyze failure** with epct-validator
2. **Think ultrahard** about root cause
3. **Return to Plan phase** with findings
4. **Document lessons learned**

## ✅ Validation Phase (Additional)

Final quality gates before completion.

### Validation Checklist

1. **Code Quality** (via epct-validator):
   - [ ] No critical linting errors
   - [ ] Type safety validated
   - [ ] Cyclomatic complexity within limits
   - [ ] No duplicated code blocks

2. **Security Audit**:
   - [ ] No exposed secrets/keys
   - [ ] Input validation implemented
   - [ ] SQL injection prevention
   - [ ] XSS protection verified
   - [ ] CSRF tokens properly used

3. **Performance Check**:
   - [ ] Bundle size impact assessed
   - [ ] Database queries optimized
   - [ ] Caching strategy implemented
   - [ ] Lazy loading where appropriate

4. **Documentation Complete**:
   - [ ] Code comments for complex logic
   - [ ] README updates if needed
   - [ ] API documentation current
   - [ ] Changelog entry prepared

## 📝 Write-up Phase

Create comprehensive documentation of your work.

### PR Description Template

```markdown
## Summary
[Brief description of changes]

## Motivation
[Why these changes were needed]

## Implementation Details
- Architecture decisions:
- Design patterns used:
- Key technical choices:

## Testing
- Unit test coverage: X%
- Integration tests: [list]
- E2E scenarios tested: [list]
- Performance impact: [metrics]

## Breaking Changes
[List any breaking changes or "None"]

## Migration Guide
[If breaking changes, provide migration steps]

## Checklist
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Security validated
- [ ] Performance verified
- [ ] Code reviewed

## Commands for Reviewers
```bash
# Useful commands for testing
[List commands that reviewers might need]
```
```

### Success Metrics

Track and report:
- Time to completion
- Test coverage achieved
- Performance improvements
- Security issues resolved
- Code quality scores

## MCP Server Integration

This workflow leverages:
- **Context7**: Framework documentation and patterns
- **Exa Search**: Deep research and similar implementations
- **Brave Search**: General web research
- **Sequential Thinking**: Complex problem solving

## Subagent Coordination

All subagents operate with:
- Isolated contexts to prevent pollution
- Specific tool access for security
- Structured return formats for clarity
- Error handling and retry logic

## Error Recovery

If any phase fails:
1. Capture detailed error context
2. Attempt automatic recovery
3. Fall back to manual intervention
4. Document failure for future prevention

---

**Remember**: Quality over speed. A well-planned implementation saves debugging time later.