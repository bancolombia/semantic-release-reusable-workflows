module.exports = {
    preset: 'angular',
    writerOpts: {
        transform: (commit, context) => {
            // console.log('Commit Object: %s', JSON.stringify(commit, null, 2));
            // console.log('Context Object: %s', JSON.stringify(context, null, 2));

            // Clonar el objeto commit para evitar modificar el inmutable original
            const newCommit = { ...commit };

            if (newCommit.hash == null || newCommit.subject == null) {
                return;
            }
            if (newCommit.scope == null && newCommit.type != "fixpatchrelease"
                && newCommit.type != "securitypatchrelease" && newCommit.type != "featurerelease"
                && newCommit.type != "breakingrelease"
            ) {
                newCommit.scope = "General";
            }
            else if (newCommit.type == "fixpatchrelease"
                || newCommit.type == "securitypatchrelease" || newCommit.type == "featurerelease"
                ||  newCommit.type == "breakingrelease") {
                newCommit.scope = " ";
            }
            newCommit.shortHash = newCommit.hash.substring(0, 7);
            newCommit.subject = newCommit.subject.substring(0, 70);
            urlRepo = `${context.host}/${context.owner}/${context.repository}`
            newCommit.commitUrl = `${urlRepo}/commit/${newCommit.hash}`;
            context.linkCompare = `${urlRepo}/compare/${context.previousTag}...${context.currentTag}`;

            if (newCommit.author && newCommit.author.name) {
                newCommit.authorName = newCommit.author.name;
            } else if (newCommit.committer && newCommit.committer.name) {
                newCommit.authorName = newCommit.committer.name;
            } else {
                newCommit.authorName = 'Unknown';
            }

            const moduleMatch = newCommit.subject.match(/\(([^)]+)\)/);
            newCommit.module = moduleMatch ? moduleMatch[1] : 'General';

            // Extraer la referencia al PR desde el subject
            const prMatch = newCommit.subject.match(/\(#(\d+)\)$/);
            if (prMatch) {
                newCommit.pullRequest = prMatch[1];
                newCommit.pullRequestUrl = `${urlRepo}/pull/${newCommit.pullRequest}`;
                // Añadir la URL del PR al subject
                newCommit.subject = newCommit.subject.replace(
                    `(#${newCommit.pullRequest})`,
                    `([#${newCommit.pullRequest}](${newCommit.pullRequestUrl}))`
                );
            }
            var auxtype = "";
            switch (newCommit.type) {
                case 'feat':
                    newCommit.type = 'Feature';
                    break;
                case 'fix':
                    newCommit.type = 'Bug Fixed';
                    break;
                case 'docs':
                    newCommit.type = 'Documentation';
                    break;
                case 'style':
                    newCommit.type = 'Styles';
                    break;
                case 'refactor':
                    newCommit.type = 'Code Refactoring';
                    break;
                case 'perf':
                    newCommit.type = 'Performance Improvements';
                    break;
                case 'test':
                    newCommit.type = 'Tests';
                    break;
                case 'build':
                    newCommit.type = 'Build System';
                    break;
                case 'ci':
                    newCommit.type = 'Continuous Integration';
                    break;
                case 'removed':
                    newCommit.type = 'Removed Feature';
                    return;
                case 'deprecated':
                    newCommit.type = 'Deprecated Feature';
                    break;
                case 'security':
                    newCommit.type = 'Security fixed';
                case 'securitypatchrelease':
                    newCommit.type = 'Security Patch Release';
                    auxtype = '### 🔒 Security Patch Release';
                    break;
                case 'fixpatchrelease':
                    newCommit.type = 'Fix Patch Release';
                    auxtype = '### 🐛 Fix Patch Release';
                    break;
                case 'featurerelease':
                    newCommit.type = 'Features Release';
                    auxtype = '### 🚀 Features Release';
                    break;
                case 'breakingrelease':
                    newCommit.type = 'Breaking Release';
                    auxtype = '### ⚠️ Breaking Release';
                    break;
                default:
                    return;
            }
            if (newCommit.type != 'Features Release' && newCommit.type != 'Breaking Release' && newCommit.type != 'Security Patch Release' && newCommit.type != 'Fix Patch Release')
                newCommit.description = "- " + newCommit.type + ": " + newCommit.subject + " ([" + newCommit.shortHash + "](" + newCommit.commitUrl + ")) - Contribuidor: " + newCommit.authorName + "\n" + (newCommit.body != null ? newCommit.body : "")
            else {
                newCommit.description = auxtype + ": " + newCommit.subject + " ([" + newCommit.shortHash + "](" + newCommit.commitUrl + ")) - Contribuidor: " + newCommit.authorName + "\n" + (newCommit.body != null ? newCommit.body : "")
            }
            return newCommit;
        },
        headerPartial: "## [[{{version}}]({{linkCompare}})] - {{date}}",
        commitPartial: `{{description}}`,
        groupBy: 'scope',
        commitGroupsSort: (a, b) => { const order = ['Features Release', 'Breaking Release', 'Fix Patch Release', 'Security Patch Release', 'Feature', 'Bug Fixed', 'Documentation', 'Styles', 'Code Refactoring', 'Performance Improvements', 'Tests', 'Build System', 'Continuous Integration', 'Removed Feature', 'Deprecated Feature', 'Security fixed', 'Chore']; return order.indexOf(a.title) - order.indexOf(b.title); },
        commitsSort: ['type', 'subject'],
    },
};