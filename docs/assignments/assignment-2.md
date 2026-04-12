# SoPra FS26 Assignment 2

Source PDF: `SoPraFS26_Assignment_2.pdf`

## 1. General Information

The focus of Milestone 2 is on designing, specifying, and planning the upcoming implementation phase of your project.

The deadline is **Friday, 20.03.2026, 23:59 CET** and includes the deliverables listed below.

On the following Monday, **23.03.2026**, you will present a short combined progress update for Milestones 1 and 2.

### 1.1 Deliverables Overview

- **Report**: PDF named `FS26-Group-XX-M2-Report.pdf`
- **Presentation**: PDF named `FS26-Group-XX-M2-Slides.pdf`
- **Application URLs**: deployment, GitHub, and SonarQube URLs submitted via OLAT form
- **Source Code and Projects Board**: hosted on GitHub, public, with git tags `M2`
- **Team Questions (including Brownie Points)**: individually submitted via OLAT

## 2. Assignment Description

During Milestone 1, you familiarized yourself with the infrastructure and formulated user stories for your application.

Based on feedback for the M1 report and the created artifacts, you now need to:

- refine the user stories
- decide which stories to include in the first sprint
- create UML diagrams
- define the interface specification
- create UI mockups

After this milestone, you should have a clear understanding of how the implementation phase of Milestone 3 should look.

### 2.1 Diagrams

Based on the user stories from M1, create a design for the web service using UML component, class, and activity diagrams.

#### Component Diagram

Define the architecture of your application using a component diagram.

These diagrams are used to visualize the organization and relationships among components in a system.

There are at least three major components in your application:

- client
- server
- database

Define these components and how they interact. Specify the interconnections among components using provided and required interfaces.

#### Class Diagram

Domain modeling helps identify the relevant concepts or entities that describe the domain of your system.

Example:

- in a typical board game, `Game` and `Player` would be domain entities

Use a class diagram to define the domain model of your back-end system.

A domain model is a set of major classes that represent the application, including an indication of what will be persisted.

You do **not** need to model auxiliary classes used in the Spring Boot ecosystem, such as:

- repositories
- controllers
- services

Choose the granularity of the class diagram so that, together with the user stories, it serves as a solid basis for implementing the back-end.

#### Activity Diagram

Model the overall workflow of the system with an activity diagram.

Choose a granularity that reflects the most important activities of the application.

Example:

- in UNO, one activity could be `drawing cards from the stack`

An activity diagram is used to represent the flow from one activity to another. Its purpose is to identify which activities the system must provide and how they are associated with conditions and constraints.

### 2.2 Specification of the REST Interface

Communication between client and server will use a REST interface.

Create a specification for this REST interface. In particular, describe:

- entities
- operations
- parameters
- parameter types
- returned values
- HTTP status codes

For an example of a REST specification, refer to Assignment 1.

With a precise specification, client and server developers should be able to work independently.

Advice:

- use HTTP methods as intended
- use HTTP status codes to indicate valid and invalid requests
- optionally design the interface to follow the `HATEOAS` principle

### 2.3 User Interface Design - Mockups

Create mockups for the **entire user interface** of your future web application.

Describe the flow between the different screens of your application. In particular, explain how the application transitions from one screen to another.

Example:

- after a successful login, the lobby screen is shown

Advice:

You may use a dedicated tool to create the mockups, for example:

- `Figma`
- `Lucidchart`
- `Adobe XD`
- `Balsamiq Mockups`

For some tools, especially `Figma`, you should register with your UZH email address to benefit from student packages and collaborative features.

### 2.4 Setting Up Development Infrastructure

During this milestone, one group member has to prepare the development infrastructure ahead of Milestone 3.

This task is fulfilled if your group has **one commit in the client repository** that changes the UI to display your group name on the deployed client.

#### GitHub and Deployment

To set up GitHub and Google Cloud / Vercel deployment, reuse the setup described in Milestone 1 with minor adjustments.

Recommended setup:

- server on `Google Cloud`
- client on `Vercel`

You may deploy both on one platform, but if you do, support will not be provided if issues occur.

1. Create the client and server template repositories as described in Assignment 1.
   - Make sure both repositories are **public**
   - Add all team members as collaborators

2. Set up the server deployment on Google Cloud using the project name:
   `sopra-fs26-group-XX-server`

3. In Google Cloud, invite your team members:
   - go to `IAM & Admin > IAM > Grant Access`
   - enter the email addresses of your peers as `New Principals`

4. Set up the client deployment on Vercel using the project name:
   `sopra-fs26-group-XX-client`

