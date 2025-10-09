// TODO: add seed data logic here
// import type { User } from "../../interface/database";
// import { createAction } from "../../services/dexie/collections/action";
// import { createChat } from "../../services/dexie/collections/chat";
// import { createTask } from "../../services/dexie/collections/task";
// import { createVoteAgenda } from "../../services/dexie/collections/vote";

// export const seedData = async () => {
//   const defaultUser: User = {
//     id: 1,
//     username: "main_soul",
//     description: "Default soul user",
//     avatarUrl: "",
//     createdAt: new Date(),
//     modifiedAt: new Date(),
//     isActive: true,
//     isEditable: false,
//   };

//   await createAction({
//       name: "Setup environment",
//       description: "Initialize DB and seed default action",
//       createdAt: new Date(),
//       createdBy: defaultUser,
//       priority: "high",
//       isCompleted: false
//   });

//   await createTask({
//       title: "Welcome Task",
//       description: "This is your first task!",
//       status: "todo",
//       priority: "medium",
//       dueDate: null,
//       createdAt: new Date(),
//       modifiedAt: new Date(),
//   });

//   await createChat({
//       user: defaultUser,
//       message: "Hello, I am your Main Soul",
//       createdAt: new Date()
//   });

//   await createVoteAgenda({
//     title: "Start split-soul project?",
//     description: "Voting on initial setup of souls",
//     votes: [{ user: defaultUser, vote: "yes" }],
//     status: "open",
//     createdAt: new Date(),
//   });
// };
