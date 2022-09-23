const inputFile = "all.json";
const outputFile = "all_unfacebook.json";

const DATE_REGEX = /(\d+) (\S+) o (\d+):(\d+)/;
const DATE_REGEX_YEAR = /(\d+) (\S+) (\d+) o (\d+):(\d+)/;

function unfacebookDate(s) {
    if (!s) {
        return null;
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
        return null;
    }
    day = parseInt(day);
    month = parseMonth(month);
    year = parseInt(year);
    hour = parseInt(hour);
    minute = parseInt(minute);

    return new Date(year, month, day, hour, minute);
}

function parseMonth(s) {
    switch (s) {
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

function readOcr(photoId) {
    const name1 = "pics/" + photoId + ".jpg.pl.txt";
    const name2 = "pics/" + photoId + ".png.pl.txt";

    if (fs.existsSync(name1)) {
        return fs.readFileSync(name1, 'utf8');
    } else if (fs.existsSync(name2)) {
        return fs.readFileSync(name2, 'utf8');
    } else {
        console.log("No OCR for", photoId);
        return null;
    }
}

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const json = JSON.parse(data);

    let counter = 0;
    const unfacebookedJson = json.map(x => {
        counter++;
        console.log(counter);
        let date = unfacebookDate(x.date);
        let reactions = unfacebookReactions(x.likes);
        let ocr;
        if (x.photoFbId) {
            ocr = readOcr(x.photoFbId);
        } else {
            ocr = null;
        }
        x.likes = null;

        if (x.photoDescription) {
            x.photoDescription = x.photoDescription.replace("Może być zdjęciem przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być zdjęciem w zbliżeniu przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być memem przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być komiksem przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być zdjęciem", "");
            x.photoDescription = x.photoDescription.replace("Może być komiksem", "");
            x.photoDescription = x.photoDescription.replace("Może być memem", "");
            x.photoDescription = x.photoDescription.replace("Może być grafiką anime przedstawiającą ", "");
            x.photoDescription = x.photoDescription.replace("Może być grafiką anime", "");
            x.photoDescription = x.photoDescription.replace("Może być ilustracją przedstawiającą ", "");
            x.photoDescription = x.photoDescription.replace("Może być obrazem przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być selfie przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być czarno-białym zdjęciem przedstawiającym ", "");
            x.photoDescription = x.photoDescription.replace("Może być zrzutem ekranu z Twittera przedstawiającym ", "");
            if (x.photoDescription === "Brak dostępnego opisu zdjęcia.") {
                x.photoDescription = null;
            }
        }

        // put each object's fields into x
        return {...x, date: date, ocr: ocr, ...reactions};
    });
    // remove all null fields
    const filteredJson = unfacebookedJson.map(x => {
        let result = {};
        for (let [k, v] of Object.entries(x)) {
            if (v !== null) {
                result[k] = v;
            }
        }
        return result;
    });
    fs.writeFileSync(outputFile, JSON.stringify(filteredJson));
} catch (err) {
    console.error(err);
}