_The Command Line Y-interface._

# CLY

A tiny solution for creating tiny command line applications, with zero
third-party dependencies. Easy to setup and configurable!

See the Deno module here: https://deno.land/x/cly

```ts
import { ClyApp } from "https://deno.land/x/cly/mod.ts";

const app = new ClyApp("App name")
  .default(() => console.log("Hello!"))
  .command("help", () => console.log(app.getHelp()));

app.run();
```

Look, how easy it is!

See the [examples.ts](example.ts) for a full example.

This library is minimal, but powerful. Few methods and stuff. But you can do a
lot with it. Here are the options that you can configure.

## Options

```ts
const app = new ClyApp("App", {
  description: "App description",
  version: "1.0.0",
  help: "Work with App from the command line!",
  executableName: "app-command-name",
  parseOptions: {},
  forUnknownShow: "error",
  unknownMsg: (cmd) => `error: command not found '${cmd}'`,
});
```

- <samp>help</samp> ─ A custom help message to be used when help message has to
  be printed. If not set, a help message is generated with available commands,
  version, usage, and description.
- <samp>version</samp> ─ Version to print under the generated help message. If
  not specified, just the app name is printed. Version is prefixed with
  <samp>v</samp>.
- <samp>description</samp> ─ Description to add on top of the generated help
  message. Nothing is printed as description if not used.
- <samp>execName</samp> ─ Executable name for the usage hint in the help
  message.
- <samp>parseOptions</samp> ─ Argument options to be used with the Deno's
  standard <samp>flag</samp> module's argument parser.
  https://deno.land/std/flags/mod.ts
- <samp>forUnknownShow</samp> ─ You can pass "**error**",
  "**help**", or "**default_handler**" as the value. So, when an
  unknown command is used with your CLI application, you could either print out
  "unknown command" error (or the custom error, if one set using
  <samp>unknownMsg</samp>), or help message or the default handler, if one is
  set.
- <samp>unknownMsg</samp> ─ A custom error message for unknown commands. A
  function that returns a that custom error message as string. It takes the
  entered command as a parameter.

## Methods

- <samp>default</samp> ─ Registers a default handler. Used when no commands are
  passed in.
- <samp>command</samp> ─ Registers a command and it's handler.

  ```ts
  import { ClyApp } from "https://deno.land/x/cly/mod.ts";

  const app = new ClyApp("App");

  app.command("help", handler);
  app.command(["joke", "tell-joke"], handler);
  app.command({
    command: "command", // or ["command", "alias-1", "alias-2", ...],
    // description to be used in the help generated message.
    description: "Command description",
  }, handler);
  ```

  The handler function takes parsed arguments as the arguments. Doesn't have to
  return anything.

  You could also type the arguments.

  ```ts
  app.command<{ A: boolean }>("run", (args) => {
    console.log(args.A);
  });
  ```
- <samp>run</samp> ─ Start your application.
- <samp>getHelp</samp> ─ Returns the help message.

<br>

<p align="center">
  Go, create your <b>Command Line Y-Interface</b>...<br>
  <a href="LICENSE">Licensed under MIT</a>
</p>