# ALGO Compass

A full-stack LeetCode practice tracker that analyzes your solving history and recommends which topics to practice next.

The goal is to answer:

> **"What should I practice right now?"**

ALGO Compass uses practice history, topic coverage, recency, and interview relevance to point you toward the areas that deserve attention next.

---

## Features

### Topic Tracking

Browse LeetCode questions grouped by topic.

Each topic has its own page showing:

* Topic rating
* Total questions and completed questions
* Easy / Medium / Hard progress
* List of questions
* Completed question state

### Practice Tracking

Questions can be selected and submitted in batches.

Submitting a question records the latest time it was practiced. Completed questions are then reflected throughout the application.

### LeetCode Synchronization

ALGO Compass can synchronize problems directly from LeetCode using a browser extension.

Since LeetCode does not provide a straightforward way to retrieve a complete list of all problems solved by a user, the extension allows individual problems to be synchronized while browsing LeetCode.

The synchronization flow is:

```text
LeetCode Problem
       ↓
Browser Extension
       ↓
Backend API
       ↓
Prisma
       ↓
PostgreSQL
       ↓
ALGO Compass
```

This approach avoids unnecessarily fetching large amounts of LeetCode data and allows problems to be synced as they are encountered.

### Topic Recommendation

Topics receive a practice-priority score based on practice history.

The current scoring system considers:

* **Recency** — older practice gradually loses its effect.
* **Coverage** — topics with fewer questions practiced relative to their total size receive more attention.
* **Interview bias** — a small additional weighting can favor topics that are more relevant to interviews.

The recommendation system is intentionally designed so that interview bias remains small and does not overpower actual practice history.

### Practice Heatmap

A calendar-style heatmap visualizes practice activity over time.

### Difficulty Analytics

Topic pages show progress broken down by:

* Easy
* Medium
* Hard

Charts and custom progress indicators are used to visualize the data.

---

## Recommendation Model

The practice score uses an exponential decay model.

Multiple solved questions contribute independently to a topic's freshness.

This means that solving one question recently does not completely reset the topic's practice priority.

For example:

```text
Topic A
10 questions 30 days ago

Topic B
1 question solved yesterday
Nothing else recently
```

The system can distinguish these situations instead of only looking at the most recent solve.

Topic coverage is also taken into account so that topics with different numbers of available questions can be compared fairly.

---

## Interview Bias

The interview bias provides a small prior toward topics that are commonly relevant in technical interviews.

For example:

```text
Graph        +3%
Tree         +2%
Dynamic DP   +2%
Segment Tree -1%
```


### Planned Automatic Interview Bias

A future version will periodically collect recent interview-question data from public datasets.

The interview data will be recomputed approximately once every 30 days.

---

## Architecture

ALGO Compass consists of a React frontend, Express backend, PostgreSQL database, and browser extension.

The frontend handles the dashboard and analytics, while the backend manages application logic, synchronization, and database operations.

The browser extension provides the connection between the LeetCode website and ALGO Compass.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Recharts
* date-fns

### Backend

* Node.js
* Express
* Prisma
* PostgreSQL
* REST API

### Browser Extension

* JavaScript
* Browser Extension APIs
* LeetCode page integration

### Database

* PostgreSQL
* Prisma ORM

---

## How It Works

The dashboard retrieves practice data through the backend:

```text
React Dashboard
      ↓
Express API
      ↓
Prisma
      ↓
PostgreSQL
```

When a problem is synchronized from LeetCode:

```text
Open LeetCode Problem
        ↓
Use Browser Extension
        ↓
Problem Data Sent to Backend
        ↓
Stored with Prisma
        ↓
Practice Data Updated
        ↓
Dashboard Analytics Updated
```

---

## Getting Started

### Prerequisites

* Node.js
* npm
* PostgreSQL
* A Chromium-based browser for the extension

### Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/<your-repository>.git
cd <your-repository>
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the backend directory containing the required environment variables.

For example:

```env
DATABASE_URL="your-postgresql-connection-string"
PORT=5000
LEETCODE_SESSION="your Leetcode session token"
```

### Database Setup

From the backend directory:

```bash
npx prisma migrate dev
```

### Running the Application

From the project root:

```bash
npm run dev
```

This starts the frontend and backend development servers together.

---

## Browser Extension Setup

The browser extension is used to synchronize individual LeetCode problems.

To load the extension locally:

1. Open your browser's extension management page.
2. Enable **Developer Mode**.
3. Select **Load unpacked**.
4. Select the project's extension directory.
5. Open a LeetCode problem.
6. Use the extension to synchronize the problem.

---

## Future Work

Some planned improvements include:

* Additional interview-data sources
* Automatic interview-bias updates
* Historical topic-rating graphs
* More detailed practice analytics
* Improved ranking and scoring models
* Improved extension UX
* Production deployment

---

## Motivation

Typical LeetCode trackers answer:

> **"What have I solved?"**

**ALGO Compass** is intended to answer:

> **"What should I solve next?"**

The focus is on turning practice history into **actionable recommendations** rather than simply maintaining a list of completed problems.