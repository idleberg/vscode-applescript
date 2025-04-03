type CommandFlags = {
	executeOnly?: boolean;
	isJXA?: boolean;
	startupScreen?: boolean;
	stayOpen?: boolean;
};

type ActiveProcess = {
	created: number;
	file: string;
	process: string;
};
