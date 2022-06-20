import { ClyApp } from "./mod.ts";

const cly = new ClyApp("CLY", {
  version: "1.0.0",
  execName: "cly",
  description: `A tiny solution for tiny CLI applications.
GitHub repository: https://github.com/dcdunkan/cly`,
  forUnknownShow: "error",
  unknownMsg: (cmd) => `Command not found: '${cmd}'`,
});

cly.default(() => console.log("Hello, from CLY!"));

cly.command("help", (args) => {
  console.log(args)
  if (cly.commands.has(args._?.[1] as string)) {
    console.log(cly.commands.get(args._?.[1] as string)?.description);
  } else {
    console.log(cly.getHelp());
  }
});

cly.command<{ C: string; category: string }>({
  command: ["joke", "tell-joke"],
  description: `Prints out a joke from https://jokeapi.dev/.
You can set a category using the -C or --category option.`,
}, async (args) => {
  const response = await fetch(
    `https://v2.jokeapi.dev/joke/${args.category ?? args.C ?? "Any"}`,
  );
  const jk = await response.json();
  if (jk.error) return console.log(`%cError: ${jk.causedBy[0]}`, "color:red");

  if (jk.type === "single") {
    return console.log(`%c${jk.joke}`, "color: cyan");
  }

  console.log(`> %c${jk.setup}`, "color: cyan");
  console.log(`> %c${jk.delivery}`, "color: green");
});

cly.command({
  command: "update-deno",
  description: "Check for updates and update Deno.",
}, async () => {
  const p = Deno.run({ cmd: ["deno", "upgrade"], stdout: "piped" });
  const { success } = await p.status();
  if (success) {
    console.log(new TextDecoder().decode(await p.output()).trim());
  } else {
    console.log("Failed to update Deno.");
  }
});

cly.run();
