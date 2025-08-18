---
description: Ultra-advanced EPCT workflow with full MCP integration, parallel agents, and senior engineering practices
allowed-tools: Task, Read, Write, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite, WebSearch, WebFetch, LS, mcp__serena__*, mcp__context7__*, mcp__exa__*, mcp__exa-search__*, mcp__brave-search__*, mcp__shadcn-ui__*, mcp__sequential-thinking__*, mcp__playwright__*, mcp__tweakcn__*
argument-hint: "[task-description] [--think-mode standard|deep|ultra] [--parallel-limit N] [--skip-validation] [--browser-test] [--deep-research]"
---

# Ultra-Advanced EPCT Workflow with Full MCP Integration

This workflow implements a comprehensive EPCT (Explore, Plan, Code, Test) methodology with maximum MCP server utilization, parallel subagent execution, and enterprise-grade engineering practices.

## 🚀 MCP Server Arsenal

This workflow leverages ALL available MCP servers for maximum efficiency:

### Code Intelligence
- **Serena**: Semantic code analysis, symbol navigation, project memories
- **Context7**: Framework documentation, API references, best practices
- **Shadcn-UI**: UI component library, design patterns, blocks

### Research & Discovery
- **Exa Search**: Deep AI-powered research, company research, crawling
- **Brave Search**: Web search, local search, real-time information
- **WebFetch**: Direct URL content extraction

### Development Tools
- **Sequential Thinking**: Complex problem solving, multi-step reasoning
- **Playwright**: Browser automation, E2E testing, visual validation
- **Tweakcn**: Registry-based project structure management

## 🔍 EXPLORE PHASE - Multi-Dimensional Analysis

### Phase 1A: Semantic Code Exploration (Parallel)

```yaml
Task 1 - Serena Deep Dive:
  Agent: epct-explorer
  Actions:
    - mcp__serena__list_memories # Check existing project knowledge
    - mcp__serena__list_dir recursive=true # Map project structure
    - mcp__serena__get_symbols_overview # Understand code architecture
    - mcp__serena__find_symbol # Locate specific implementations
    - mcp__serena__find_referencing_symbols # Track dependencies
  Returns:
    - Symbol map with relationships
    - Architecture patterns identified
    - Risk assessment for modifications
    - Existing project memories

Task 2 - Framework Documentation:
  Agent: epct-researcher  
  Actions:
    - mcp__context7__resolve-library-id # Find framework docs
    - mcp__context7__get-library-docs # Get implementation patterns
    - mcp__shadcn-ui__list_components # Available UI components
    - mcp__shadcn-ui__get_component_metadata # Component specifications
  Returns:
    - Framework best practices
    - Component usage patterns
    - API documentation
    - Version compatibility info

Task 3 - Deep Web Research:
  Agent: epct-researcher
  Actions:
    - mcp__exa__deep_researcher_start # Comprehensive research
    - mcp__brave-search__brave_web_search # Current trends
    - mcp__exa__company_research_exa # Business context
    - mcp__exa__linkedin_search_exa # Expert opinions
  Returns:
    - Industry best practices
    - Similar implementations
    - Security considerations
    - Performance benchmarks
```

### Phase 1B: Project Registry Analysis

```yaml
Task 4 - Registry Inspection:
  Actions:
    - mcp__tweakcn__get_items # List registry items
    - mcp__tweakcn__get_item # Analyze specific items
  Returns:
    - Existing components
    - Reusable patterns
    - Project conventions
```

### Expected Structured Returns

```
=== EXPLORATION REPORT ===

## SEMANTIC ANALYSIS (via Serena)
Symbol Map:
  - Class: [name] at [location]
    Methods: [list]
    References: [count] locations
    Risk: [low|medium|high]
  
Architecture Patterns:
  - Pattern: [name]
    Usage: [where/how]
    Consistency: [score]

Project Memories:
  - Memory: [name]
    Relevance: [why useful]
    Content: [key points]

## FRAMEWORK INSIGHTS (via Context7)
Documentation:
  - Library: [name] v[version]
    Patterns: [recommended approaches]
    Warnings: [known issues]
    Examples: [code snippets]

UI Components (via Shadcn):
  - Available: [component list]
  - Recommended: [for this task]
  - Blocks: [relevant blocks]

## RESEARCH FINDINGS (via Exa/Brave)
Best Practices:
  - Source: [authority]
    Recommendation: [practice]
    Rationale: [why]

Similar Implementations:
  - Project: [name]
    Approach: [description]
    Lessons: [what to adopt/avoid]

Security Patterns:
  - Threat: [type]
    Mitigation: [approach]
    Implementation: [how]

## REGISTRY STATUS (via Tweakcn)
Existing Items:
  - Component: [name]
    Reusable: [yes/no]
    Modification: [needed changes]

=== END REPORT ===
```

