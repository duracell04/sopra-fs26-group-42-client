# SoPra FS26 Assignment 3

Source PDF: `SoPraFS26_Assignment_3.pdf`

## 1. General Information

With Milestone 3, SoPra enters the implementation phase.

The deadline is **Friday, 24.04.2026, 23:59 CET** and includes the deliverables listed below.

On the following Monday, **27.04.2026**, you will present a short progress update for Milestone 3.

### 1.1 Deliverables Overview

Important:

The staff will check your **last deployment after the deadline**. Do **not** deploy between the deadline and the presentation on the following Monday.

- **Report**: PDF named `FS26-Group-XX-M3-Report.pdf`
- **Presentation Slides**: PDF named `FS26-Group-XX-M3-Slides.pdf`
- **Source Code and Project Board**: hosted on GitHub with git tag `M3`
- **Continuous Progress**: weekly, individual completion of 2 meaningful development tasks
- **Team Questionnaire and Brownie Points**: individually submitted via OLAT

## 2. Assignment Description

Based on Milestone 2, you should now have:

- specifications
- diagrams
- UI mockups
- Sprint planning
- a deployment pipeline

These artifacts should support the implementation phase.

In this milestone, the focus is on:

- implementation
- testing

### 2.1 Implementation and Testing

By the end of Milestone 3, you are expected to have a running and usable version of your application, even if not all features are implemented yet.

The application should target a modern browser.

Target platforms:

- `Google Chrome`
- `Vercel`

Advice:

It is strongly recommended to finish all required or critical tasks by the end of Milestone 3. Milestone 4 should focus on finishing and polishing the application for the final presentation.

Depending on your progress, you may begin optional features during Milestone 3, but there will also be time for them in Milestone 4.

After Milestone 3, there will be a beta testing phase:

- your group will receive another group's project URL and provide feedback
- another group will test your application and prepare feedback

This means your project should already have a reasonable level of maturity by the end of Milestone 3.

Proper software development also requires rigorous testing.

For the server, you must have a high degree of test coverage in:

- unit tests
- integration tests
- REST interface tests

Required minimum:

- at least `50%` test coverage on the server
- SonarQube should be used to check the coverage metric
- every back-end task should have at least `1` associated test

### 2.2 Project Maintenance with GitHub

While programming, you are required to maintain traceability of your progress.

Your GitHub issues and project boards should always be up to date, and your git commits should be linked to a GitHub issue.

There are two ways to achieve consistency and traceability between source code and development tasks:

- **Manual**: open a GitHub issue and add the commit SHA1 as an issue comment
- **Automated**: reference GitHub issues in the git commit message

Note:

Every completed development task is expected to link to at least one commit.

### 2.3 Weekly TA Meetings

During the Sprint of Milestone 3, you will have regular weekly meetings with your teaching assistant.

During the implementation phase, these meetings should resemble a `Daily Scrum`:

- a short status update for your Scrum Master (TA) and your team

Before each meeting, each team member must manually append the **two development tasks completed in the previous week** to a Markdown file named:

`contributions.md`

This file must be stored in the client repository.

The file acts as a log of your individual contributions for the remainder of the course.

Each member has to complete at least `2` meaningful tasks per week.

Expected task granularity:

- each development task should be about `0.5` to `1` day of work

The completed tasks must be shown during the weekly TA meetings.

You have:

- one `Joker` to miss one weekly TA meeting
- one `Joker` to skip continuous progress once during the remaining weeks of the course

Important:

- you cannot make up missed continuous progress later
- you can work ahead by completing twice the amount of work in one week, then skip progress in a later week without using a joker
- communicate this planning ahead of time

During the meeting, every team member should provide a `3-minute` update answering:

- What did I do last week?
- What will I do this week?
- What are the obstacles to progress?

Suggested discussion basis:

- the `Sprint Backlog View` created in Assignment 2
- the `contributions.md` log

### 2.4 Planning of Sprint 2

Toward the end of this milestone, you should begin planning the second and final Sprint.

Go through the remaining user stories and decide which ones to implement in Milestone 4.

Set a GitHub Milestone such as `Sprint 2` to mark the selected stories.

Follow the guidelines from the previous assignment sheet to decompose these stories into development tasks.

## 3. Grading and Deliverables

SoPra is a pass/fail course, and the grade for M3 is pass/fail as well.

Overall:

- you must pass `3 out of 4` milestones
- Milestones `1` and `4` must be passed
- reasonable reports are expected for all milestones

