const fs = require("fs");
const path = require("path");

const ENGLISH_DIR = "src/content/reference/en";
const LANGUAGES = ["es", "ko"]; // Add other languages if needed

const missingTranslations = [];
const outdatedTranslations = [];

function getLastModifiedTime(filePath) {
    return fs.existsSync(filePath) ? fs.statSync(filePath).mtimeMs : 0;
}

fs.readdirSync(ENGLISH_DIR).forEach(file => {
    const englishFile = path.join(ENGLISH_DIR, file);
    const englishUpdatedTime = getLastModifiedTime(englishFile);

    LANGUAGES.forEach(lang => {
        const langFile = path.join("src/content/reference", lang, file);
        
        if (!fs.existsSync(langFile)) {
            missingTranslations.push(langFile);
        } else {
            const langUpdatedTime = getLastModifiedTime(langFile);
            if (langUpdatedTime < englishUpdatedTime) {
                outdatedTranslations.push(langFile);
            }
        }
    });
});

if (missingTranslations.length === 0 && outdatedTranslations.length === 0) {
    console.log("✅ All translations are up to date!");
    process.exit(0);
}

let issueContent = "## ⚠️ Outdated/Missing Translations Detected\n\n";

if (missingTranslations.length > 0) {
    issueContent += "### ❌ Missing Translations\nThe following files are missing:\n";
    missingTranslations.forEach(file => issueContent += `- \`${file}\`\n`);
    issueContent += "\n";
}

if (outdatedTranslations.length > 0) {
    issueContent += "### ⚠️ Outdated Translations\nThe following files need updates:\n";
    outdatedTranslations.forEach(file => issueContent += `- \`${file}\`\n`);
    issueContent += "\n";
}

fs.writeFileSync(".github/scripts/outdated_translations.md", issueContent);

console.error(issueContent);
process.exit(0);