## 📋 PLAN PHASE - AI-Augmented Strategy

### Phase 2A: Sequential Thinking Analysis

```yaml
Deep Planning Task:
  Tool: mcp__sequential-thinking__sequentialthinking
  Input:
    thought: "Analyze exploration findings and create implementation strategy"
    totalThoughts: 10
    thoughtNumber: 1
  Process:
    - Decompose problem into steps
    - Identify critical paths
    - Evaluate alternatives
    - Generate hypothesis
    - Verify approach
  Returns:
    - Step-by-step plan
    - Risk mitigation strategies
    - Alternative approaches
    - Success criteria
```

### Phase 2B: Research Validation (Parallel)

```yaml
Task 1 - Documentation Verification:
  Agent: epct-planner
  Actions:
    - mcp__context7__get-library-docs topic="[specific-api]"
    - mcp__exa__crawling_exa url="[official-docs]"
  Returns: Verified implementation patterns

Task 2 - Security Audit Planning:
  Agent: epct-security
  Actions:
    - mcp__exa__deep_researcher_start "security best practices for [feature]"
    - mcp__brave-search__brave_web_search "OWASP [technology] vulnerabilities"
  Returns: Security checklist and requirements

Task 3 - Performance Baseline:
  Agent: epct-performance
  Actions:
    - mcp__serena__search_for_pattern "performance|benchmark|metric"
    - WebFetch url="[performance-docs]"
  Returns: Performance targets and constraints
```

### Comprehensive Plan Structure

```markdown
## IMPLEMENTATION PLAN

### Architecture Design
- [ ] Component Structure (validated via Context7)
- [ ] Design Patterns (confirmed via Serena analysis)
- [ ] SOLID Principles (checked via Sequential Thinking)
- [ ] State Management (researched via Exa)
- [ ] Error Boundaries (security validated)

### Technical Specifications
- [ ] API Contracts (Context7 validated)
- [ ] Data Models (Serena symbol analysis)
- [ ] Type Definitions (existing patterns)
- [ ] Validation Rules (security requirements)
- [ ] Performance Budgets (baseline + 10%)

### Implementation Sequence
1. Core Logic (using patterns from Serena memories)
2. API Integration (Context7 documentation)
3. UI Components (Shadcn-UI blocks)
4. Error Handling (Exa research patterns)
5. Performance Optimization (benchmarks)

### Quality Assurance Plan
- [ ] Unit Tests (>85% coverage)
- [ ] Integration Tests (API + DB)
- [ ] E2E Tests (Playwright automation)
- [ ] Visual Regression (Playwright screenshots)
- [ ] Performance Tests (metrics tracking)
- [ ] Security Scan (OWASP checklist)

### Risk Mitigation
- Risk: [identified via Serena]
  Mitigation: [strategy from research]
  Fallback: [alternative approach]
```

## 💻 CODE PHASE - Intelligent Implementation

### Phase 3A: Pre-Implementation Setup

```yaml
Registry Check:
  - mcp__tweakcn__init # Initialize if needed
  - mcp__tweakcn__add_item # Add new components

Memory Creation:
  - mcp__serena__write_memory # Document decisions
```

### Phase 3B: Parallel Implementation

```yaml
Task 1 - Core Implementation:
  Agent: epct-coder
  Tools: Write, Edit, mcp__serena__replace_symbol_body, mcp__serena__insert_*
  Guidance:
    - Use Serena for precise symbol manipulation
    - Follow Context7 framework patterns
    - Apply Shadcn-UI components where applicable

Task 2 - Test Creation:
  Agent: epct-test-writer
  Tools: Write, mcp__context7__*, mcp__playwright__*
  Actions:
    - Write unit tests with Context7 patterns
    - Create Playwright E2E tests
    - Setup visual regression tests

Task 3 - Documentation:
  Agent: epct-documenter
  Tools: Write, mcp__exa__*, mcp__brave-search__*
  Actions:
    - Generate API documentation
    - Create user guides
    - Update README with examples
```

### Code Quality Validation (Continuous)

```bash
# Parallel validation during coding
- Lint check (via Bash)
- Type check (via Bash)
- Security scan (via epct-security agent)
- Bundle analysis (via Bash)
- Serena symbol validation
```

## 🧪 TEST PHASE - Comprehensive Validation

### Phase 4A: Automated Testing Suite

