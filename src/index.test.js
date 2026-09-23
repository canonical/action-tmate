jest.mock('@actions/core', () => ({
  __esModule: true,
  getInput: jest.fn(),
  getState: jest.fn(),
  saveState: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn()
}), { virtual: true });
import * as core from "@actions/core"
jest.mock('@actions/github', () => ({
  __esModule: true,
  context: {
    actor: "test-user",
    apiUrl: "https://api.github.com",
  }
}), { virtual: true });
jest.mock("@actions/tool-cache", () => ({
  downloadTool: async () => "",
  extractTar: async () => ""
}), { virtual: true });
jest.mock("@octokit/rest", () => ({
  __esModule: true,
  Octokit: class {
    users = {
      listPublicKeysForUser: async () => ({ data: [] })
    }
  }
}), { virtual: true });
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

const TMATE_SERVER_ENV = {
  TMATE_SERVER_HOST: "ssh.tmate.io",
  TMATE_SERVER_PORT: "22",
  TMATE_SERVER_RSA_FINGERPRINT: "SHA256:Hthk2T/M/Ivqfk1YYUn5ijC2Att3+UPzD7Rn72P5VWs",
  TMATE_SERVER_ED25519_FINGERPRINT: "SHA256:jfttvoypkHiQYUqUCwKeqd9d1fJj/ZiQlFOHVl6E9sI",
}

/** @param {Record<string, string>} inputs action inputs; unset inputs read as "" */
const mockInputs = (inputs) => {
  core.getInput.mockImplementation((name) => inputs[name] ?? "")
}

describe('Tmate GitHub integration', () => {
  const originalPlatform = process.platform;
  const originalEnv = process.env;
  const customConnectionString = "ssh token@ssh.tmate.io"

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(process, "platform", { value: "linux" })
    process.env = { ...originalEnv, ...TMATE_SERVER_ENV }
    execShellCommand.mockReset().mockResolvedValue(customConnectionString)
    getValidatedEnvVars.mockReset().mockImplementation(jest.requireActual('./helpers').getValidatedEnvVars)
    updateSshConfig.mockReset().mockResolvedValue(undefined)
  });

  afterAll(() => {
    Object.defineProperty(process, "platform", { value: originalPlatform })
    process.env = originalEnv
  });

  // The fork installs tmate from the Ubuntu archive on every platform, using
  // sudo unless disabled, and then loops until the continue file appears.
  it.each([
    ["with sudo", "true", "sudo "],
    ["without sudo", "false", ""],
  ])('should install dependencies and handle the main loop %s', async (_, sudo, prefix) => {
    mockInputs({ "install-dependencies": "true", sudo })
    await run()
    expect(execShellCommand).toHaveBeenNthCalledWith(1, `${prefix}DEBIAN_FRONTEND=noninteractive apt-get update`)
    expect(execShellCommand).toHaveBeenNthCalledWith(2, `${prefix}DEBIAN_FRONTEND=noninteractive apt-get install -y openssh-client xz-utils`)
    expect(execShellCommand).toHaveBeenNthCalledWith(3, `${prefix}DEBIAN_FRONTEND=noninteractive apt-get install -y tmate`)
    expect(core.info).toHaveBeenCalledWith(`Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenCalledWith(`SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenCalledWith("Exiting debugging session because the continue file was created");
    expect(core.setFailed).not.toHaveBeenCalled();
  });
  it('should handle the main loop without installing dependencies', async () => {
    mockInputs({ "install-dependencies": "false" })
    await run()
    expect(execShellCommand).not.toHaveBeenCalledWith(expect.stringContaining("apt-get"))
    expect(core.info).toHaveBeenNthCalledWith(1, `Web shell: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(2, `SSH: ${customConnectionString}`);
    expect(core.info).toHaveBeenNthCalledWith(3, "Exiting debugging session because the continue file was created");
  });
  it('should create session and exit immediately in connectivity-check mode', async () => {
    const customConnectionString = "ssh -p2222 foobar@test.example.com"
    const webUrl = "https://test.example.com"
    execShellCommand.mockImplementation((cmd) => {
      if (cmd.includes("tmate_web")) return Promise.resolve(webUrl)
      if (cmd.includes("tmate_ssh")) return Promise.resolve(customConnectionString)
      return Promise.resolve("")
    })
    mockInputs({ "install-dependencies": "false", "limit-access-to-actor": "false", "connectivity-check": "true" })

    await run()

    expect(core.info).toHaveBeenCalledWith("Connectivity check: tmate session created successfully")
    expect(core.info).toHaveBeenCalledWith(`SSH: ${customConnectionString}`)
    expect(core.info).toHaveBeenCalledWith(`Web shell: ${webUrl}`)
    expect(execShellCommand).toHaveBeenCalledWith(
      expect.stringContaining("kill-session")
    )
    expect(core.info).toHaveBeenCalledWith("Connectivity check: session terminated, connectivity verified")
    expect(core.saveState).toHaveBeenCalledWith('isPost', 'true')
  });
  it('should work without any options', async () => {
    mockInputs({})

    await run()

    expect(core.setFailed).not.toHaveBeenCalled();
  });
  // tmate server settings come from the TMATE_SERVER_* environment variables
  // provided by the runner, not from action inputs.
  it('should pass tmate server options from the environment to tmate', async () => {
    mockInputs({})

    await run()

    const tmateCmd = execShellCommand.mock.calls.map(([cmd]) => cmd).find(cmd => cmd.includes("set-option -g"))
    expect(tmateCmd).toBeDefined();
    for (const [envVar, value] of Object.entries(TMATE_SERVER_ENV)) {
      const option = envVar.toLowerCase().replace(/_/g, "-")
      expect(tmateCmd).toContain(`set-option -g ${option} "${value}"`)
    }
    expect(updateSshConfig).toHaveBeenCalledWith("ssh.tmate.io")
  });
  it.each([
    ["TMATE_SERVER_HOST", "tmate-server-host", "not/a/valid/hostname"],
    ["TMATE_SERVER_PORT", "tmate-server-port", "not-a-port"],
    ["TMATE_SERVER_PORT", "tmate-server-port", "123456"],
  ])('should fail when %s is invalid (%#)', async (envVar, option, value) => {
    process.env[envVar] = value
    mockInputs({})

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      Error(`Invalid value for "${option}(${envVar})": "${value}"`)
    )
  });
});
