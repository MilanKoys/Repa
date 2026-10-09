import type {
  CreateReport,
  Leaf,
  Report,
  ServerRequest,
  ServerResponse,
  Undefined,
  User,
} from "@types";
import type { Collection } from "mongodb";

import { Server } from "#server";
import { Collections, Method, ReportStatus } from "#enums";
import { Validator } from "#validator";
import { Database } from "#database";
import { UserLibrary } from "#library";

const READONLY_STATUSES: ReportStatus[] = [
  ReportStatus.Approved,
  ReportStatus.Submitted,
];

const database: Database = Database.init();
const userLibrary: UserLibrary = UserLibrary.inject();

export const attendanceRouter: Server = new Server();

const submitPath: string = "/submit";
const listPath: string = "/list";
const attendancePath: string = "/attendance";
const attendanceListPath: string = `${attendancePath}${listPath}`;
const attendanceSubmitPath: string = `${attendancePath}${submitPath}`;

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
attendanceRouter.route(Method.Get, attendanceListPath, listHandler);
attendanceRouter.route(Method.Get, attendanceSubmitPath, submitHandler);