```yaml
Unit Tests:
  Agent: epct-tester
  Commands:
    - pnpm test:unit --coverage
    - Analyze coverage gaps
    - Fill missing tests
  Success: >85% coverage, all passing

Integration Tests:
  Agent: epct-tester
  Actions:
    - Test API endpoints
    - Validate database operations
    - Check external integrations
  Success: All scenarios passing

E2E Browser Tests:
  Agent: epct-browser-tester
  MCP Tools:
    - mcp__playwright__browser_navigate
    - mcp__playwright__browser_snapshot
    - mcp__playwright__browser_click
    - mcp__playwright__browser_take_screenshot
  Scenarios:
    - User workflows
    - Responsive design
    - Accessibility (WCAG)
    - Performance metrics
  Success: All flows working, screenshots validated
```

### Phase 4B: Visual & Performance Testing

```yaml
Visual Regression:
  Tools: mcp__playwright__browser_take_screenshot
  Process:
    - Capture baseline screenshots
    - Compare with previous version
    - Flag visual differences
  Success: No unintended changes

Performance Benchmarks:
  Tools: mcp__playwright__browser_network_requests, Bash
  Metrics:
    - Load time < 3s
    - Bundle size within budget
    - Memory usage stable
    - API response < 200ms
  Success: All metrics within targets
```

## ✅ VALIDATION PHASE - Enterprise Quality Gates

### Phase 5A: Comprehensive Audit

```yaml
Security Validation:
  Agent: epct-security
  Checks:
    - No exposed secrets (Grep patterns)
    - Input validation (Serena analysis)
    - XSS prevention (Playwright tests)
    - CSRF protection (Code review)
    - Dependency vulnerabilities (npm audit)

Code Quality:
  Agent: epct-validator
  Tools: mcp__serena__*, Grep, Bash
  Metrics:
    - Cyclomatic complexity < 10
    - No duplicated code
    - Consistent patterns
    - Proper error handling
    - Memory leak detection

Documentation Completeness:
  Checks:
    - API docs generated
    - README updated
    - Migration guide (if needed)
    - Changelog entry
    - Code comments for complexity
```

### Phase 5B: Final Verification

```yaml
Production Readiness:
  - [ ] All tests passing
  - [ ] Performance within budgets
  - [ ] Security scan clean
  - [ ] Documentation complete
  - [ ] Rollback plan documented
  - [ ] Monitoring configured
```

## 📝 WRITE-UP PHASE - Professional Documentation

### Automated Report Generation

```yaml
PR Description Generator:
  Inputs:
    - Serena memories (decisions made)
    - Test results (coverage, performance)
    - Security scan results
    - Breaking changes identified
  
  Output:
    - Executive summary
    - Technical details
    - Testing evidence
    - Migration guide
    - Rollback procedures
```

### Success Metrics Dashboard

```markdown
## Implementation Metrics

### Efficiency
- Exploration Time: [automated tracking]
- Implementation Speed: [lines/hour]
- Test Coverage: [percentage]
- Bug Discovery Rate: [pre-release]

### Quality
- Code Complexity: [average score]
- Security Score: [OWASP compliance]
- Performance Impact: [benchmarks]
- Documentation Score: [completeness]

### MCP Utilization
- Serena Queries: [count]
- Context7 Lookups: [count]
- Exa Research: [deep research tasks]
- Playwright Tests: [scenarios run]
```

## 🔄 Continuous Improvement

### Post-Implementation

```yaml
Learning Capture:
  - mcp__serena__write_memory "lessons_[date]"
  - Update project patterns
  - Refine subagent prompts
  - Optimize MCP usage

Performance Analysis:
  - Which MCP servers were most valuable?
  - Where did parallelization help most?
  - What patterns should become standards?
```

## 🚨 Intelligent Error Recovery

### MCP Server Fallbacks

```yaml
If Serena Unavailable:
  Fallback: Standard Read/Grep/Glob
  Note: Degraded semantic analysis

If Context7 Unavailable:
  Fallback: WebSearch for documentation
  Note: May have outdated patterns

If Exa Unavailable:
  Fallback: Brave Search only
  Note: Less comprehensive research

If Playwright Unavailable:
  Fallback: Manual testing instructions
  Note: No automated browser testing
```

### Recovery Strategies

1. **Capture full context** before retrying
2. **Use alternative MCP servers** where possible
3. **Document degraded capabilities** in report
4. **Adjust success criteria** if needed

---

**Remember**: This advanced workflow maximizes efficiency through parallel execution and comprehensive MCP utilization while maintaining the highest quality standards. Use the full power of available tools!