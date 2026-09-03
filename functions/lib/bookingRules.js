/**
 * Server-side booking schedule rules.
 *
 * These mirror the constants the booking UI uses to build its slot grid
 * (`src/app/contexts/BookingContext.js`). The client copy decides what to
 * *show*; this copy decides what is actually allowed, because the browser is
 * free to send whatever `startTime` it likes.
 *
 * Everything is evaluated in Africa/Lagos — the salon's wall clock — regardless
 * of where the request came from or what region the function runs in.
 */

const {watDate} = require("./time");

const TIME_ZONE = "Africa/Lagos";

const OFF_DAYS = new Set([1]); // Monday (0 = Sun … 6 = Sat)
const START_HOUR = 9; // 9 AM WAT (Tue–Sat)
const SUNDAY_START_HOUR = 13; // 1 PM WAT (Sun)
const END_HOUR = 19; // nothing may finish after 7 PM WAT
const SLOT_MINUTES = 15;
const CUTOFF_MINUTES = END_HOUR * 60;

const WEEKDAY_INDEX = {Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6};

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    // h23 rather than hour12:false — some ICU builds render midnight as "24".
    hourCycle: "h23",
});

const dateLabelFormatter = new Intl.DateTimeFormat("en-NG", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

const timeLabelFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

/** Wall-clock weekday/hour/minute in Lagos for a given instant. */
function watParts(date) {
    const parts = partsFormatter.formatToParts(date).reduce((acc, p) => {
        acc[p.type] = p.value;
        return acc;
    }, {});

    return {
        weekday: WEEKDAY_INDEX[parts.weekday],
        hour: Number(parts.hour),
        minute: Number(parts.minute),
    };
}

/** First bookable hour for a given WAT weekday. */
function openingHour(weekday) {
    return weekday === 0 ? SUNDAY_START_HOUR : START_HOUR;
}

/** How many minutes of work a given weekday can hold. */
function dayCapacityMinutes(weekday) {
    if (OFF_DAYS.has(weekday)) return 0;
    return CUTOFF_MINUTES - openingHour(weekday) * 60;
}

/** The longest appointment any single day can hold (a Tue–Sat day). */
const MAX_APPOINTMENT_MINUTES = CUTOFF_MINUTES - START_HOUR * 60;

function watDateLabel(date) {
    return dateLabelFormatter.format(date);
}

function watTimeLabel(date) {
    return timeLabelFormatter.format(date);
}

/**
 * Checks a requested appointment against the salon's opening rules.
 *
 * Note there is deliberately no double-booking check: several stylists work in
 * parallel, so overlapping appointments are expected and allowed.
 *
 * @param {string} startTime      ISO datetime string
 * @param {number} totalDuration  minutes
 * @param {Date}   [now]          injectable for tests
 * @returns {{ok: boolean, reason?: string, start?: Date, end?: Date}}
 */
function validateSlot(startTime, totalDuration, now = new Date()) {
    const start = watDate(startTime);
    if (!start) {
        return {ok: false, reason: "That appointment time could not be understood."};
    }

    if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
        return {ok: false, reason: "That appointment has no length."};
    }

    if (start.getTime() <= now.getTime()) {
        return {ok: false, reason: "That time has already passed. Please pick another slot."};
    }

    const {weekday, hour, minute} = watParts(start);

    if (minute % SLOT_MINUTES !== 0) {
        return {ok: false, reason: "Appointments start on the quarter hour."};
    }

    if (OFF_DAYS.has(weekday)) {
        return {ok: false, reason: "The salon is closed on Mondays."};
    }

    const minutesIntoDay = hour * 60 + minute;
    const opens = openingHour(weekday) * 60;

    if (minutesIntoDay < opens) {
        return {
            ok: false,
            reason: weekday === 0 ?
                "Sunday appointments start from 1pm." :
                "Appointments start from 9am.",
        };
    }

    if (minutesIntoDay + totalDuration > CUTOFF_MINUTES) {
        return {
            ok: false,
            reason: "That booking would run past closing time (7pm). Please pick an earlier slot.",
        };
    }

    return {
        ok: true,
        start,
        end: new Date(start.getTime() + totalDuration * 60 * 1000),
    };
}

module.exports = {
    TIME_ZONE,
    OFF_DAYS,
    START_HOUR,
    SUNDAY_START_HOUR,
    END_HOUR,
    SLOT_MINUTES,
    CUTOFF_MINUTES,
    MAX_APPOINTMENT_MINUTES,
    watParts,
    openingHour,
    dayCapacityMinutes,
    watDateLabel,
    watTimeLabel,
    validateSlot,
};
