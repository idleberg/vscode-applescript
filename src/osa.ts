// Dependencies
import { getConfig } from "vscode-get-config";
import { getOutName, spawnPromise } from "./util.ts";
import { platform } from "node:os";
import { window } from "vscode";

const outputChannel = window.createOutputChannel("AppleScript");

async function osacompile(
	compileTarget: string,
	options: CommandFlags = { isJXA: false },
): Promise<void> {
	const { ignoreOS, osacompile, showNotifications } =
		await getConfig("applescript");

	// might become useful in a future release
	options = { ...options, ...osacompile };

	if (platform() !== "darwin" && ignoreOS !== true) {
		window.showWarningMessage("This command is only available on macOS");
		return;
	}

	const doc = window.activeTextEditor?.document;

	if (!doc) {
		console.error("[idleberg.applescript] Document not found");
		return;
	}

	doc.save().then(() => {
		const outName = getOutName(doc.fileName, compileTarget);
		const args: string[] = ["-o", outName];

		if (options.isJXA === true) {
			args.push("-l", "JavaScript");
		}

		if (options.executeOnly === true) {
			args.push("-x");
		}

		if (compileTarget === "app" && options.stayOpen === true) {
			args.push("-s");
		}

		if (compileTarget === "app" && options.startupScreen === true) {
			args.push("-u");
		}

		args.push(doc.fileName);

		spawnPromise("osacompile", doc.fileName, args, outputChannel)
			.then(() => {
				if (showNotifications) {
					window.showInformationMessage(
						`Successfully compiled '${doc.fileName}'`,
					);
				}
			})
			.catch((error) => {
				console.error(
					"[idleberg.applescript]",
					error instanceof Error ? error.message : error,
				);

				outputChannel.show(true);

				if (showNotifications) {
					window.showErrorMessage(
						"Failed to compile or exited with error (see output for details)",
					);
				}
			});
	});
}

async function osascript(
	options: CommandFlags = { isJXA: false },
): Promise<void> {
	const { ignoreOS, osascript, showNotifications } =
		await getConfig("applescript");

	if (platform() !== "darwin" && ignoreOS !== true) {
		window.showWarningMessage("This command is only available on macOS");
		return;
	}

	const doc = window?.activeTextEditor?.document;

	if (!doc) {
		console.error("[idleberg.applescript] Document not found");
		return;
	}

	const args: string[] = [];

	if (doc.isDirty) {
		const lines = doc.getText().split("\n");

		lines.forEach(function (line) {
			args.push("-e", line);
		});
	} else {
		args.push(doc.fileName);
	}

	if (
		osascript.outputStyle.trim().length > 0 &&
		osascript.outputStyle.trim().length <= 2
	) {
		args.unshift("-s", osascript.outputStyle.trim());
	}

	if (options.isJXA === true) {
		args.unshift("-l", "JavaScript");
	}

	spawnPromise("osascript", doc.fileName, args, outputChannel).catch(
		(error) => {
			console.error(
				"[idleberg.applescript]",
				error instanceof Error ? error.message : error,
			);
			outputChannel.show(true);

			if (showNotifications) {
				window.showErrorMessage(
					"Failed to run script or exited with error (see output for details)",
				);
			}
		},
	);
}

export { osacompile, osascript };