You will receive feedback on your deliverables in the weeks after the deadline, including one of:

- pass
- borderline pass
- fail

### Report

Submit the report as a PDF to OLAT using the filename:

`FS26-Group-XX-M3-Report.pdf`

The group leader submits it.

The title page must contain:

- group name
- group leader
- all group members
- each member's name and matriculation number

The report must include:

- a diagram showing the latest database layout or structure
- `2-3` screenshots of the user interface
- one complex unit test
- one integration test
- one REST interface test
- descriptions of the use cases for those tests

For the three test examples, explain:

- why they are well written for the tested functionality
- how they can capture future regressions
- why they are good representatives of their category

Assessment focuses on:

- quality of the database structure diagram
- quality of the UI screenshots
- quality of the 3 test cases

### Presentation (Slides)

Submit the slides as a PDF to OLAT using the filename:

`FS26-Group-XX-M3-Slides.pdf`

The group leader submits them.

The presentation must:

- stay within `3 minutes` total
- be in English
- contain 2 components:
  - project introduction and motivation: `30 seconds`
  - live demo: `2 minutes 30 seconds`

Important:

- the demo is expected to be live
- use the deployed version
- keep backup screenshots in case something goes wrong

Suggested focus:

- highlight the exciting parts of your application
- feel free to skip setup steps such as registration or lobby setup to preserve time for the core features

The title slide must contain:

- group name
- names of all group members

Underline the presenter names on the title slide.

Each team member must present at least once across:

- M1 + M2
- M3
- M4

### Source Code and Project Board

Submit the source code by adding git tags `M3` to commits on the `main` branches that should be graded.

The staff will partially assess:

- the source code
- overall implementation progress

By the end of Milestone 3, the expectation is a deployed and reasonable prototype that is ready for beta testing.

Testing expectations:

- tests must be meaningful and help identify bugs
- getter and setter tests are not considered valuable
- tests should focus on core application logic
- every back-end task should have at least `1` associated test
- SonarQube coverage should reach `50%`

The GitHub Projects board is submitted implicitly and should already be `public`.

The board should show:

- the Product Backlog
- user stories
- development tasks
- a view of the upcoming Sprint Backlog

Assessment focuses on:

- covered development effort
- decomposition of user stories into development tasks
- quality and consistency of project management

### Continuous Progress

During the remaining milestones, each team member must contribute continuously.

Specifically:

- each member must complete at least `2` meaningful tasks per week
- each task should have a granularity of `0.5` to `1` day
- completed tasks must be shown in weekly TA meetings
- work must be traceable through linked commits and task references
- the `contributions.md` log must be kept up to date

Joker rules:

- one joker can be used to miss one weekly TA meeting
- one joker can be used to skip continuous progress once over the remaining weeks
- missed continuous progress cannot be made up later
- working ahead is allowed if you communicate the plan in advance

Note:

If a team member fails to show continuous progress after using their joker, they will individually fail the course unless there is a valid reason.

### Team Questions and Brownie Points

Each student must distribute brownie points to themselves and their team members.

The points should reflect how you evaluate:

- your own contribution to others
- the contribution of other team members to your learning
- the contribution of other team members to the assignment
- the contribution of other team members to the team's performance

Guidelines:

- you may distribute points equally if everyone contributed equally
- each student has `50` brownie points to distribute to `5` team members
- if your team has `4` members, only distribute `40` points

Brownie points help identify team concerns early and may affect pass/fail decisions in borderline cases.

## 4. Important

To ensure smooth and successful progression throughout the SoPra course, keep the following points in mind for all assignments:

1. **Continuous contribution is essential**. Your TA will assess your weekly progress before each TA meeting, except during the week of spring break.
2. **Effective use of the joker for continuous contribution**: you can use one joker throughout the semester. Announce it in advance. Failing to do so results in a fail for that week.
3. **Communication with TAs**: discuss their availability to answer questions and respond to your queries. They are not expected to be available `24/7`, especially on weekends.
4. **Deployment policy**: you may only deploy before the deadline. Deploying after the deadline results in an automatic fail for the milestone.
5. **Repository privacy**: setting repositories to private prevents TAs from reviewing your work and results in an automatic fail for the duration they remain private.
6. **Commit standards**: TAs will only consider commits that include a task or issue number. Make sure commits are labeled appropriately.
7. **Persistence in project work**: students are expected to continue working on the application until they receive a clear fail. Lack of assessment from the last milestone is not a valid excuse to stop.
