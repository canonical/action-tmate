/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 450:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 177:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 454:
/***/ ((module) => {

module.exports = eval("require")("@actions/tool-cache");


/***/ }),

/***/ 243:
/***/ ((module) => {

module.exports = eval("require")("@octokit/rest");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: external "os"
const external_os_namespaceObject = require("os");
var external_os_default = /*#__PURE__*/__nccwpck_require__.n(external_os_namespaceObject);
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
var external_fs_default = /*#__PURE__*/__nccwpck_require__.n(external_fs_namespaceObject);
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__nccwpck_require__.n(external_path_namespaceObject);
// EXTERNAL MODULE: ../../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/core
var core = __nccwpck_require__(450);
// EXTERNAL MODULE: ../../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/github
var github = __nccwpck_require__(177);
// EXTERNAL MODULE: ../../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/tool-cache
var tool_cache = __nccwpck_require__(454);
// EXTERNAL MODULE: ../../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/rest
var rest = __nccwpck_require__(243);
;// CONCATENATED MODULE: external "process"
const external_process_namespaceObject = require("process");
var external_process_default = /*#__PURE__*/__nccwpck_require__.n(external_process_namespaceObject);
;// CONCATENATED MODULE: external "child_process"
const external_child_process_namespaceObject = require("child_process");
;// CONCATENATED MODULE: ./src/helpers.js
// @ts-check






/**
 * @returns {boolean}
 */
const useSudoPrefix = () => {
  const input = core.getInput("sudo");
  return input === "auto" ? external_os_default().userInfo().uid !== 0 : input === "true";
}

/**
 * @param {string} cmd
 * @param {{quiet: boolean} | undefined} [options]
 * @returns {Promise<string>}
 */
const execShellCommand = (cmd, options) => {
  core.debug(`Executing shell command: [${cmd}]`)
  return new Promise((resolve, reject) => {
    const proc = (external_process_default()).platform !== "win32" ?
      (0,external_child_process_namespaceObject.spawn)(cmd, [], {
        shell: true,
        env: {
          ...(external_process_default()).env,
          HOMEBREW_GITHUB_API_TOKEN: core.getInput('github-token') || undefined
        }
      }) :
      (0,external_child_process_namespaceObject.spawn)("C:\\msys64\\usr\\bin\\bash.exe", ["-lc", cmd], {
        env: {
          ...(external_process_default()).env,
          "MSYS2_PATH_TYPE": "inherit", /* Inherit previous path */
          "CHERE_INVOKING": "1", /* do not `cd` to home */
          "MSYSTEM": "MINGW64", /* include the MINGW programs in C:/msys64/mingw64/bin/ */
        }
      })
    let stdout = ""
    proc.stdout.on('data', (data) => {
      if (!options || !options.quiet) external_process_default().stdout.write(data);
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      external_process_default().stderr.write(data)
    });

    proc.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(code ? code.toString() : undefined))
      }
      resolve(stdout.trim())
    });
  });
}


/**
 * @param {string} key
 * @param {RegExp} re regex to use for validation
 * @return {string|undefined} {undefined} or throws an error if input doesn't match regex
 */
const getValidatedEnvVars = (key, re) => {
  const value = (external_process_default()).env[key.toUpperCase()] || ""
  if (value !== undefined && !re.test(value)) {
    throw new Error(`Invalid value for '${key}': '${value}'`);
  }
  return value;
}


/**
 * @return {Promise<string>}
 */
const getLinuxDistro = async () => {
  try {
    const osRelease = await external_fs_default().promises.readFile("/etc/os-release")
    const match = osRelease.toString().match(/^ID=(.*)$/m)
    return match ? match[1] : "(unknown)"
  } catch (e) {
    return "(unknown)"
  }
}

;// CONCATENATED MODULE: ./src/index.js
// @ts-check











const TMATE_LINUX_VERSION = "2.4.0"

// Map os.arch() values to the architectures in tmate release binary filenames.
// Possible os.arch() values documented here:
// https://nodejs.org/api/os.html#os_os_arch
// Available tmate binaries listed here:
// https://github.com/tmate-io/tmate/releases/
const TMATE_ARCH_MAP = {
  arm64: 'arm64v8',
  x64: 'amd64',
};

