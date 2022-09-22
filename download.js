const fullSizeUrl = "https://mbasic.facebook.com/photo/view_full_size/?fbid=";

const REDIRECT_REGEX = /\<a href\="(.+)"/; 

async function download(fbid) {
    let currentUrl = document.location.href;
    document.location.href = fullSizeUrl + fbid;

    let downloadUrl = document.querySelector("img").getAttribute("src");
    let response = await fetch(downloadUrl, {
        redirect: 'follow',
        mode: 'cors',
        credentials: 'same-origin',
        referrerPolicy: 'same-origin',
    });
    let blob = await response.blob();

    let imageUrl = URL.createObjectURL(imageBlob);
    let a = document.createElement("a");
    a.style.display = 'none';
    a.href = imageUrl;
    a.download = fbid + ".jpg";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(imageUrl);
    document.location.href = currentUrl;
}

download(439048901585168);