5. Vercel usually deploys automatically for every push when the repository is connected to GitHub.
   If deployments are not triggered automatically, for example due to permission or configuration issues, you may set up a GitHub Action to automate deployments.
   You can:
   - follow the official guide
   - use the preconfigured workflow file `.github/workflows/verceldeployment.yml`

   Verify that deployments are triggered automatically in your setup so you do not accidentally deploy after the deadline.

   If you prefer, you may disable automatic GitHub deployments and rely only on the GitHub Action workflow by configuring:
   `github.autoJobCancellation` in `vercel.json`

6. For the GitHub Action to work correctly, add the required Vercel secrets to your GitHub repository under:
   `Settings > Secret and variables > Actions > New repository secret`

   Required secrets:

   - `VERCEL_TOKEN`
     - go to `Vercel > Account Settings > Tokens`
     - create a token
     - select your project as the scope
     - choose an expiration date
     - copy the generated token

   - `VERCEL_ORG_ID`
     - go to `Vercel > Account Settings > General`
     - scroll to `Vercel ID`
     - copy it

   - `VERCEL_PROJECT_ID`
     - go to the Vercel Dashboard
     - select your project
     - go to `Project Settings`
     - scroll to `Project ID`
     - copy it

7. Finally:
   - commit and push the repository changes that display your group name
   - set git tags named `M2` on the `main` branches

#### SonarQube for Code Quality

In addition to the basic setup, you will use SonarQube to measure code quality.

The course uses the free cloud services from SonarQube for open-source projects.

1. One team member creates an account on SonarCloud using the `GitHub` sign-in option.
   Follow the installation guide and set up both the server and client projects.

   If asked to add an organization, select your GitHub username.

2. In the project dashboard under `Administration`, click:
   - `Analysis Method`
   - then `With GitHub Actions`

   Set the `SONAR_TOKEN` as instructed.

   For the server project, choose:
   - `Gradle`

   For the client project, choose:
   - `Other (for JS, TS, Go, Python, PHP, ...)`

3. For the server repository, set the SonarQube properties in `build.gradle` as shown in the SonarCloud instructions.

4. For the client repository, update the SonarQube properties in:
   `sonar-project.properties`

If the configuration is correct, the next push to `main` should show a quality assessment in the SonarCloud dashboard.

### 2.5 Scrum Setup on GitHub

After establishing user stories in Milestone 1, refine them and transfer them to GitHub using **Issues** for Milestones 3 and 4.

#### User Stories as GitHub Issues

1. Enter each revised user story as a GitHub Issue in the server repository.
2. Use the title field for the user story in role-goal-benefit format.
3. In the description, use Markdown to create a task list of acceptance criteria.
4. Ensure the stories are not too broad. Very large acceptance-criteria lists are usually a warning sign.

#### GitHub Projects Board

To keep track of user stories and development tasks, set up a GitHub Projects board.

1. Create a new GitHub Projects board:
   `GitHub > Projects > New project`
   Make sure its visibility is `public`.

2. Make the hidden fields `Repository` and `Milestone` visible.

3. Define these custom fields:
   - `Type` with options:
     - `User Story`
     - `Task`
   - `Priority` with options:
     - `high`
     - `medium`
     - `low`
   - `Time Estimate (h)` as a number field
   - `Week` as an iteration field
     - start date should be the first weekly TA meeting date after M2

4. Add all user-story issues from the server repository to the board and set their `Type` to `User Story`.

#### Sprint 1 Setup

SoPra follows the Scrum methodology.

In Scrum, software development is organized in **Sprints**, which are time-boxed efforts. Since you are not working full time on the project, milestone meetings act as Sprint deadlines.

Set up the Sprint for Milestone 3 as follows:

1. Create a GitHub Milestone named `Sprint 1`.
2. Set its end date to the Milestone 3 deadline.
3. Assign this milestone to the user stories you plan to work on during Sprint 1.
4. Create a GitHub Projects board view of type `Board`.
5. Filter it with:
   `Milestone: Sprint 1`
6. Save the modified view.

#### Development Tasks

During a Sprint, you work on development tasks that are derived from user stories.

A development task:

- is smaller and more manageable than a user story
- should be assigned to one team member

Set up development tasks like this:

1. In each selected user story, create a Markdown task list of development tasks.
2. Convert each task list item into a GitHub Issue using `Convert to Issue`.
   You may need to refresh the browser tab first.
3. Notice that the generated development-task issues are tracked by the parent user-story issue.
4. Transfer front-end development tasks to the client repository.
5. Add all development-task issues to the GitHub Projects board.
6. Set their `Type` field to `Task`.
7. Add priorities and time estimates.

Rule of thumb:

- each development task should not take longer than one day
- shorter tasks are generally better

Advice:

With Scrum, you should aim for a **shippable product** after each Sprint. In the Milestone 3 presentation, you are expected to show a running application with a basic feature set. For that reason, most implementation work should be planned during Milestone 3.

### 2.6 Optional: Setting Up Hugging Face

If you would like to use Hugging Face, for example for model inference or generative AI chat completion, you can do so through the `UZHedu` Hugging Face organization free of charge.

