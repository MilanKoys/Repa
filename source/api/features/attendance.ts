import type {
  CreateReport,
  Leaf,
  Report,
  ServerRequest,
  ServerResponse,
  Undefined,
  User,
} from "@types";
import { Collection, ObjectId, type Document, type Filter } from "mongodb";

import { Server } from "#server";
import { Collections, Method, ReportStatus, Role } from "#enums";
import { Validator } from "#validator";
import { Database } from "#database";
import { UserLibrary } from "#library";

const READONLY_STATUSES: ReportStatus[] = [
  ReportStatus.Approved,
  ReportStatus.Submitted,
];

const MANAGEMENT_ROLES: Role[] = [Role.Admin, Role.Teacher];

const NO_PROJECT: number = 0;
const QUEUE_FROM: string = Collections.Users;
const QUEUE_LOCAL_FIELD: string = "user";
const QUEUE_FOREIGN_FIELD: string = "email";
const QUEUE_AS: string = "user";
const QUEUE_FILTER_CLASS: (user: User) => { "user.email": string } = (user) => {
  return { "user.email": user.email };
};
const QUEUE_SUBMITTED_MATCH: Document = {
  $match: {
    status: ReportStatus.Submitted,
  },
};
const QUEUE_LOOKUP: Document = {
  $lookup: {
    from: QUEUE_FROM,
    localField: QUEUE_LOCAL_FIELD,
    foreignField: QUEUE_FOREIGN_FIELD,
    as: QUEUE_AS,
  },
};
const QUEUE_UNWIND: Document = {
  $unwind: `$${QUEUE_AS}`,
};
const QUEUE_PROJECT: Document = {
  $project: {
    user: {
      session: NO_PROJECT,
      password: NO_PROJECT,
    },
  },
};

const database: Database = Database.init();
const userLibrary: UserLibrary = UserLibrary.inject();

export const attendanceRouter: Server = new Server();

const queuePath: string = "/queue";
const submitPath: string = "/submit";
const listPath: string = "/list";
const attendancePath: string = "/attendance";
const reviewPath: string = "/review";
const attendanceListPath: string = `${attendancePath}${listPath}`;
const attendanceSubmitPath: string = `${attendancePath}${submitPath}`;
const attendanceQueuePath: string = `${attendancePath}${queuePath}`;
const attendanceReviewPath: string = `${attendancePath}${reviewPath}`;

const validator: Validator = new Validator();

const saveAttendanceSchema: Validator = validator.object({
  week: validator.number().required(),
  rows: validator.object({
    type: validator.string().required(),
    about: validator.string(),
    duration: validator.number().required(),
  }),
});

function containsStatus(report: Report, statuses: ReportStatus[]) {
  return statuses.some((status) => status === report.status);
}

function containsRole(user: User, roles: Role[]) {
  return roles.some((role) => role === user.role);
}

const reviewHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const reportIdentifier = request.incomingMessage.headers.identifier;

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user || !containsRole(user, [Role.Admin, Role.Teacher])) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  if (!reportIdentifier || typeof reportIdentifier !== "string") {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const report = await reports.findOne({
    _id: new ObjectId(reportIdentifier),
  });

  if (report) {
    response.json(report);
  } else {
    response.outgoingMessage.statusCode = 404;
    response.outgoingMessage.end();
  }
};

const submitHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const weekNumber = request.incomingMessage.headers.week;

  if (!weekNumber || typeof weekNumber !== "string") {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const foundReport = await reports.findOne({
    season: season.id,
    week: parseInt(weekNumber),
    user: user.email,
  });

  if (!foundReport) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  if (foundReport && containsStatus(foundReport, READONLY_STATUSES)) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const filter = {
    week: parseInt(weekNumber),
    season: season.id,
    user: user.email,
  };

  const update = { $set: { status: ReportStatus.Submitted } };

  await reports.updateOne(filter, update);

  response.outgoingMessage.end();
};

const listHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const reportList = await reports
    .find({
      season: season.id,
      user: user.email,
    })
    .toArray();

  response.json(reportList);
};

const getHandler = async (request: ServerRequest, response: ServerResponse) => {
  const weekNumber = request.incomingMessage.headers.week;

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  if (!weekNumber || typeof weekNumber !== "string") {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const report = await reports.findOne({
    week: parseInt(weekNumber),
    season: season.id,
    user: user.email,
  });

  if (report) {
    response.json(report);
  } else {
    response.outgoingMessage.statusCode = 404;
    response.outgoingMessage.end();
  }
};

const deleteHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const weekNumber = request.incomingMessage.headers.week;

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  if (!weekNumber || typeof weekNumber !== "string") {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const foundReport = await reports.findOne({
    season: season.id,
    week: parseInt(weekNumber),
    user: user.email,
  });

  if (foundReport && containsStatus(foundReport, READONLY_STATUSES)) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  if (!foundReport) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const filter = {
    week: foundReport.week,
    season: season.id,
    user: user.email,
  };
  await reports.deleteOne(filter);

  response.outgoingMessage.end();
};

const reviewQueueHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const classNumber = request.incomingMessage.headers.class;

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  if (!containsRole(user, MANAGEMENT_ROLES)) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  if (classNumber && typeof classNumber !== "string") {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);
  const users: Collection<User> = database.collection(Collections.Users);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  let pipeline: Document[] = [
    QUEUE_LOOKUP,
    QUEUE_UNWIND,
    QUEUE_PROJECT,
    QUEUE_SUBMITTED_MATCH,
  ];

  if (classNumber) {
    const userFilter = { class: parseInt(classNumber) };
    const userList = await users.find(userFilter).toArray();
    const userEmailList = userList.map(QUEUE_FILTER_CLASS);

    pipeline.push({
      $match: {
        $or: userEmailList,
      },
    });
  }

  const queueList = await reports.aggregate(pipeline).toArray();

  response.json(queueList);
};

const saveHandler = async (
  request: ServerRequest,
  response: ServerResponse,
) => {
  const body: CreateReport = request.body as CreateReport;

  const cookies = request.incomingMessage.headers.cookie;

  const user: Undefined<User> = await userLibrary.cookiesUser(cookies);

  if (!user) {
    response.outgoingMessage.statusCode = 401;
    return response.outgoingMessage.end();
  }

  const valid: boolean = saveAttendanceSchema.validate(body);

  if (!valid) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const seasons: Collection<Leaf> = database.collection(Collections.Seasons);
  const reports: Collection<Report> = database.collection(Collections.Reports);

  const season = await seasons.findOne({ active: true });

  if (!season) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const foundReport = await reports.findOne({
    season: season.id,
    week: body.week,
    user: user.email,
  });

  if (foundReport && containsStatus(foundReport, READONLY_STATUSES)) {
    response.outgoingMessage.statusCode = 400;
    return response.outgoingMessage.end();
  }

  const report: Report = {
    ...body,
    status: ReportStatus.Draft,
    user: user.email,
    season: season.id,
  };

  if (foundReport) {
    const filter = {
      week: foundReport.week,
      season: season.id,
      user: user.email,
    };
    const update = { $set: { ...report } };
    await reports.updateOne(filter, update);
  } else {
    await reports.insertOne(report);
  }

  response.outgoingMessage.end();
};

attendanceRouter.route(Method.Post, attendancePath, saveHandler);
attendanceRouter.route(Method.Get, attendancePath, getHandler);
attendanceRouter.route(Method.Delete, attendancePath, deleteHandler);
attendanceRouter.route(Method.Get, attendanceListPath, listHandler);
attendanceRouter.route(Method.Get, attendanceSubmitPath, submitHandler);
attendanceRouter.route(Method.Get, attendanceQueuePath, reviewQueueHandler);
attendanceRouter.route(Method.Get, attendanceReviewPath, reviewHandler);
