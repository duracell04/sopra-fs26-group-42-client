# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 23.03.2026 to 30.03.2026

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -- | -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz**| **[@remy20cent]**  | 29.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/5377434d302032526b3a41c0bdb2f3ea9186794c | Implemented user profile screen | core implementation |
|                    |  | 29.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/9efa6d73ee9633c91150217891725a411da09b25 | Added navigation from main menu to profile screen | Required for accessing profile functionality |
|                    |  | 29.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/028c54fba3573a0afa694247c7cf511e68efdc72 | Added ("X") button to return from profile screen to main menu | necessary feature |
| **Enrique Georg Zbinden** |**[@duracell04]**  | 30.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/173ca0a0037e2d8bd05fe39adfd3083cca8bdbcf | Protected `/users` against unauthenticated access by checking for a stored token before fetching protected data and redirecting logged-out users to `/login` | Prevents direct access to a protected page without a valid session and keeps restricted user data from being requested by logged-out users |
|                    |  | 30.03.2026 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/2f3263f3439ff737016492f775211137705fcbb2 | Wired JaCoCo coverage reporting into Sonar and added backend login-flow tests across controller and service layers | Improves CI quality gates and verifies authentication behavior with automated tests instead of relying only on manual checks |
|**Siyang Jiang** |**[@yang0731]** | 27.03.2026   | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/6421a94d54601e809c473fda85af05841c791f05] | Implemented a simple user registration page | This allows new users to register and send their credentials to the server for subsequent logins |
|                 |  | 27.03.2026   | [https://github.com/duracell04/sopra-fs26-group-42-server/compare/main...user-registration-form] | Adapt user entity and DTO to include pwd hash (and creation date) | The server now stores hashed user pwd for security/privacy |
|**Csaba Vizhanyo** |**[@csaba_vi]**   | [29.03.2026]   | [https://github.com/duracell04/sopra-fs26-group-42-server/commit/9e8f96771c4d200d5377be3a791ffaa03e441391] | [Implemented log-in functionallity (backend validation)]| [Allows users to login to acces their profile page after registration] |
|                    |  | [29.03.2026]   | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/4939a6b1a3605ccf68058d1df0e0450c1b9c82dd] | [Implemented log-in functionallity (front end token validation)] | [Allows users to login to acces their profile page after registration] |
|**Attila Vizhanyo**  |**[@liroAV]**  | [29.03.2026]   | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/bd9b3c256424cd12276b57546e3ad76bd4073188] | implement logout function for logged in users | [Allows users to login to logout of their profile] |



---

## Contributions Week 2 (and Springbreak) - 30.03.26 to 13.04.26

