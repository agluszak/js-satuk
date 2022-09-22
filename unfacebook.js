const inputFile = "all.json";
const outputFile = "all_unfacebook.json";

class Date {
    year;
    month;
    day;
    hour;
    minute;

    constructor(year, month, day, hour, minute) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
    }

    static invalid() {
        return new Date(null, null, null, null, null);
    }
}

const DATE_REGEX = /(\d+) (\S+) o (\d+):(\d+)/;
const DATE_REGEX_YEAR = /(\d+) (\S+) (\d+) o (\d+):(\d+)/;

function unfacebookDate(s) {
    if (!s) {
        return Date.invalid();
    }

    let year;
    let month;
    let day;
    let hour;
    let minute;

    if (s.match(DATE_REGEX_YEAR)) {
        [, day, month, year, hour, minute] = s.match(DATE_REGEX_YEAR);
    } else if (s.match(DATE_REGEX)) {
        [, day, month, hour, minute] = s.match(DATE_REGEX);
        year = "2022";
    } else {
        console.log("Unknown date:", s);
        return Date.invalid();
    }
    day = parseInt(day);
    month = parseMonth(month);
    year = parseInt(year);
    hour = parseInt(hour);
    minute = parseInt(minute);

    return new Date(year, month, day, hour, minute);
}

function parseMonth(s) {
    switch(s) {
        case "stycznia":
            return 1;
        case "lutego":
            return 2;
        case "marca":
            return 3;
        case "kwietnia":
            return 4;
        case "maja":
            return 5;
        case "czerwca":
            return 6;
        case "lipca":
            return 7;
        case "sierpnia":
            return 8;
        case "września":
            return 9;
        case "października":
            return 10;
        case "listopada":
            return 11;
        case "grudnia":
            return 12;
        default:
            return null;
    }
}

class Reactions {
    reactionsCount;
    reaction1;
    reaction2;
    reaction3;

    constructor(reactionsCount, reaction1, reaction2, reaction3) {
        this.reactionsCount = reactionsCount;
        this.reaction1 = reaction1;
        this.reaction2 = reaction2;
        this.reaction3 = reaction3;
    }

    static invalid() {
        return new Reactions(null, null, null, null);
    }
}

const REACTIONS_REGEX = /(\d+) reak.+, w tym (.+)/;
const REACTIONS_THOUSANDS_REGEX = /(.+) tys. reak.+, w tym (.+)/;

function unfacebookReactionTypes(s) {
    let arr = s.split(", ");
    arr = arr.flatMap(x => x.split(" i "));
    arr = arr.map(x => x.trim());
    return arr;
}

function unfacebookReactions(s) {
    if (!s) {
        return Reactions.invalid();
    }

    let m = s.match(REACTIONS_REGEX);
    let reactions;
    let reactions_type;
    if (m) {
        reactions = parseInt(m[1]);
        reactions_type = unfacebookReactionTypes(m[2]);
    } else {
        m = s.match(REACTIONS_THOUSANDS_REGEX);
        if (m) {
            let thousands = m[1].replaceAll(",", ".");
            reactions = parseFloat(thousands) * 1000;
            reactions_type = unfacebookReactionTypes(m[2]);
        } else {
            console.log("Unknown reactions:", s);
            return Reactions.invalid();
        }
    }
    return new Reactions(reactions, reactions_type[0], reactions_type[1], reactions_type[2]);
}

const fs = require('fs');

try {
  const data = fs.readFileSync(inputFile, 'utf8');
  const json = JSON.parse(data);

  const unfacebooked_json = json.map(x => {
        let date = unfacebookDate(x.date);
        let reactions = unfacebookReactions(x.likes);
        // put each object's fields into x
        return {...x, ...date, ...reactions};
    });
    fs.writeFileSync(outputFile, JSON.stringify(unfacebooked_json));
} catch (err) {
  console.error(err);
}