This is completely optional and counts as your external API.

Important:

- if you want to use Hugging Face, you must complete the setup **by March 15**
- after that date, joining is no longer possible

1. If you do not yet have a Hugging Face account registered with your `@uzh.ch` email, create one using that address.
   Important: if you sign up with any other email address, your account will be removed from the `UZHedu` organization.

2. Use the invitation link to join the `UZHedu` Hugging Face organization while logged into your `@uzh.ch` account.
   The invite is valid only until March 15.

3. Generate a personal access token at:
   `https://huggingface.co/settings/tokens`

   Select the permissions you need, paying special attention to organization permissions.

   For inference providers:
   - search for `UZHedu` under `Org permissions`
   - enable all inference-related permissions for the `UZHedu` organization

4. In your code, route billing to the `UZHedu` organization, not to a personal account, by setting:

```python
client = InferenceClient(
    provider="<provider-name>",
    api_key="<personal-access-token>",
    bill_to="UZHedu"
)
```

5. Use the Hugging Face API responsibly and with common sense. Usage is monitored to ensure fair access for everyone.

## 3. Grading and Deliverables

SoPra is a pass/fail course, and the grade for M2 is pass/fail as well.

Overall:

- you must pass `3 out of 4` milestones
- Milestones `1` and `4` must be passed
- reasonable reports are expected for all milestones

You will receive feedback on your deliverables in the weeks following the deadline, including one of:

- pass
- borderline pass
- fail

### Report

Submit the report as a PDF to OLAT with the filename:

`FS26-Group-XX-M2-Report.pdf`

The group leader submits it.

The report should contain:

- the 3 UML diagrams
- a REST specification
- mockups

Assessment criteria include:

- quality and completeness of the UML diagrams
- clarity of the mockups
- quality, feasibility, and completeness of the proposed REST APIs

The title page must contain:

- group name
- group leader
- all group members
- name and matriculation number of each member
- GitHub handle of each member

### Presentation Slides

Submit the slides as a PDF to OLAT with the filename:

`FS26-Group-XX-M2-Slides.pdf`

The group leader submits them.

The presentation must:

- include results from Milestones 1 (group phase) and 2
- stay within `3 minutes` total
- be in English

Suggested focus:

- introduce and motivate the project clearly
- use user stories and mockups to explain the key functionality

The title slide must include:

- group name
- names of all group members

Underline the presenter names on the title slide.

Each team member must present at least once across:

- M1 + M2
- M3
- M4

### Application URLs

The group leader submits application URLs via an OLAT form.

This includes:

- deployment URLs on Google Cloud and Vercel
- GitHub repository URLs
- SonarQube URL

The infrastructure setup is considered complete when the deployed front-end displays your group name.

### Source Code and Projects Board on GitHub

Submit the source code by:

- setting the repositories to `public`
- adding git tags `M2` to commits on the `main` branches that should be graded

The GitHub Projects board is submitted implicitly and must also be `public`.

The board should show:

- the Product Backlog
- user stories
- development tasks
- a view of the upcoming Sprint Backlog

Assessment focuses on:

- covered development effort
- decomposition of user stories into development tasks
- overall quality of the board

Ensure that:

- each development task is derived from a user story
- each development task has a priority
- every group member has `2` tasks assigned for the first week of Milestone 3

### Team Questions (Including Brownie Points)

Each student must distribute brownie points to themselves and their team members.

These points should reflect how you evaluate:

- your own contribution to others
- the contribution of others to your learning
- the contribution of others to the assignment
- the contribution of others to the team's performance

Guidelines:

- you may split the points equally if everyone contributed equally
- each student has `50` brownie points to distribute to `5` team members
- if the team has `4` members, only distribute `40` brownie points

Brownie points can help identify team issues early and may influence pass/fail decisions in borderline cases.

## 4. Important

To ensure a smooth and successful progression throughout the SoPra course, keep the following points in mind for all assignments:

1. **Continuous contribution is essential**. Your TA will assess weekly progress before each TA meeting. During implementation, especially in Milestones 3 and 4, keep the file `contributions.md` updated in the client repository.
2. **Effective use of the joker for continuous contribution**: you can use one joker throughout the semester. Announce it in advance. Failing to do so results in a fail for that week.
3. **Communication with TAs**: discuss their availability with them. It is not their responsibility to be available `24/7`, especially on weekends.
4. **Deployment policy**: you may only deploy before the deadline. Deploying afterward results in an automatic fail for the milestone.
5. **Repository privacy**: setting repositories to private prevents TAs from reviewing your work and results in an automatic fail for the time they remain private.
6. **Commit standards**: TAs only consider commits that include a task or issue number. Make sure commits are labeled appropriately.
7. **Persistence in project work**: students are expected to continue working on the application until they receive a clear fail. A missing assessment from the last milestone is not a valid excuse to stop.
