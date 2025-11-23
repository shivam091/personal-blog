const required = ">=20";

// Parse ">=20" → get minimum version 20
const min = parseInt(required.replace(/[^0-9]/g, ""), 10);
const current = parseInt(process.versions.node.split(".")[0], 10);

if (current < min) {
  console.error(
    `Error: Node ${process.version} does not satisfy required version ${required}.`
  );
  process.exit(1);
}
