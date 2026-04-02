# Architecture & Diagrams

This folder contains Mermaid source diagrams for the Smart Canteen Web Application.

## Diagrams

- System Architecture: `diagrams/system-arch.mmd`
- Chatbot Workflow: `diagrams/chatbot-workflow.mmd`
- Web App Architecture: `diagrams/web-architecture.mmd`
- Data Schema (ER): `diagrams/data-schema.mmd`

## Export to PNG/SVG

Install Mermaid CLI locally (dev dependency):

```bash
npm i -D @mermaid-js/mermaid-cli
```

Export each diagram (SVG examples):

```bash
npx mmdc -i docs/diagrams/system-arch.mmd -o docs/diagrams/system-arch.svg
npx mmdc -i docs/diagrams/chatbot-workflow.mmd -o docs/diagrams/chatbot-workflow.svg
npx mmdc -i docs/diagrams/web-architecture.mmd -o docs/diagrams/web-architecture.svg
npx mmdc -i docs/diagrams/data-schema.mmd -o docs/diagrams/data-schema.svg
```

PNG output (optional):

```bash
npx mmdc -i docs/diagrams/system-arch.mmd -o docs/diagrams/system-arch.png
```

## Add to root README

Copy/paste the Mermaid blocks or embed the generated SVGs in the root `README.md`, for example:

```markdown
![System Architecture](docs/diagrams/system-arch.svg)
```