/** @param {number} ms */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  try {
    /*  Indicates whether the POST action is running */
    if (!!core.getState('isPost')) {
      const message = core.getState('message')
      const tmate = core.getState('tmate')
      if (tmate && message) {
        const shutdown = async () => {
          core.error('Got signal')
          await execShellCommand(`${tmate} kill-session`)
          external_process_default().exit(1)
        }
        // This is needed to fully support canceling the post-job Action, for details see
        // https://docs.github.com/en/actions/managing-workflow-runs/canceling-a-workflow#steps-github-takes-to-cancel-a-workflow-run
        external_process_default().on('SIGINT', shutdown)
        external_process_default().on('SIGTERM', shutdown)
        core.debug("Waiting")
        const hasAnyoneConnectedYet = (() => {
          let result = false
          return async () => {
            return result ||=
              !didTmateQuit()
              && '0' !== await execShellCommand(`${tmate} display -p '#{tmate_num_clients}'`, { quiet: true })
          }
        })()
        for (let seconds = 10 * 60; seconds > 0; ) {
          console.log(`${
            await hasAnyoneConnectedYet()
            ? 'Waiting for session to end'
            : `Waiting for client to connect (at most ${seconds} more second(s))`
          }\n${message}`)

          if (continueFileExists()) {
            core.info("Exiting debugging session because the continue file was created")
            break
          }

          if (didTmateQuit()) {
            core.info("Exiting debugging session 'tmate' quit")
            break
          }

          await sleep(5000)
          if (!await hasAnyoneConnectedYet()) seconds -= 5
        }
      }
      return
    }

    let tmateExecutable = "tmate"
    if (core.getInput("install-dependencies") !== "false") {
      core.debug("Installing dependencies")
      if ((external_process_default()).platform === "darwin") {
        await execShellCommand('brew install tmate');
      } else if ((external_process_default()).platform === "win32") {
        await execShellCommand('pacman -S --noconfirm tmate');
      } else {
        const optionalSudoPrefix = useSudoPrefix() ? "sudo " : "";
        const distro = await getLinuxDistro();
        core.debug("linux distro: [" + distro + "]");
        if (distro === "alpine") {
          // for set -e workaround, we need to install bash because alpine doesn't have it
          await execShellCommand(optionalSudoPrefix + 'apk add openssh-client xz bash');
        } else if (distro === "arch") {
          // partial upgrades are not supported so also upgrade everything
          await execShellCommand(optionalSudoPrefix + 'pacman -Syu --noconfirm xz openssh');
        } else if (distro === "fedora") {
          await execShellCommand(optionalSudoPrefix + 'dnf install -y xz openssh');
        } else {
          await execShellCommand(optionalSudoPrefix + 'apt-get update');
          await execShellCommand(optionalSudoPrefix + 'apt-get install -y openssh-client xz-utils');
        }

        const tmateArch = TMATE_ARCH_MAP[external_os_default().arch()];
        if (!tmateArch) {
          throw new Error(`Unsupported architecture: ${external_os_default().arch()}`)
        }
        const tmateReleaseTar = await tool_cache.downloadTool(`https://github.com/tmate-io/tmate/releases/download/${TMATE_LINUX_VERSION}/tmate-${TMATE_LINUX_VERSION}-static-linux-${tmateArch}.tar.xz`);
        const tmateDir = external_path_default().join(external_os_default().tmpdir(), "tmate")
        tmateExecutable = external_path_default().join(tmateDir, "tmate")

        if (external_fs_default().existsSync(tmateExecutable))
          external_fs_default().unlinkSync(tmateExecutable)
        external_fs_default().mkdirSync(tmateDir, { recursive: true })
        await execShellCommand(`tar x -C ${tmateDir} -f ${tmateReleaseTar} --strip-components=1`)
        external_fs_default().unlinkSync(tmateReleaseTar)
      }
      core.debug("Installed dependencies successfully");
    }

    if ((external_process_default()).platform === "win32") {
      tmateExecutable = 'CHERE_INVOKING=1 tmate'
    } else {
      core.debug("Generating SSH keys")
      external_fs_default().mkdirSync(external_path_default().join(external_os_default().homedir(), ".ssh"), { recursive: true })
      try {
        await execShellCommand(`echo -e 'y\n'|ssh-keygen -q -t rsa -N "" -f ~/.ssh/id_rsa`);
      } catch { }
      core.debug("Generated SSH-Key successfully")
    }

    let newSessionExtra = ""
    let tmateSSHDashI = ""
    let publicSSHKeysWarning = ""
    const limitAccessToActor = core.getInput("limit-access-to-actor")
    if (limitAccessToActor === "true" || limitAccessToActor === "auto") {
      const { actor, apiUrl } = github.context
      const auth = core.getInput('github-token')
      const octokit = new rest.Octokit({ auth, baseUrl: apiUrl, request: { fetch }});

      const keys = await octokit.users.listPublicKeysForUser({
        username: actor
      })
      if (keys.data.length === 0) {
        if (limitAccessToActor === "auto") publicSSHKeysWarning = `No public SSH keys found for ${actor}; continuing without them even if it is less secure (please consider adding an SSH key, see https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)`
        else throw new Error(`No public SSH keys registered with ${actor}'s GitHub profile`)
      } else {
        const sshPath = external_path_default().join(external_os_default().homedir(), ".ssh")
        await external_fs_default().promises.mkdir(sshPath, { recursive: true })
        const authorizedKeysPath = external_path_default().join(sshPath, "authorized_keys")
        await external_fs_default().promises.writeFile(authorizedKeysPath, keys.data.map(e => e.key).join('\n'))
        newSessionExtra = `-a "${authorizedKeysPath}"`
        tmateSSHDashI = "ssh -i <path-to-private-SSH-key>"
      }
    }

    const tmate = `${tmateExecutable} -S /tmp/tmate.sock`;

    // Work around potential `set -e` commands in `~/.profile` (looking at you, `setup-miniconda`!)
    await execShellCommand(`echo 'set +e' >/tmp/tmate.bashrc`);
    let setDefaultCommand = `set-option -g default-command "bash --rcfile /tmp/tmate.bashrc" \\;`;

    // The regexes used here for validation are lenient, i.e. may accept
    // values that are not, strictly speaking, valid, but should be good
    // enough for detecting obvious errors, which is all we want here.
    const options = {
      "tmate-server-host": /^[a-z\d\-]+(\.[a-z\d\-]+)*$/i,
      "tmate-server-port": /^\d{1,5}$/,
      "tmate-server-rsa-fingerprint": /./,
      "tmate-server-ed25519-fingerprint": /./,
    }

    let host = "";
    let port = "";
    for (const [key, option] of Object.entries(options)) {
      const value = getValidatedEnvVars(key, option);
      if (value !== undefined) {
        setDefaultCommand = `${setDefaultCommand} set-option -g ${key} "${value}" \\;`;
        if (key === "tmate-server-host") {
          host = value;
        }
        if (key === "tmate-server-port") {
          port = value;
        }
      }
    }

    core.debug("Creating new session")
    await execShellCommand(`${tmate} ${newSessionExtra} ${setDefaultCommand} new-session -d`);
    await execShellCommand(`${tmate} wait tmate-ready`);
    core.debug("Created new session successfully")

    core.debug("Fetching connection strings")
    const tmateSSH = await execShellCommand(`${tmate} display -p '#{tmate_ssh}'`);
    const [ , ,tokenHost] = tmateSSH.split(" ");
    const [token, ] = tokenHost.split("@")
    const tmateWeb = await execShellCommand(`${tmate} display -p '#{tmate_web}'`);

    /*
      * Publish a variable so that when the POST action runs, it can determine
      * it should run the appropriate logic. This is necessary since we don't
      * have a separate entry point.
      *
      * Inspired by https://github.com/actions/checkout/blob/v3.1.0/src/state-helper.ts#L56-L60
      */
    core.saveState('isPost', 'true')

    const detached = core.getInput("detached")
    if (detached === "true") {
      core.debug("Entering detached mode")

      let message = ''
      if (publicSSHKeysWarning) {
        message += `::warning::${publicSSHKeysWarning}\n`
      }
      if (tmateWeb) {
        message += `::notice::Web shell: ${tmateWeb}\n`
      }
      message += `::notice::SSH: ${tmateSSH}\n`
      if (tmateSSHDashI) {
        message += `::notice::or: ${tmateSSH.replace(/^ssh/, tmateSSHDashI)}\n`
      }
      core.saveState('message', message)
      core.saveState('tmate', tmate)
      console.log(message)
      return
    }

    core.debug("Entering main loop")
    while (true) {
      if (publicSSHKeysWarning) {
        core.warning(publicSSHKeysWarning)
      }
      if (tmateWeb) {
        core.info(`Web shell: ${tmateWeb}`);
      }
      core.info(`SSH: ssh -p ${port} ${token}@${host}`);
      if (tmateSSHDashI) {
        core.info(`or: ${tmateSSH.replace(/^ssh/, tmateSSHDashI)}`)
      }

      if (continueFileExists()) {
        core.info("Exiting debugging session because the continue file was created")
        break
      }

      if (didTmateQuit()) {
        core.info("Exiting debugging session 'tmate' quit")
        break
      }

      await sleep(5000)
    }

  } catch (error) {
    core.setFailed(error);
  }
}

function didTmateQuit() {
  const tmateSocketPath = (external_process_default()).platform === "win32" ? "C:/msys64/tmp/tmate.sock" : "/tmp/tmate.sock"
  return !external_fs_default().existsSync(tmateSocketPath)
}

function continueFileExists() {
  const continuePath = (external_process_default()).platform === "win32" ? "C:/msys64/continue" : "/continue"
  return external_fs_default().existsSync(continuePath) || external_fs_default().existsSync(external_path_default().join((external_process_default()).env.GITHUB_WORKSPACE, "continue"))
}

;// CONCATENATED MODULE: ./src/main.js


run()
})();

module.exports = __webpack_exports__;
/******/ })()
;