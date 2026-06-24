# Osun Election Monitoring System
## Database Design

### Geography Hierarchy

Country
└── State
    ├── Senatorial District
    ├── Federal Constituency
    ├── State Constituency
    └── LGA
        └── Ward
            └── Polling Unit

### Principles

- Every record has a Primary Key.
- Relationships use Foreign Keys.
- Avoid duplicate data.
- Preserve referential integrity.
- Design for future expansion beyond Osun State.