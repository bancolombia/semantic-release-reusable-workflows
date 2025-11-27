/**
 * @type {import('semantic-release').GlobalConfig}
 */
const fs = require("fs");
const path = require("path");
const { writerOpts } = require("./semantic-release/writerChangelog.js");
const versionFile = process.env.SEMREL_FILE_VER || "version.txt";
const prereleaseTrunkTag = process.env.SEMREL_PRERELEASE_TRUNK_TAG;
// Si no hay tag, se considera rama oficial (no es prelanzamiento)
const trunkBranch = prereleaseTrunkTag
  ? { name: "trunk", prerelease: prereleaseTrunkTag } // rama de prelanzamiento
  : { name: "trunk", prerelease: false }; // rama oficial

const stableBranch = process.env.SEMREL_CUSTOM_NAME_STABLE ? process.env.SEMREL_CUSTOM_NAME_STABLE : "stable/+([0-9])?(.{+([0-9]),x}).x";

const branchesconfig = prereleaseTrunkTag
  ? [
      { name: stableBranch , prerelease: false },
      trunkBranch,
      "next",
      "next-major",
      { name: "beta", prerelease: process.env.SEMREL_PRERELEASE_BETA_TAG },
      { name: "alpha", prerelease: process.env.SEMREL_PRERELEASE_ALPHA_TAG  },
    ]
  : [
      {
        name: "stable/+([0-9]).+([0-9]).x", // Primero: líneas de mantenimiento con MAJOR.MINOR
        range: '${name.replace(/^stable\\//, "")}',
        channel: '${name.replace(/^stable\\//, "")}',
        type: "maintenance",
      },
      {
        name: "stable/+([0-9]).x", // Segundo: líneas de mantenimiento solo MAJOR
        range: '${name.replace(/^stable\\//, "")}', // extrae “1.x”, “2.x”, etc.
        channel: '${name.replace(/^stable\\//, "")}', // usa el mismo string como channel
        type: "maintenance",
      },
      trunkBranch, // Rama oficial o de prelanzamiento trunk
      { name: "master", prerelease: false },
      { name: "main", prerelease: false },
      { name: "facade", prerelease: false },
      "next",
      "next-major",
      { name: "beta", prerelease: process.env.SEMREL_PRERELEASE_BETA_TAG },
      { name: "alpha", prerelease: process.env.SEMREL_PRERELEASE_ALPHA_TAG },
    ];

console.log(branchesconfig);

if (!fs.existsSync(path.resolve(versionFile))) {
  console.warn(
    `⚠️ Warning: The configured version file (${versionFile}) was not found in the repository.`
  );
}
module.exports = {
  branches: branchesconfig,
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: "./semantic-release/release-rules.js",
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        writerOpts,
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: process.env.SEMREL_PATH_CHANGELOG,
      },
    ],
    [
      "@semantic-release/exec",
      {
        prepareCmd: `node semantic-release/create-release-branch.js \${branch.name} \${nextRelease.type} \${lastRelease.version} \${branch.prerelease} && echo \${nextRelease.version} > ${versionFile}`,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [process.env.SEMREL_PATH_CHANGELOG, versionFile],
        message: process.env.SEMREL_COMMENT_COMMIT,
      },
    ],
    [
      "@semantic-release/github",
      {
        releaseBody: (pluginConfig, context) => {
          const notes = context.nextRelease.notes || "";
          return notes.length > 125000
            ? notes.slice(0, 124000) +
                "\n\n_⚠ Release notes truncated due to GitHub API limit._"
            : notes;
        },
      },
    ],
  ],
};
