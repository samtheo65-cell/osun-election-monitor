# Election Geography

## Overview

The Osun State Election Monitoring & Result Collation System models the official electoral geography used by the Independent National Electoral Commission (INEC) and the Osun State Government.

The official Osun State Government document is the authoritative source for electoral boundaries and constituency composition.

---

# Administrative Geography

The administrative hierarchy is:

```
Country
    ↓
State
    ↓
LGA
    ↓
Ward
    ↓
Polling Unit
```

Database tables:

- countries
- states
- lgas
- wards
- polling_units

---

# Electoral Geography

Electoral geography is modeled independently from the administrative hierarchy.

```
State
├── Senatorial District
├── Federal Constituency
└── State Constituency
```

Database tables:

- senatorial_districts
- federal_constituencies
- state_constituencies

---

# Electoral Mapping

Two mapping tables connect administrative geography to electoral geography.

## LGA → Federal Constituency

Federal Constituencies are defined by LGA composition.

```
LGA
    ↓
Federal Constituency
```

Table:

```
lga_federal_constituencies
```

Example:

```
Boluwaduro
        ↓
Boluwaduro/Ifedayo/Ila
```

---

## Ward → State Constituency

State Constituencies are defined by Registration Area (Ward) composition.

```
Ward
    ↓
State Constituency
```

Table:

```
ward_state_constituencies
```

Example:

```
ADA I
      ↓
Boripe/Boluwaduro
```

---

# Important Design Decision

Federal Constituencies and State Constituencies are siblings.

They are NOT parent-child relationships.

This is based on the official Osun State Government publication.

Example:

Federal Constituency

```
Boluwaduro/Ifedayo/Ila
```

State Constituency

```
Boripe/Boluwaduro
```

Since these represent different groupings, the following relationship does not exist:

```
Federal Constituency
        ↓
State Constituency
```

Instead:

```
State
├── Federal Constituency
└── State Constituency
```

---

# Deprecated Design

The following table is intentionally not used:

```
lga_state_constituencies
```

Reason:

State Constituencies are officially defined by Wards (Registration Areas), not by LGAs.

---

# Official Osun State Totals

Administrative Geography

- Countries: 1
- States: 1
- LGAs: 30
- Wards: 332
- Polling Units: 3,763

Electoral Geography

- Senatorial Districts: 3
- Federal Constituencies: 9
- State Constituencies: 26

Mappings

- LGA → Federal Constituency: 30
- Ward → State Constituency: 332

---

# Data Source

Official Osun State Government publication.

This document replaces all earlier research-based constituency mappings.

All future development should reference this official structure.