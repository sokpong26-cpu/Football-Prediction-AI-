import os
import json

EXT_FOLDER = "apple_extension"
os.makedirs(EXT_FOLDER, exist_ok=True)

# 1. manifest.json
manifest = {
    "manifest_version": 3,
    "name": "Apple VIP Overlay",
    "version": "1.0",
    "description": "Custom Apple UI overlay",
    "permissions": ["storage"],
    "content_scripts": [
        {
            "matches": ["<all_urls>"],
            "css": ["style.css"],
            "js": ["functions.js", "content.js"],
            "run_at": "document_idle"
        }
    ]
}

with open(os.path.join(EXT_FOLDER, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

# 2. functions.js
functions_js = """function waitForElems(selector, reversed = false, track = null){
    return new Promise(resolve => {
        let inter = setInterval(function(){
            const elems = document.querySelectorAll(selector);
            if(!!elems.length === reversed){
                if(track) track(false);
                return;
            }
            clearInterval(inter);
            if(track) track(true);
            resolve(elems);
        }, 100);
    });
}"""

with open(os.path.join(EXT_FOLDER, "functions.js"), "w", encoding="utf-8") as f:
    f.write(functions_js)

# 3. style.css
style_css = """@keyframes colorChange {
    0% { color: red; }
    25% { color: yellowgreen; }
    50% { color: blue; }
    75% { color: orange; }
    100% { color: red; }
}

.thimbles-logo__caption,
.thimbles-info__title {
    animation: colorChange 3s infinite;
}"""

with open(os.path.join(EXT_FOLDER, "style.css"), "w", encoding="utf-8") as f:
    f.write(style_css)

print(f"Extension files created in ./{EXT_FOLDER}/")