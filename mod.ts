import {
  Args,
  parse,
  ParseOptions,
} from "https://deno.land/std@0.144.0/flags/mod.ts";

// deno-lint-ignore no-explicit-any
export type HandlerFunction<T = any> = (
  args: T & { _: string[] },
) => unknown | Promise<unknown>;
export interface ClyAppOptions {
  parseOptions: ParseOptions;
  description: string;
  execName: string;
  version: string;
  help: string;
  forUnknownShow: "error" | "default_handler" | "help";
  unknownMsg: (cmd?: string) => string;
}
export interface CommandOptions {
  handler: HandlerFunction;
  aliases: string[];
  description?: string;
}
export interface ICommand {
  command: string | Array<string>;
  description?: string;
}

export class ClyApp {
  private args: Args;
  private defaultHandler?: HandlerFunction;
  readonly commands = new Map<string, CommandOptions>();

  constructor(
    readonly name: string,
    private options: Partial<ClyAppOptions>,
  ) {
    this.options = {
      help: "",
      unknownMsg: (cmd) => `unknown command${cmd ? `: ${cmd}` : ""}`,
      ...options,
    };
    this.args = parse(Deno.args, options?.parseOptions);
  }

  default<T = unknown>(handler: HandlerFunction<T>) {
    if (this.defaultHandler) {
      throw new Error(`Default handler has already been registered.`);
    }
    this.defaultHandler = handler;
    return this;
  }

  command<T = unknown>(
    command: string | Array<string> | ICommand,
    handler: HandlerFunction<T>,
  ) {
    const cmd = typeof command === "string"
      ? command
      : Array.isArray(command)
      ? command[0]
      : Array.isArray(command.command)
      ? command.command[0]
      : command.command;

    let options: CommandOptions;
    if (typeof command === "string") {
      options = { handler, aliases: [], description: "" };
    } else if (Array.isArray(command)) {
      const [_p, ...r] = command;
      options = { handler, aliases: r, description: "" };
    } else if (Array.isArray(command.command)) {
      const [_p, ...r] = command.command;
      options = { handler, aliases: r, description: command.description };
    } else {
      options = { handler, aliases: [], description: command.description };
    }
    for (const alias of options.aliases) {
      if (alias.match(/\s/g)?.length) {
        throw new Error("Can't register command aliases with white spaces.");
      }
    }
    if (cmd === undefined || cmd === "") {
      throw new Error("No command provided!");
    }

    if (cmd.match(/\s/g)?.length) {
      throw new Error("Can't register command with white spaces.");
    }
    if (this.commands.has(cmd)) {
      throw new Error(`Command '${cmd}' has already been registered.`);
    }
    this.commands.set(cmd, options);
    return this;
  }

  getHelp() {
    if (this.options.help) return this.options.help;
    let avail_cmd = "┌ AVAILABLE COMMANDS";
    for (const [cmd, { description: desc, aliases }] of this.commands) {
      if (desc) {
        avail_cmd += `\n├──── ${cmd}\n│ ${desc.split("\n").join("\n│ ")}`;
      } else avail_cmd += `\n├──── ${cmd}`;
      if (aliases.length > 0) {
        avail_cmd += `\n│ Aliases: ${aliases.join(", ")}`;
      }
    }
    const opts = this.options;
    return `${opts?.description ? `${opts?.description}\n\n` : ""}\
${opts?.execName ? `Usage: ${opts.execName} command [options]\n\n` : ""}\
${avail_cmd !== "┌ AVAILABLE COMMANDS" ? `${avail_cmd}\n\n` : ""}\
${this.name}${opts?.version ? ` v${opts?.version}` : ""}`;
  }

  async run() {
    let cmd: string | number | undefined = this.args._[0];
    for (const [cmdOfAlias, { aliases }] of this.commands) {
      if (aliases?.includes(cmd?.toString())) {
        cmd = cmdOfAlias;
        break;
      }
    }

    if (cmd === undefined && this.defaultHandler) {
      return await this.defaultHandler(this.args);
    }

    if (this.commands.has(cmd?.toString())) {
      const command = this.commands.get(cmd?.toString());
      return await command?.handler(this.args);
    }

    switch (this.options.forUnknownShow) {
      case "default_handler":
        return await this.defaultHandler?.(this.args);
      case "error":
        return console.log(this.options.unknownMsg?.(cmd?.toString()));
      case "help":
      default:
        console.log(this.getHelp());
    }
  }
}