| **Student** | **Github Username** | **Date** | **Link to Commit** | **Description** | **Relevance** |
|------------|---------------------|----------|--------------------|-----------------|---------------|
| **Remy Klemenz** | **[@remy20cent]** | 01.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/467e65aac2db268881023567ee4723dc27d7a51a | Backend implementation of userstats | Required for working frontend |
|                  |                   | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/b74e6a93b8187f654e9703753912713578a743ec | Implement left and right movement within canvas | simple requirement |
|                  |                   | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/3bce282e615a242ea4fc9179a968bb70d71afd3e | Implementation of keyboard controls left and right | only frontend keyboard controls, not working with websocket |
| **Enrique Georg Zbinden** | **[@duracell04]** | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/e930400a793f673160a925e8f53f15365ae79c15<br>https://github.com/duracell04/sopra-fs26-group-42-server/commit/122e97622556603dc816a93521a2321a56977fd9 | Implemented S6 backend join-session support by adding the join endpoint, validating session code and session state, persisting joiner data, and adding focused backend tests | Enables a second player to join an existing session and verifies the join logic with automated backend tests |
|  |  | 12.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/c9aa3ffd43bc926010f3d92e8f65419dbc3d3f29<br>https://github.com/duracell04/sopra-fs26-group-42-client/commit/e3d37444a5365b1fdc733829bbca292dd47e0434<br>https://github.com/duracell04/sopra-fs26-group-42-client/commit/3e593ae0b1ec64914f15bff9808789b4b945b94b | Implemented the frontend join-session flow, including the join page, invalid-code feedback, guest-lobby behavior, joiner start restrictions, and Next.js Suspense compatibility for search params | Completes the user-visible S6 join flow so a second player can enter a code, join the lobby, and wait for the host to start |
| **Siyang Jiang** | **[@yang0731]** | [05.04.2026] | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/d0c9c2f3351c1e17f633fa98d66ed47facecad6a] | implement gameBlockObject in frontend | frontend should be able to change the status of the blocks |
|                 |                   |[10.04.2026]  | [https://github.com/duracell04/sopra-fs26-group-42-server/commit/a20701746895b6c36e996bb3173733f3ef933d31] | Add game logic checks to backend game service and initialize GameBlock entity | The backend should have a block entity and be able to validate block selections (in GameService) to determine the status of each gameblock. |
|                 |                   |[13.04.2026]  | [https://github.com/duracell04/sopra-fs26-group-42-client/commit/09be6a9af85c4890798045e74aa2f9a4a84023ae] | implemented bullet collision with a gameblock in frontend | It is needed for the correctness check (for elimination), that happens when the bullet collides with a gameblock. |
| **Csaba Vizhanyo** | **[@csaba_vi]** | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/37bc48fa8b2d3e12efec564f55359bfde4a5d811 | creating websocket backend setup | ensure infrastructure for websocket works, so it can later be used for critical game features like shooting and moving |
|                 |                   | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/721bc045a3ade41e2aa66fb1a68738b91a525838 | create ship entity and render it on the frontend | creating player for later gameplay |
|                 |                   | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/1fd57ab10081706c9ad1516790d5f06e575412ec | creating frontend websocket setup | ensure infrastructure for websocket works, so it can later be used for critical game features like shooting and moving |
| **Attila Vizhanyo** | **[@liroAV]** | 11.03.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/58928dec989c9da9aeb1783da79041604ac47266 | implementation of creating session, and making a unique joining code | This step is important to correctly setup a game, so you and your friend can play together |

---

## Contributions Week 3 - 13.04.26 to 19.04.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | 14.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/ffb5fb846b56f10ddc2a34211090daf1b2c4cd4b | Update the ship position smoothly in the frontend | continuous pressing on keyboard works for movement, also backend adjustements |
|                 |                  | 14.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/3c9cdfb338828d7ba057be9bd3b59d7d5864c2cc | Backend Websocket Implementation for movement | should synchronize player movement in real time for both players, but needs different player2 id to test |
|                    |              | date | ########################### | ########################### | ########################### |
|**Enrique Georg Zbinden** |**[@duracell04]** | 19.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/3c8cff17f8abb94952173dab40fd1159f049ed20<br>https://github.com/duracell04/sopra-fs26-group-42-server/commit/ff64745aae03f0130ec9c64d56ce6fe7a1ce2bcd | Implemented S10 backend timer support by extending game sessions with start and finish timestamps, exposing elapsed-time data, adding a finish flow, and covering the timer behavior with focused service tests | Provides the persisted timer lifecycle for session-backed play and adds backend verification for start, finish, and frozen elapsed-time behavior |
|                          |                  | 19.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/ff4073324bea43883746505d1971cc2eed5aa36f | Implemented S10 frontend timer support by showing elapsed time during gameplay, stopping after the full generated problem set is cleared, and displaying the frozen final time in a completion overlay | Delivers the user-visible timer flow required by S10 for both session-backed play and local `/play_test` runs |
|**Siyang Jiang** |**[@yang0731]** | 14.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/c86cd872fcbb6643a0290593ef0541ca985ee34f| add block animation with initialization, falling behavior, and status change to selection on hit | blocks need to be selected for elimination, and show status with color|
|                 |                | 18.04.26 | https://github.com/duracell04/sopra-fs26-group-42-client/pull/27/changes/9c451bf34a4d80e1799e6ae45c9687668799a31d | /implement lives and score display and their updating behaviour on frontend page (#9)(#11)(#12) | This is necessary for implementing our points-based game and penalty mechanism. |
|                 |                | 18.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/338249c199f1bd521e862908cd522712dc9b0f2b | feature/implemented deducting sharedlives in backend (#12) | REST communication and sharedlives deduction logic in backend|
|**Csaba Vizhanyo** |**[@csaba_vi]** | 16.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/2d34107b9a1fa0bc6fe7c8683d34ea3db5501cfa | implemented problem generation algorithm for levels | essential for main gameplay loop |
|                   |                | 16.04 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/29efbdc43d5541092cff2bae90bcd345bc03723b | implemented back end logic so player 2 can access the generated problems from player 1 | essential for main gameplay loop |
|**Attila Vizhanyo** |**[@liroAV]** | 19.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/fde8dcb8d26f86853903efec5288c848a43ae7d5 | recognizes corrects number blocks being shot | this is important so the code knows when to give a point |
|                    |              | 19.04 | https://github.com/duracell04/sopra-fs26-group-42-client/commit/3c1a0c11dc2725eeb79cac79b6e90aaa1a950ec7 | displays the current score | essential for letting the player know their current points visually |


---

## Contributions Week 4 - 19.04.26 to 26.04.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | date | ########################### | ########################### | ########################### |
|                 |                  | date | ########################### | ########################### | ########################### |
|**Enrique Georg Zbinden** |**[@duracell04]** | 24.04.26 | https://github.com/duracell04/sopra-fs26-group-42-server/commit/00245af289c0859ed14096d29217942edc09a824 | Fixed legacy backend User tests for the current `username` model, unblocked the server test pipeline, and refreshed SonarCloud coverage as part of issue #100 / PR #101 | Restored backend CI, regenerated a current JaCoCo/Sonar report, and pushed server coverage above the 50% M3 requirement |
|**Siyang Jiang** |**[@yang0731]** | date | ########################### | ########################### | ########################### |
|                 |                | date | ########################### | ########################### | ########################### ||
|**Csaba Vizhanyo** |**[@csaba_vi]** | date | ########################### | ########################### | ########################### |
|                   |                | date | ########################### | ########################### | ########################### |
|**Attila Vizhanyo** |**[@liroAV]** | date | ########################### | ########################### | ########################### |
|                    |              | date | ########################### | ########################### | ########################### |

---

## Contributions Week 5 - 26.04.26 to 03.05.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | date | ########################### | ########################### | ########################### |
|                 |                  | date | ########################### | ########################### | ########################### |
|**Enrique Georg Zbinden** |**[@duracell04]** | date | ########################### | ########################### | ########################### |
|                          |                  | date | ########################### | ########################### | ########################### |
|**Siyang Jiang** |**[@yang0731]** | date | ########################### | ########################### | ########################### |
|                 |                | date | ########################### | ########################### | ########################### ||
|**Csaba Vizhanyo** |**[@csaba_vi]** | date | ########################### | ########################### | ########################### |
|                   |                | date | ########################### | ########################### | ########################### |
|**Attila Vizhanyo** |**[@liroAV]** | date | ########################### | ########################### | ########################### |
|                    |              | date | ########################### | ########################### | ########################### |

---

## Contributions Week 6 - 03.05.26 to 10.05.26

| **Student**        |**Github Username**| **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | ------------------| -------- | ------------------ | ------------------------------- | ----------------------------------- |
|**Remy Klemenz** |**[@remy20cent]** | date | ########################### | ########################### | ########################### |
|                 |                  | date | ########################### | ########################### | ########################### |
|**Enrique Georg Zbinden** |**[@duracell04]** | date | ########################### | ########################### | ########################### |
|                          |                  | date | ########################### | ########################### | ########################### |
|**Siyang Jiang** |**[@yang0731]** | date | ########################### | ########################### | ########################### |
|                 |                | date | ########################### | ########################### | ########################### ||
|**Csaba Vizhanyo** |**[@csaba_vi]** | date | ########################### | ########################### | ########################### |
|                   |                | date | ########################### | ########################### | ########################### |
|**Attila Vizhanyo** |**[@liroAV]** | date | ########################### | ########################### | ########################### |
|                    |              | date | ########################### | ########################### | ########################### |
