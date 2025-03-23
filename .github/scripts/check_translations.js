const fs = require("fs");
const path = require("path");

const referencePath = "src/content/reference";
const languages = ["es", "ko"]; // Add other languages as needed
const outdatedTranslations = [];
const missingTranslations = [];

function checkTranslations() {
  const englishFiles = fs.readdirSync(path.join(referencePath, "en"));

  languages.forEach((lang) => {
    const langPath = path.join(referencePath, lang);
    if (!fs.existsSync(langPath)) {
      console.log(`🚨 Missing translation folder: ${langPath}`);
      return;
    }

    englishFiles.forEach((file) => {
      const englishFilePath = path.join(referencePath, "en", file);
      const langFilePath = path.join(referencePath, lang, file);

      if (!fs.existsSync(langFilePath)) {
        missingTranslations.push(`${langFilePath}`);
      } else {
        const enContent = fs.readFileSync(englishFilePath, "utf8").trim();
        const langContent = fs.readFileSync(langFilePath, "utf8").trim();

        if (enContent !== langContent) {
          outdatedTranslations.push(`${langFilePath}`);
        }
      }
    });
  });

  if (outdatedTranslations.length > 0 || missingTranslations.length > 0) {
    let issueContent = "## ⚠️ Outdated or Missing Translations Detected\n\n";

    if (missingTranslations.length > 0) {
      issueContent += "### 🚨 Missing Translations\n";
      missingTranslations.forEach((file) => {
        issueContent += `- ${file}\n`;
      });
    }

    if (outdatedTranslations.length > 0) {
      issueContent += "\n### 🔄 Outdated Translations\n";
      outdatedTranslations.forEach((file) => {
        issueContent += `- ${file}\n`;
      });
    }

    fs.writeFileSync(".github/scripts/outdated_translations.md", issueContent);
    console.log("✅ Issue content written to .github/scripts/outdated_translations.md");

    process.exit(0); // 🔹 Exit with 0 to prevent GitHub Action failure
  } else {
    console.log("✅ All translations are up to date.");
    process.exit(0); // Ensure success
  }
}

checkTranslations();
