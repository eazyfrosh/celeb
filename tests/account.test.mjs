import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("password changes require the signed-in admin and current password", async () => {
  const source = await readFile(
    new URL("../src/app/api/admin/account/password/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /getAdmin\(\)/);
  assert.match(source, /verifyPassword\(parsed\.data\.currentPassword/);
  assert.match(source, /hashPassword\(parsed\.data\.newPassword\)/);
  assert.match(source, /rateLimit/);
});
