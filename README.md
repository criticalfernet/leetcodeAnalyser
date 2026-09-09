# LeetCode Analyser

A personal LeetCode practice tracker that analyzes your solving history and recommends which topics to practice next.

The goal is to move beyond simply tracking solved questions and instead answer:

> **"What should I practice right now?"**

The recommendation system considers how much of a topic has been practiced, how recently it was practiced, and eventually how relevant that topic is in current technical interviews.

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

The interview bias is intended to provide a small prior toward topics that are commonly relevant in technical interviews.

For example:

```text
Graph        +3%
Tree         +2%
Dynamic DP   +2%
Segment Tree -1%
```

The bias is deliberately constrained so that interview relevance only nudges the recommendation rather than dominating personal practice history.

### Planned Automatic Interview Bias

A future version will periodically collect recent interview-question data from public datasets.

The interview data will be recomputed approximately once every 30 days.

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
* Database-backed progress tracking

---

## How It Works

On startup, the application synchronizes its local data and retrieves the available topics.

```text
Sync
 ↓
Topics
 ↓
Questions
 ↓
User Progress
 ↓
Topic Scores
 ↓
Recommendations
```

When visiting a topic:

```text
Topic
 ↓
Questions
 ↓
User progress
 ↓
Difficulty statistics
 ↓
Topic rating
```

---

## Future Work

Some planned improvements include:

* Automatic interview-bias updates
* Historical topic-rating graphs
* Better explanation of why a topic was recommended
* More detailed practice analytics
* Improved ranking and scoring models
* Additional interview-data sources
* More personalization of topic preferences

---

## Motivation

Typical LeetCode trackers answer:

> **"What have I solved?"**

This project is intended to answer:

> **"What should I solve next?"**

The focus is therefore on turning practice history into an recommendation rather than simply maintaining a list of completed problems.
