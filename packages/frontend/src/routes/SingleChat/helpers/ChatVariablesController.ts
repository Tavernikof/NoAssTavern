import { DisposableContainer, DisposableItem } from "src/helpers/DisposableContainer.ts";
import { ChatController } from "src/routes/SingleChat/helpers/ChatController.ts";

export class ChatVariablesController implements DisposableItem {
  private dc = new DisposableContainer();
  globalVars: Record<string, any>;

  constructor(private readonly chatController: ChatController) {
    this.globalVars = chatController.chat.variables ?? {};
  }

  dispose() {
    this.dc.dispose();
  }

  setVar(name: string, value: string, vars = this.globalVars) {
    if (!name) throw new Error("name must be a string");
    if (!value) value = "";
    if (typeof value !== "string") value = String(value);
    if (vars === this.globalVars) this.chatController.chat.setVar(name, value);
    vars[name] = value;
    return value;
  }

  incVar(name: string, vars = this.globalVars) {
    const globalVar = Number(this.globalVars[name]);
    const value = (Number.isNaN(globalVar) ? 0 : globalVar) + 1;
    return this.setVar(name, String(value), vars);
  }

  decVar(name: string, vars = this.globalVars) {
    const globalVar = Number(this.globalVars[name]);
    const value = (Number.isNaN(globalVar) ? 0 : globalVar) - 1;
    return this.setVar(name, String(value), vars);
  }

  getVar(name: string, vars = this.globalVars) {
    if (!name) throw new Error("name must be a string");
    return vars[name] ?? "";
  }

  createLocalVariablesContainer(): LocalVariablesContainer {
    const values: Record<string, string> = {};

    return {
      setVar: (name: string, value: string) => this.setVar(name, value, values),
      incVar: (name: string) => this.incVar(name, values),
      decVar: (name: string) => this.decVar(name, values),
      getVar: (name: string) => this.getVar(name, values),
    };
  }
}

