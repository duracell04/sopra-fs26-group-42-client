# SoPra FS26 Assignment 3

Source PDF: `SoPraFS26_Assignment_3.pdf`

## Page 1

Software Praktikum (SoPra) - FS25
Milestone 3 - Assignment
1 General Information
With Milestone 3, we enter the implementation phase of SoPra. The deadline is on Friday,24.04.2026
23:59 CET, and includes the deliverables listed below. On the following Monday, 27.04.2026, you
will present a short progress update for Milestone 3.
1.1 Deliverables Overview
We will check your last deployment after the deadline. Pleasedo not deploybetween the deadline
and the presentation the following Monday!
Report: as PDF with a name of form FS26-Group-XX-M3-Report.pdf.
Presentation Slides: as PDF with a name of form FS26-Group-XX-M3-Slides.pdf.
Source Code and Project Boardhosted on GitHub (git tag "M3").
Continuous Progress (weekly, individually):completion of 2 meaningful development tasks.
Team Questionnaire and Brownie Points (individually):submitted via OLAT.
2 Assignment Description
Based on the previous assignment of Milestone 2, you should have specifications, diagrams, user
interface mock-ups, Sprint planning, and a deployment pipeline ready to support the upcoming
implementation phase. In this milestone, we will focus on implementation and testing.
2.1 Implementation and Testing
At the end of Milestone 3, you are expected to have a running and usable version of your appli-
cation (even if not all features are implemented yet). We expect you to develop your application
for a modern browser. The target platforms are Google Chrome and Vercel.
Advice: We strongly recommend finishing all tasks you specified as required/critical by the end
of Milestone 3. Milestone 4 will be about finishing up and polishing your application for the final
1

## Page 2

presentation. Depending on progress, you can start with optional features, but you will also have
time to work on them in Milestone 4.
After Milestone 3, there will be a beta testing phase where you will get a project URL of another
group to provide feedback. Likewise, another group will test your application and prepare feed-
back. Notice that beta testing requires a certain maturity of your project by the end of Milestone 3.
Proper software implementations include rigorous and extensive testing, too. You must have a
high degree of test coverage for the server in terms of unit, integration, and REST interface tests.
As an indication of how much code you should test, we require the test coverage to be at least
50%. Check SonarQube for test the coverage metric. We expect every task (from the back-end) to
have at least 1 test associated with it.
2.2 Project Maintenance with GitHub
While programming, you are required to ensure traceability of your progress. Your GitHub Issues
and project boards should always be up to date and your Git commits should be linked to a
GitHub Issue. There are two ways to achieve consistency and traceability between your source
code and your development tasks:
• Manual: Open a GitHub Issue and type the SHA1 of the commit as an Issue comment.
• Automated: Reference GitHub Issues in your git commit message2.
Note: We expect every completed development task to link to at least one commit.
2.3 Weekly TA Meetings
During the Sprint of Milestone 3, you will have regular weekly meetings with your teaching as-
sistant. During the implementation phase, they should be held in the shape and form of a "Daily
Scrum"3. This specific Scrum event is a short status update for your Scrum Master (TA) and your
team.
Before each meeting, each team member is required to manually append the two development
tasks they completed during the previous week to a markdown file named “contributions.md”
in the client repository. This markdown file will form a log of your individual contributions
throughout the remainder of the course. Every member has to complete at least 2 meaningful
tasks per week, where a single development task should have a granularity of 0.5-1 day. The
completed tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over the remaining
weeks of the course. Please note that you cannot make up for "missed" continuous progress, but
you can "work ahead" by completing twice the amount of work in one week to skip progress on
a subsequent week without using your "Joker". Please communicate your planning ahead of time.
During the meeting, every team member should provide a 3-minute update where they an-
swer the following questions:
• What did I do last week?
1https://docs.github.com/en/github/writing-on-github/autolinked-references-and-urls#
commit-shas
2https://github.com/gitbucket/gitbucket/wiki/How-to-Close-Reference-issues-and-pull-request
3https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf
2

## Page 3

