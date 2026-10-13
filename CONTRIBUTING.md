# Contributing to DevPocket

Thank you for your interest in improving DevPocket.

## Ways to contribute

- Report bugs or request features via GitHub Issues
- Improve accessibility, documentation, or tests
- Add small, focused enhancements that stay within the project’s scope
- Fix typos or clarify error messages

## Development setup

1. Fork and clone the repository.
2. Open `index.html` via a local static server (e.g. `npx serve . -l 3000`).
3. Make changes in small, focused commits.
4. Run the unit tests:

   ```bash
   node tests/run-tests.js
   ```

5. Manually verify the tools you touched in both light and dark themes, and on a narrow viewport if UI changed.

## Guidelines

- **Keep it dependency-light.** Prefer vanilla HTML/CSS/JS. Avoid adding runtime dependencies unless there is a strong, documented need.
- **Privacy first.** Never send user input to external servers. Do not add analytics or tracking.
- **Security.** Use `textContent` (or equivalent safe APIs) for user-provided content. Avoid `innerHTML` with untrusted data.
- **Accessibility.** Maintain keyboard navigation, focus styles, and appropriate ARIA attributes.
- **Code style.** Match existing formatting: ES modules, clear function names, short comments where intent is non-obvious.
- **Tests.** Add or update tests for new utility functions and edge cases.

## Pull requests

- Open a PR against the main branch with a clear description of the change and why it is needed.
- Reference related issues.
- Keep PRs focused; large unrelated changes are harder to review.
- Ensure the pure-Node test runner passes.

## Code of conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
