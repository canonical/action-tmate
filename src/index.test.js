jest.mock('@actions/core');
import * as core from "@actions/core"
jest.mock('@actions/github');
jest.mock("@actions/tool-cache", () => ({
  downloadTool: async () => "",
  extractTar: async () => ""
}));
jest.mock("fs", () => ({
  mkdirSync: () => true,
  existsSync: () => true,
  unlinkSync: () => true,
  writeFileSync: () => true,
  promises: new Proxy({}, {
    get: () => {
      return () => true
    }
  })
}));
jest.mock('./helpers', () => {
  const originalModule = jest.requireActual('./helpers');
  return {
    __esModule: true,
    ...originalModule,
    execShellCommand: jest.fn(() => 'mocked execShellCommand'),
    getValidatedEnvVars: jest.fn(originalModule.getValidatedEnvVars),
    updateSshConfig: jest.fn(originalModule.updateSshConfig),
  };
});
import { execShellCommand, getValidatedEnvVars, updateSshConfig } from "./helpers"
import { run } from "."

describe('Tmate GitHub integration', () => {
  const originalPlatform = process.platform;

  afterAll(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform
    })
  });

  it('should handle the main loop for Windows', async () => {
    Object.defineProperty(process, "platform", {
      value: "win32"
    })
    core.getInput.mockReturnValueOnce("true").mockReturnValueOnce("false")
    const customConnectionString = "foobar"
    execShellCommand.mockReturnValue(Promise.resolve(customConnectionString))
    await run()
    expect(execShellCommand).toHaveBeenNthCalledWith(1, "pacman -S --noconfirm tmate");
    expect(core.info).toHaveBeenNthCalledWith(1, `Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, `SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(3, "Exiting debugging session because the continue file was created");
  });
  it('should handle the main loop for Windows without dependency installation', async () => {
    Object.defineProperty(process, "platform", {
      value: "win32"
    })
    core.getInput.mockReturnValueOnce("false")
    const customConnectionString = "foobar"
    execShellCommand.mockReturnValue(Promise.resolve(customConnectionString))
    await run()
    expect(execShellCommand).not.toHaveBeenNthCalledWith(1, "pacman -S --noconfirm tmate");
    expect(core.info).toHaveBeenNthCalledWith(1, `Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, `SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(3, "Exiting debugging session because the continue file was created");
  });
  it('should handle the main loop for linux', async () => {
    Object.defineProperty(process, "platform", {
      value: "linux"
    })
    core.getInput.mockReturnValueOnce("true").mockReturnValueOnce("true").mockReturnValueOnce("false")
    const customConnectionString = "foobar"
    execShellCommand.mockReturnValue(Promise.resolve(customConnectionString))
    await run()
    expect(execShellCommand).toHaveBeenNthCalledWith(1, "sudo apt-get update")
    expect(core.info).toHaveBeenNthCalledWith(1, `Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, `SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(3, "Exiting debugging session because the continue file was created");
  });
  it('should handle the main loop for linux without sudo', async () => {
    Object.defineProperty(process, "platform", {
      value: "linux"
    })
    core.getInput.mockReturnValueOnce("true").mockReturnValueOnce("false").mockReturnValueOnce("false")
    const customConnectionString = "foobar"
    execShellCommand.mockReturnValue(Promise.resolve(customConnectionString))
    await run()
    expect(execShellCommand).toHaveBeenNthCalledWith(1, "apt-get update")
    expect(core.info).toHaveBeenNthCalledWith(1, `Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, `SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(3, "Exiting debugging session because the continue file was created");
  });
  it('should handle the main loop for linux without installing dependencies', async () => {
    Object.defineProperty(process, "platform", {
      value: "linux"
    })
    core.getInput.mockReturnValueOnce("false").mockReturnValueOnce("false")
    const customConnectionString = "foobar"
    execShellCommand.mockReturnValue(Promise.resolve(customConnectionString))
    await run()
    expect(execShellCommand).not.toHaveBeenNthCalledWith(1, "apt-get update")
    expect(core.info).toHaveBeenNthCalledWith(1, `Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, `SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(3, "Exiting debugging session because the continue file was created");
  });
  it('should install tmate via brew for darwin', async () => {
    Object.defineProperty(process, "platform", {
      value: "darwin"
    })
    core.getInput.mockReturnValueOnce("true")
    await run()
    expect(core.getInput).toHaveBeenNthCalledWith(1, "install-dependencies")
    expect(execShellCommand).toHaveBeenNthCalledWith(1, "brew install tmate")
  });
  it('should not install dependencies for darwin', async () => {
    Object.defineProperty(process, "platform", {
      value: "darwin"
    })
    core.getInput.mockReturnValueOnce("false")
    await run()
    expect(execShellCommand).not.toHaveBeenNthCalledWith(1, "brew install tmate")
  });
  it('should create session and exit immediately in smoke-test mode', async () => {
    Object.defineProperty(process, "platform", {
      value: "linux"
    })
    const customConnectionString = "ssh -p2222 foobar@test.example.com"
    const webUrl = "https://test.example.com"
    execShellCommand.mockImplementation((cmd) => {
      if (cmd.includes("tmate_web")) return Promise.resolve(webUrl)
      if (cmd.includes("tmate_ssh")) return Promise.resolve(customConnectionString)
      return Promise.resolve("")
    })
    core.getInput.mockImplementation((name) => {
      if (name === "install-dependencies") return "false"
      if (name === "limit-access-to-actor") return "false"
      if (name === "smoke-test") return "true"
      return ""
    })
    getValidatedEnvVars.mockReturnValue(undefined)
    updateSshConfig.mockResolvedValue(undefined)

    await run()

    expect(core.info).toHaveBeenCalledWith("Smoke test: tmate session created successfully")
    expect(core.info).toHaveBeenCalledWith(`SSH: ${customConnectionString}`)
    expect(core.info).toHaveBeenCalledWith(`Web shell: ${webUrl}`)
    expect(execShellCommand).toHaveBeenCalledWith(
      expect.stringContaining("kill-session")
    )
    expect(core.info).toHaveBeenCalledWith("Smoke test: session terminated, connectivity verified")
    expect(core.saveState).not.toHaveBeenCalledWith('isPost', 'true')
  });
  it('should work without any options', async () => {
    core.getInput.mockReturnValue("");

    await run()

    expect(core.setFailed).not.toHaveBeenCalled();
  });
  it('should validate correct tmate options', async () => {
    // Check for the happy path first.
    core.getInput.mockImplementation(function(opt) {
        switch (opt) {
          case "tmate-server-host": return "ssh.tmate.io";
          case "tmate-server-port": return "22";
          case "tmate-server-rsa-fingerprint": return "SHA256:Hthk2T/M/Ivqfk1YYUn5ijC2Att3+UPzD7Rn72P5VWs";
          case "tmate-server-ed25519-fingerprint": return "SHA256:jfttvoypkHiQYUqUCwKeqd9d1fJj/ZiQlFOHVl6E9sI";
          default: return "";
        }
    })

    await run()

    // Find the command launching tmate with its various options.
    let tmateCmd;
    for (const call of execShellCommand.mock.calls) {
      const cmd = call[0]
      if (cmd.includes("set-option -g")) {
        tmateCmd = cmd
        break
      }
    }

    expect(tmateCmd).toBeDefined();

    const re = /set-option -g tmate-server-host "([^"]+)"/;
    const match = re.exec(tmateCmd);
    expect(match).toBeTruthy();
    expect(match[1]).toEqual("ssh.tmate.io");
  });
  it('should fail to validate wrong tmate options', async () => {
    core.getInput.mockImplementation(function(opt) {
        switch (opt) {
          case "tmate-server-host": return "not/a/valid/hostname";
          default: return "";
        }
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
        Error("Invalid value for 'tmate-server-host': 'not/a/valid/hostname'")
      )
  });
});