• What will I do this week?
• What are the obstacles to progress?
We suggest discussing your progress using the "Sprint Backlog View" which was created as part
of assignment 2 and/or your “contributions.md” log.
2.4 Planning of Sprint 2
Towards the end of this milestone, you should start planning for the second and final Sprint. Go
through the remaining user stories and decide which ones to implement for Milestone 4. Set a
GitHub Milestone (e.g., "Sprint 2") to mark selected stories. Follow the guidelines provided in the
previous assignment sheet for instructions on how to decompose these stories into development
tasks.
3 Grading and Deliverables
SoPra is a pass/fail course, and the grade for M3 will be pass/fail as well. Overall, you have to
pass 3 out of 4 milestones, where M1 and M4 have to be passed. You need to hand in reasonable
reports for all the milestones. You will receive feedback on your deliverables, including an assess-
ment (either pass, borderline pass or fail) in the upcoming weeks after the deadline.
Report
The report should be submitted as PDF to OLAT with a name of formFS26-Group-XX-M3-Report.pdf
by the group leader. Please make sure the title page contains the group name, group leader, and
information about all group members (name and matriculation number). In the report, please in-
clude a diagram showing your latest database layout/structure and 2-3 screenshots of your user
interface. Moreover, include one complex unit, one integration, and one REST interface test with
descriptions of their use cases in the report. Explain why these particular tests are well-written
for the tested functionality, how they are able to capture future regressions, and elaborate on why
the three examples are good representatives of their categories. We will evaluate the quality of
your database structure diagram, the user interface screenshots, and the 3 test cases.
Presentation (Slides)
The slides should be submitted as PDF to OLAT with the name of the form FS26-Group-XX-M3-
Slides.pdf by the group leader. The presentation should not take more than 3 minutes (hard cut-off)
and should consist of 2 components: project introduction and motivation (30 secs) and a live demo
(2:30 mins). Notice that we expect the demo to be live, using the deployed version(but take some
backup screenshots in case anything goes wrong). Further, we suggest you focus on the exciting
parts of your application during the demo: feel free to skip the setup phase (e.g., registering users
or setting up a lobby) to have more time to showcase the core parts of your project.
Finally, the title slide should consist of the group name and the names of all group members.
Underline the name of the presenter(s) on the title slide. The slides and the presentations have to
be in English. Please note that each team member has to present at least once (M1+M2, M3, or M4).
Source Code and Project Board
The source code on GitHub is submitted by adding git tags "M3" to commits in the "main"
branches that should be taken into consideration for grading. We will partially assess the source
code of your application and the implementation progress. By the end of Milestone 3, we expect
a deployed and reasonable prototype which is ready for beta testing. In terms of testing, we will
3

## Page 4

check whether your tests are meaningful, i.e., they serve the purpose of identifying bugs. Tests
that cover getter/setter are not valuable. Aim for tests that deal with the core logic of your appli-
cation. We expect that every task (from the back-end) has at least 1 test associated with it and that
you achieve a test coverage of 50% on SonarCube.
Similarly, your GitHub Projects board is submitted implicitly and should already be set to
"public". The board should show your Product Backlog, including user stories and development
tasks, and provide a view of your upcoming Sprint Backlog. We will assess your Sprint planning
in terms of the covered development effort, the user stories decomposition into development
tasks, and the overall quality and consistency of your project management activities.
Continuous Progress
During the remaining milestones, each team member has to contribute to the project continuously.
More specifically, every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed tasks have to
be shown in the weekly TA meetings, and you are required to ensure traceability of your work
by linking git commits to development tasks and updating the “contributions.md“ log file. You
have one "Joker" to miss one weekly TA meeting and another "Joker" to skip continuous progress
once over the remaining weeks of the course. Please note that you cannot make up for "missed"
continuous progress, but you can "work ahead" by completing twice the amount of work in one
week to skip progress on a subsequent week without using your "Joker". Please communicate
your planning ahead of time.
Note: If a team member fails to show continuous progress after using their Joker, they will indi-
vidually fail the overall course (unless there is a valid reason).
Team Questions and Brownie Points
In addition to the group assessment, we will use a “brownie points” system for which you have to
distribute brownie points to you and your team members. The brownie points should reflect how
you feel about your contribution to others and the contribution of other team members to your
learning, the assignment, and team’s performance. Distributing brownie points will be an oppor-
tunity to reward the members of your team who worked hard on your behalf. You can split the
brownie points equally if you think everyone did the same. Every student has 50 brownie points
to distribute to the 5 team members (if your team has 4 members, only distribute 40 brownie
points). These brownie points will also allow us to notice any concerns in a team early on. The
brownie points can decide whether individual group members pass or fail for borderline submis-
sions.
4 Important
In order to ensure a smooth and successful progression throughout the SoPra course, it is crucial
to adhere to certain guidelines. Keep the following points in mind for all assignments:
1. Continuous contribution is essential. Your TA will assess your weekly progress before each
TA meeting (except for the week of spring break).
2. Effective use of joker for continuous contribution: You can use a joker for continuous con-
tribution once throughout the semester. Ensure you announce it in advance; failure to do so
will result in a fail for the respective week.
3. Communication with TAs: Discuss with your TA about their availability to answer ques-
tions and respond to your queries. Remember, it is not their responsibility to be available
24/7, especially on weekends.
4

## Page 5

4. Deployment policy: You are only allowed to deploy before the deadline. Deploying after
the deadline, regardless of changes made, will result in an automatic fail for the milestone.
5. Repository privacy: Setting your repositories to private prevents TAs from reviewing your
work and will result in an automatic fail for the duration it is set to private.
6. Commit standards: TAs will only consider commits with a task/issue number. Ensure your
commits are appropriately labeled for evaluation.
7. Persistence in project work: Students are expected to continue working on their application
until they receive a clear fail. Using the lack of assessment from the last milestone as an
excuse is not acceptable.
5
