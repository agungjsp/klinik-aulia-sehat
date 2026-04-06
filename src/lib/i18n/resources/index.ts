import authEn from "@/lib/i18n/resources/en/auth"
import adminQueueEn from "@/lib/i18n/resources/en/admin-queue"
import checkupScheduleEn from "@/lib/i18n/resources/en/checkup-schedule"
import commonEn from "@/lib/i18n/resources/en/common"
import dashboardEn from "@/lib/i18n/resources/en/dashboard"
import doctorQueueEn from "@/lib/i18n/resources/en/doctor-queue"
import errorsEn from "@/lib/i18n/resources/en/errors"
import languageEn from "@/lib/i18n/resources/en/language"
import masterEn from "@/lib/i18n/resources/en/master"
import navEn from "@/lib/i18n/resources/en/nav"
import nurseQueueEn from "@/lib/i18n/resources/en/nurse-queue"
import patientEn from "@/lib/i18n/resources/en/patient"
import queueEn from "@/lib/i18n/resources/en/queue"
import reminderConfigEn from "@/lib/i18n/resources/en/reminder-config"
import reportsEn from "@/lib/i18n/resources/en/reports"
import scheduleEn from "@/lib/i18n/resources/en/schedule"
import settingsEn from "@/lib/i18n/resources/en/settings"
import authId from "@/lib/i18n/resources/id/auth"
import adminQueueId from "@/lib/i18n/resources/id/admin-queue"
import checkupScheduleId from "@/lib/i18n/resources/id/checkup-schedule"
import commonId from "@/lib/i18n/resources/id/common"
import dashboardId from "@/lib/i18n/resources/id/dashboard"
import doctorQueueId from "@/lib/i18n/resources/id/doctor-queue"
import errorsId from "@/lib/i18n/resources/id/errors"
import languageId from "@/lib/i18n/resources/id/language"
import masterId from "@/lib/i18n/resources/id/master"
import navId from "@/lib/i18n/resources/id/nav"
import nurseQueueId from "@/lib/i18n/resources/id/nurse-queue"
import patientId from "@/lib/i18n/resources/id/patient"
import queueId from "@/lib/i18n/resources/id/queue"
import reminderConfigId from "@/lib/i18n/resources/id/reminder-config"
import reportsId from "@/lib/i18n/resources/id/reports"
import scheduleId from "@/lib/i18n/resources/id/schedule"
import settingsId from "@/lib/i18n/resources/id/settings"

export const resources = {
  id: {
    common: commonId,
    auth: authId,
    nav: navId,
    errors: errorsId,
    queue: queueId,
    language: languageId,
    adminQueue: adminQueueId,
    reports: reportsId,
    schedule: scheduleId,
    doctorQueue: doctorQueueId,
    reminderConfig: reminderConfigId,
    checkupSchedule: checkupScheduleId,
    master: masterId,
    dashboard: dashboardId,
    settings: settingsId,
    patient: patientId,
    nurseQueue: nurseQueueId,
  },
  en: {
    common: commonEn,
    auth: authEn,
    nav: navEn,
    errors: errorsEn,
    queue: queueEn,
    language: languageEn,
    adminQueue: adminQueueEn,
    reports: reportsEn,
    schedule: scheduleEn,
    doctorQueue: doctorQueueEn,
    reminderConfig: reminderConfigEn,
    checkupSchedule: checkupScheduleEn,
    master: masterEn,
    dashboard: dashboardEn,
    settings: settingsEn,
    patient: patientEn,
    nurseQueue: nurseQueueEn,
  },
} as const

export type AppResources = typeof resources
