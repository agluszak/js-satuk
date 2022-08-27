function wrap(arg) {
	try {
		return arg()
	} catch (err) {
		return null;
	}
}

const fbidRegex = /.+fbid=(\d+).+/;
const fbidFallbackRegex = /\/.+\/photos\/.+\/(\d+).+/

class Post {
	text;
	date;
	likes;
	photoFbId;
	photoDescription;
	sharedFrom;
	sharedText;
	
	constructor(node) {
		let photoUrl = wrap(() => node.querySelector("div>a[href]:has(img)").getAttribute("href"));
		let photoFbId = wrap(() => photoUrl.match(fbidRegex)[1]);
		if (photoFbId == null) {
			photoFbId = wrap(() => photoUrl.match(fbidFallbackRegex)[1]);
		}
		
		this.text = wrap(() => node.querySelector("article header+div").textContent);
		this.date = wrap(() => node.querySelector("footer div abbr").textContent);
		this.likes = wrap(() => node.querySelector("div>span>a[aria-label]").getAttribute("aria-label"));
		this.photoFbId = photoFbId;
		this.photoDescription = wrap(() => node.querySelector("a>img[alt]").getAttribute("alt"));
		this.sharedFrom = wrap(() => node.querySelector("article article header header strong").textContent);
		this.sharedText = wrap(() => node.querySelector("article article header+div").textContent);
	}
}

let fullSizeUrl = "https://mbasic.facebook.com/photo/view_full_size/?fbid=3994600644097593";

const DB_KEY = "satuk_scraper";

let db = localStorage.getItem(DB_KEY);

if (db) {
	db = JSON.parse(db);
} else {
	db = [];
}

document.body.style.border = "5px solid red";

let posts = document.querySelectorAll("section>article");

for (const post of posts) {
	db.push(new Post(post))
}

console.log("db size " + db.length);

localStorage.setItem(DB_KEY, JSON.stringify(db));


const nextPage = wrap(() => document.querySelector("section+div>a").getAttribute("href"));


document.addEventListener('keydown', function(event) {
    if (event.keyCode == 39) { // right arrow
        if (!nextPage) {
			alert("No next page button");
		} else {
			window.location.href = nextPage;
		}
    }
});

