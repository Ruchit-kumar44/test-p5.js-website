module.exports = async ({ github, context }) => {
    const comment = context.payload.comment.body.toLowerCase();
    const issue_number = context.payload.issue.number;
    const repo = context.repo.repo;
    const owner = context.repo.owner;
    const sender = context.payload.comment.user.login;

    // Fetch issue details to check labels
    const issue = await github.rest.issues.get({
        owner,
        repo,
        issue_number
    });

    const labels = issue.data.labels.map(label => label.name.toLowerCase());

    // Only proceed if issue has "translation" label
    if (!labels.includes("translation")) {
        console.log("Skipping: Issue does not have 'translation' label.");
        return;
    }

    // Fetch all comments in the issue thread
    const comments = await github.rest.issues.listComments({
        owner,
        repo,
        issue_number
    });

    // Check if bot has already provided guidance
    const botUsername = context.payload.sender.login;
    let botHasReplied = comments.data.some(comment => 
        comment.user.login === botUsername && 
        (comment.body.includes("Here’s how you can get started") || comment.body.includes("Tagging @ruchit-kumar44 for assistance"))
    );

    let response = null;

    if (comment.includes("how to translate") || comment.includes("where to translate") || comment.includes("how do i translate")) {
        if (!botHasReplied) {
            response = `👋 Welcome @${sender}!  
            Thanks for your interest in translating this issue.  
            Here’s how you can get started:  
            - 📖 **Step 1:** Check our translation guide: [p5.js Translation Guide](https://github.com/processing/p5.js-website/blob/main/TRANSLATION.md)  
            - 📂 **Step 2:** Fork the repository & find the relevant file  
            - ✅ **Step 3:** Submit a PR when ready! 🚀`; 
        } else {
            response = `🔹 @${sender}, guidance has already been provided in this thread. Please check above for translation instructions. 📝`;
        }
    } 
    else if (comment.includes("i need help") || comment.includes("help with translation") || comment.includes("need assistance")) {
        if (!botHasReplied) {
            response = `🔹 @${sender}, thanks for reaching out!  
            Tagging @your-username for assistance. 🛠️`; 
        } else {
            response = `🔹 @${sender}, assistance has already been requested earlier in this thread. If you need further clarification, please specify. ✨`;
        }
    }

    if (response) {
        console.log("Replying to comment:", comment);
        await github.rest.issues.createComment({
            owner,
            repo,
            issue_number,
            body: response
        });
    }
};
