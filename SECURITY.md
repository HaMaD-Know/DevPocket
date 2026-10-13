# Security Policy

## Supported versions

This project is distributed as static source. Security fixes are applied to the latest commit on the default branch.

## Privacy and threat model

DevPocket is designed so that **user-supplied data never leaves the browser**. There are no backend services, analytics beacons, or third-party APIs that receive your inputs.

Residual risks include:

- Malicious modifications of the HTML/JS if you load the app from an untrusted host
- Browser extensions that can read page content
- Pasting highly sensitive secrets (API keys, production JWTs) into any web page, including this one

**Recommendation:** Prefer running DevPocket from a local file or a server you control when handling sensitive material. The JWT panel displays an explicit warning that signatures are not verified and that secrets should not be pasted into untrusted sites.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security-sensitive reports.

Instead, contact the maintainers privately (for example via a security contact email if published, or a private channel indicated in the repository). Provide:

- A description of the issue
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

We will acknowledge receipt as soon as practical and work on a fix or mitigation. We appreciate responsible disclosure.

## Dependency review

Runtime dependencies: **none**.

Development-only dependencies (optional, for tests):

| Package | Purpose | License |
|---------|---------|---------|
| jest | Test runner | MIT |
| jest-environment-jsdom | DOM environment for Jest | MIT |

No production bundle includes these packages. The application ships as plain HTML, CSS, and JavaScript modules.

Google Fonts are loaded optionally for typography; they do not receive application data. You may remove or self-host the font links if required by your threat model.
