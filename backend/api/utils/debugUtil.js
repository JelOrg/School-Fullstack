import util from "util";

/**
 * debugUtil.js
 * The ultimate developer toolkit for debugging Node.js/Prisma backends.
 */
const debugUtil = {
  // 1. THE UNIVERSAL INSPECTOR
  // Use this to see EVERYTHING inside an object (no [Object] hiding)
  peek: (label, data) => {
    const divider = "─".repeat(process.stdout.columns || 50);
    console.log(`\n\x1b[35m${divider}\x1b[0m`); // Magenta
    console.log(`\x1b[1;33m🧐 PEEKING AT: ${label.toUpperCase()}\x1b[0m`); // Bold Yellow
    console.log(
      util.inspect(data, {
        showHidden: false,
        depth: null, // Infinite depth
        colors: true, // Terminal colors
        compact: false,
        breakLength: 80,
      }),
    );
    console.log(`\x1b[35m${divider}\x1b[0m\n`);
  },

  // 2. SECURITY SAFE LOG
  // Clones the data and masks sensitive fields like passwords/tokens
  safeLog: (label, data) => {
    const sensitiveKeys = [
      "password",
      "saltedPassword",
      "token",
      "secret",
      "salt",
      "hash",
    ];
    const mask = (obj) => {
      const cloned = Array.isArray(obj) ? [...obj] : { ...obj };
      for (let key in cloned) {
        if (sensitiveKeys.includes(key)) {
          cloned[key] = "******** [MASKED]";
        } else if (typeof cloned[key] === "object" && cloned[key] !== null) {
          cloned[key] = mask(cloned[key]);
        }
      }
      return cloned;
    };

    console.log(`\x1b[32m🛡️  SAFE LOG [${label}]:\x1b[0m`);
    console.log(mask(data));
  },

  // 3. TABLE VIEW
  // Perfect for lists from prisma.findMany()
  table: (label, dataArray) => {
    console.log(`\n\x1b[1;36m📊 TABLE: ${label.toUpperCase()}\x1b[0m`);
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.log("   (Empty or invalid array)");
    } else {
      console.table(dataArray);
    }
  },

  // 4. DIFF TOOL
  // Shows what exactly changed between two objects (ideal for Updates)
  diff: (label, oldData, newData) => {
    const changes = {};
    const allKeys = new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {}),
    ]);

    allKeys.forEach((key) => {
      if (oldData[key] !== newData[key]) {
        changes[key] = { from: oldData[key], to: newData[key] };
      }
    });

    console.log(`\x1b[33m🔄 DIFF [${label}]:\x1b[0m`);
    if (Object.keys(changes).length === 0)
      console.log("   No changes detected.");
    else console.log(changes);
  },

  // 5. PERFORMANCE TIMER
  // Measures how long a function (like Bcrypt or a DB query) takes
  timeTask: async (label, taskFn) => {
    const start = performance.now();
    const result = await taskFn();
    const end = performance.now();
    console.log(
      `\x1b[34m⏱️  [${label}] took ${(end - start).toFixed(2)}ms\x1b[0m`,
    );
    return result;
  },

  // 6. ENVIRONMENT & DB CHECKER
  // Use this in your app.js or server.js on startup
  startupCheck: async (prisma, requiredEnvKeys = []) => {
    console.log("\n\x1b[1m🚀 STARTUP DIAGNOSTICS\x1b[0m");

    // Check Env
    console.log("🌐 Environment:");
    requiredEnvKeys.forEach((key) => {
      const status = process.env[key] ? "✅" : "❌ MISSING";
      console.log(`   - ${key.padEnd(15)} : ${status}`);
    });

    // Check DB
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("🐘 Database        : ✅ CONNECTED");
    } catch (e) {
      console.error("🐘 Database        : ❌ FAILED", e.message);
    }
    console.log("");
  },

  // 7. MEMORY SNAPSHOT
  // Helps identify memory leaks if things get slow
  snapshot: (label) => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(
      `\x1b[90m🧠 MEMORY [${label}]: ~${Math.round(used * 100) / 100} MB used\x1b[0m`,
    );
  },
};

export default debugUtil;
