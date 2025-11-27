module.exports = [
  { breaking: true, release: "major" },
  { revert: true, release: "patch" },
  { type: "feat", release: false },
  { type: "fix", release: false },
  { type: "perf", release: false },
  { type: "featurerelease", release: "minor" },
  { type: "securitypatchrelease", release: "patch" },
  { type: "fixpatchrelease", release: "patch" },
  { type: "breakingrelease", release: "major" },
  { tag: "Breaking", release: "major" },
];


