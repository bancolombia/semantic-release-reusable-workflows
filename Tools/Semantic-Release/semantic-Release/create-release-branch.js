const { execSync } = require('child_process');

const currentVersion = process.argv[4];
// Obtener el tipo de release (major, minor, patch) desde los argumentos de la línea de comandos
const releaseType = process.argv[3];
const currentBranch = process.argv[2];
const releasesBranch = ["main", "master", "trunk"];
console.log("vars: " + currentVersion + " - " + currentBranch + " - " + releaseType);
const LTS_Support = process.env.SEMREL_LTS_TYPE ; // Obtener la variable de entorno SEMANTIC_LTS_SUPPORT
console.log("LTS_Support: " + LTS_Support);
if(currentVersion != null){

    // Obtener el número de versión major y minor
    const [major, minor] = currentVersion.split('.');
    var newBranchName = null;

    if(releasesBranch.includes(currentBranch)){
        if(LTS_Support === 'minor'){
            if ((releaseType === 'major' || releaseType === 'minor')) {
            // Crear el nombre de la nueva rama
                newBranchName = `stable/${major}.${minor}.x`;
            }
        }else if(LTS_Support === 'major'){
            if ((releaseType === 'major')) {
                // Crear el nombre de la nueva rama
                newBranchName = `stable/${major}.x`;
            }
        }
        if(newBranchName!=null){
            try {
                //execSync(`git checkout -b ${newBranchName} v${currentVersion}`);
                //execSync(`git push --set-upstream origin ${newBranchName}`);
                //execSync(`git checkout ${currentBranch}`);
                //Crear rama de mantenimiento
                execSync(`git push origin v${currentVersion}:refs/heads/${newBranchName}`);
                console.log(`Branch ${newBranchName} created and pushed successfully.`);
            } catch (error) {
                console.error(`Failed to create and push branch ${newBranchName}:`, error);
                process.exit(1);
            }
        }
    }
}